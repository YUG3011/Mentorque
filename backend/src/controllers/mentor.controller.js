const prisma = require('../config/db');
const logger = require('../utils/logger');

const addAvailability = async (req, res, next) => {
  try {
    const { date, startTime, endTime } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'date, startTime, and endTime are required' });
    }

    const existing = await prisma.availability.findFirst({
      where: { mentorId: req.user.id, date, startTime, endTime },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'This availability slot already exists' });
    }

    const availability = await prisma.availability.create({
      data: { mentorId: req.user.id, date, startTime, endTime },
    });

    logger.info(`Mentor availability added: ${req.user.email} on ${date}`);
    res.status(201).json({ success: true, message: 'Availability added', data: availability });
  } catch (err) {
    next(err);
  }
};

const deleteAvailability = async (req, res, next) => {
  try {
    const { slotId } = req.params;

    const slot = await prisma.availability.findUnique({ where: { id: slotId } });
    if (!slot || slot.mentorId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Availability slot not found' });
    }

    await prisma.availability.delete({ where: { id: slotId } });
    res.json({ success: true, message: 'Availability slot deleted' });
  } catch (err) {
    next(err);
  }
};

const getMyAvailability = async (req, res, next) => {
  try {
    const availabilities = await prisma.availability.findMany({
      where: { mentorId: req.user.id },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    res.json({ success: true, data: availabilities });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const mentor = await prisma.mentor.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, tags: true, description: true, createdAt: true },
    });

    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }

    res.json({ success: true, data: mentor });
  } catch (err) {
    next(err);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { mentorId: req.user.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
};

const getRescheduleOptions = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.mentorId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const mentorAvail = await prisma.availability.findMany({
      where: { mentorId: booking.mentorId },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    // Return mentor's own saved slots as reschedule options and remove duplicates.
    const uniqueMap = new Map();
    for (const slot of mentorAvail) {
      const key = `${slot.date}|${slot.startTime}|${slot.endTime}`;
      if (!uniqueMap.has(key)) uniqueMap.set(key, slot);
    }

    const uniqueSlots = Array.from(uniqueMap.values());
    res.json({ success: true, count: uniqueSlots.length, data: uniqueSlots });
  } catch (err) {
    next(err);
  }
};

const requestBookingChange = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { type, reason, proposedDate, proposedStartTime, proposedEndTime } = req.body;

    if (!type || !reason) {
      return res.status(400).json({ success: false, message: 'type and reason are required' });
    }

    if (!['CANCEL', 'RESCHEDULE'].includes(type)) {
      return res.status(400).json({ success: false, message: 'type must be CANCEL or RESCHEDULE' });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.mentorId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'CANCELED') {
      return res.status(400).json({ success: false, message: 'Cannot request changes for a canceled booking' });
    }

    if (type === 'RESCHEDULE' && (!proposedDate || !proposedStartTime || !proposedEndTime)) {
      return res.status(400).json({
        success: false,
        message: 'proposedDate, proposedStartTime, and proposedEndTime are required for RESCHEDULE requests',
      });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        mentorRequestType: type,
        mentorRequestReason: reason,
        mentorRequestStatus: 'PENDING',
        proposedDate: type === 'RESCHEDULE' ? proposedDate : null,
        proposedStartTime: type === 'RESCHEDULE' ? proposedStartTime : null,
        proposedEndTime: type === 'RESCHEDULE' ? proposedEndTime : null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ success: true, message: 'Request sent to admin', data: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addAvailability,
  deleteAvailability,
  getMyAvailability,
  getProfile,
  getMyBookings,
  getRescheduleOptions,
  requestBookingChange,
};
