const prisma = require('../config/db');
const logger = require('../utils/logger');

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, tags: true, description: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { tags, description } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(tags !== undefined && { tags }),
        ...(description !== undefined && { description }),
      },
      select: { id: true, name: true, email: true, tags: true, description: true },
    });

    logger.info(`User profile updated: ${req.user.email}`);
    res.json({ success: true, message: 'Profile updated', data: updated });
  } catch (err) {
    next(err);
  }
};

const addAvailability = async (req, res, next) => {
  try {
    const { date, startTime, endTime } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'date, startTime, and endTime are required' });
    }

    const availability = await prisma.availability.create({
      data: { userId: req.user.id, date, startTime, endTime },
    });

    logger.info(`User availability added: ${req.user.email} on ${date}`);
    res.status(201).json({ success: true, message: 'Availability added', data: availability });
  } catch (err) {
    next(err);
  }
};

const getMyAvailability = async (req, res, next) => {
  try {
    const availabilities = await prisma.availability.findMany({
      where: { userId: req.user.id },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    res.json({ success: true, data: availabilities });
  } catch (err) {
    next(err);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        mentor: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
};

const cancelMyBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'CANCELED') {
      return res.status(400).json({ success: false, message: 'Booking is already canceled' });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELED',
        cancellationReason: reason || 'Canceled by user',
        cancelledByRole: 'USER',
        mentorRequestType: null,
        mentorRequestReason: null,
        mentorRequestStatus: null,
        proposedDate: null,
        proposedStartTime: null,
        proposedEndTime: null,
      },
      include: {
        mentor: { select: { id: true, name: true, email: true } },
      },
    });

    logger.info(`Booking canceled by user: ${req.user.email} booking=${bookingId}`);
    res.json({ success: true, message: 'Booking canceled successfully', data: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateProfile, addAvailability, getMyAvailability, getMyBookings, cancelMyBooking };
