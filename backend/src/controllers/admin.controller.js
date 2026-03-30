const prisma = require('../config/db');
const { scoreMentors } = require('../services/recommendation.service');
const { findOverlaps } = require('../services/availability.service');
const { validateBookingSlot, findActiveBookingConflicts, createBooking } = require('../services/booking.service');
const logger = require('../utils/logger');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        tags: true,
        description: true,
        createdAt: true,
        _count: { select: { availability: true, bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

const getAllMentors = async (req, res, next) => {
  try {
    const mentors = await prisma.mentor.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        tags: true,
        description: true,
        createdAt: true,
        _count: { select: { availability: true, bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, count: mentors.length, data: mentors });
  } catch (err) {
    next(err);
  }
};

const getRecommendations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { callType } = req.query;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const mentors = await prisma.mentor.findMany();
    const recommendations = scoreMentors(user, mentors, callType);

    res.json({
      success: true,
      user: { id: user.id, name: user.name, tags: user.tags },
      callType: callType || 'General',
      recommendations,
    });
  } catch (err) {
    next(err);
  }
};

const getAvailabilityOverlap = async (req, res, next) => {
  try {
    const { userId, mentorId } = req.query;

    if (!userId || !mentorId) {
      return res.status(400).json({ success: false, message: 'userId and mentorId are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const mentor = await prisma.mentor.findUnique({ where: { id: mentorId } });

    if (!user || !mentor) {
      return res.status(404).json({ success: false, message: 'User or mentor not found' });
    }

    const userAvail = await prisma.availability.findMany({
      where: { userId },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    const mentorAvail = await prisma.availability.findMany({
      where: { mentorId },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    const overlaps = findOverlaps(userAvail, mentorAvail);

    res.json({
      success: true,
      user: { id: user.id, name: user.name },
      mentor: { id: mentor.id, name: mentor.name },
      overlapsCount: overlaps.length,
      overlaps,
      userAvailability: userAvail,
      mentorAvailability: mentorAvail,
    });
  } catch (err) {
    next(err);
  }
};

const bookCall = async (req, res, next) => {
  try {
    const { userId, mentorId, date, startTime, endTime, callType } = req.body;

    if (!userId || !mentorId || !date || !startTime || !endTime || !callType) {
      return res.status(400).json({
        success: false,
        message: 'userId, mentorId, date, startTime, endTime, and callType are required',
      });
    }

    const validCallTypes = ['Resume Revamp', 'Job Market Guidance', 'Mock Interviews'];
    if (!validCallTypes.includes(callType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid call type. Must be one of: ${validCallTypes.join(', ')}`,
      });
    }

    const { isValid, overlaps } = await validateBookingSlot(userId, mentorId, date, startTime, endTime);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'No overlapping availability found for the selected slot. Please choose from available overlapping slots.',
        availableOverlaps: overlaps,
      });
    }

    const conflicts = await findActiveBookingConflicts({ userId, mentorId, date, startTime, endTime });
    if (conflicts.hasConflicts) {
      return res.status(409).json({
        success: false,
        message: 'Selected slot is already booked for this user or mentor',
        conflicts,
      });
    }

    const booking = await createBooking({ userId, mentorId, date, startTime, endTime, callType });

    logger.info(`Booking created by admin: ${userId} with ${mentorId} on ${date}`);
    res.status(201).json({ success: true, message: 'Call booked successfully', data: booking });
  } catch (err) {
    next(err);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        mentor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
};

const decideBookingRequest = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { action, date, startTime, endTime } = req.body;

    if (!action) {
      return res.status(400).json({ success: false, message: 'action is required' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        mentor: { select: { id: true, name: true, email: true } },
      },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.mentorRequestStatus !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'No pending mentor request for this booking' });
    }

    if (!['APPROVE_CANCEL', 'APPROVE_RESCHEDULE', 'REJECT_REQUEST'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    let updated;

    if (action === 'APPROVE_CANCEL') {
      if (booking.mentorRequestType !== 'CANCEL') {
        return res.status(400).json({ success: false, message: 'Pending request type is not CANCEL' });
      }

      updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELED',
          cancellationReason: booking.mentorRequestReason || 'Canceled by admin approval',
          cancelledByRole: 'MENTOR',
          mentorRequestStatus: 'APPROVED',
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          mentor: { select: { id: true, name: true, email: true } },
        },
      });
    } else if (action === 'APPROVE_RESCHEDULE') {
      if (booking.mentorRequestType !== 'RESCHEDULE') {
        return res.status(400).json({ success: false, message: 'Pending request type is not RESCHEDULE' });
      }

      const targetDate = date || booking.proposedDate;
      const targetStart = startTime || booking.proposedStartTime;
      const targetEnd = endTime || booking.proposedEndTime;

      if (!targetDate || !targetStart || !targetEnd) {
        return res.status(400).json({ success: false, message: 'Reschedule slot is incomplete' });
      }

      const mentorSlotExists = await prisma.availability.findFirst({
        where: {
          mentorId: booking.mentorId,
          date: targetDate,
          startTime: targetStart,
          endTime: targetEnd,
        },
      });

      if (!mentorSlotExists) {
        return res.status(400).json({
          success: false,
          message: 'Requested reschedule slot is not in mentor availability',
        });
      }

      const conflicts = await findActiveBookingConflicts({
        userId: booking.userId,
        mentorId: booking.mentorId,
        date: targetDate,
        startTime: targetStart,
        endTime: targetEnd,
        excludeBookingId: booking.id,
      });

      if (conflicts.hasConflicts) {
        return res.status(409).json({
          success: false,
          message: 'Requested reschedule slot is already booked for this user or mentor',
          conflicts,
        });
      }

      updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          date: targetDate,
          startTime: targetStart,
          endTime: targetEnd,
          status: 'CONFIRMED',
          mentorRequestStatus: 'APPROVED',
          mentorRequestType: null,
          mentorRequestReason: null,
          proposedDate: null,
          proposedStartTime: null,
          proposedEndTime: null,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          mentor: { select: { id: true, name: true, email: true } },
        },
      });
    } else {
      updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { mentorRequestStatus: 'REJECTED' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          mentor: { select: { id: true, name: true, email: true } },
        },
      });
    }

    logger.info(`Admin request decision: booking=${bookingId} action=${action}`);
    res.json({ success: true, message: 'Request processed successfully', data: updated });
  } catch (err) {
    next(err);
  }
};

const updateMentorMetadata = async (req, res, next) => {
  try {
    const { mentorId } = req.params;
    const { tags, description } = req.body;

    const mentor = await prisma.mentor.update({
      where: { id: mentorId },
      data: {
        ...(tags !== undefined && { tags }),
        ...(description !== undefined && { description }),
      },
      select: { id: true, name: true, email: true, tags: true, description: true },
    });

    res.json({ success: true, message: 'Mentor metadata updated', data: mentor });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getAllMentors,
  getRecommendations,
  getAvailabilityOverlap,
  bookCall,
  getAllBookings,
  decideBookingRequest,
  updateMentorMetadata,
};
