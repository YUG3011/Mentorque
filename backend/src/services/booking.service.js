const prisma = require('../config/db');
const { findOverlaps } = require('./availability.service');

const ACTIVE_BOOKING_STATUS = 'CANCELED';

/**
 * Validate that the requested slot overlaps with both user and mentor availability
 */
async function validateBookingSlot(userId, mentorId, date, startTime, endTime) {
  const userAvail = await prisma.availability.findMany({ where: { userId } });
  const mentorAvail = await prisma.availability.findMany({ where: { mentorId } });

  const overlaps = findOverlaps(userAvail, mentorAvail);

  const isValid = overlaps.some(
    (overlap) =>
      overlap.date === date &&
      overlap.startTime <= startTime &&
      overlap.endTime >= endTime
  );

  return { isValid, overlaps };
}

/**
 * Check if the user or mentor is already booked in the requested slot.
 * Canceled bookings are ignored.
 */
async function findActiveBookingConflicts({ userId, mentorId, date, startTime, endTime, excludeBookingId }) {
  const overlapCondition = {
    date,
    startTime: { lt: endTime },
    endTime: { gt: startTime },
    status: { not: ACTIVE_BOOKING_STATUS },
    ...(excludeBookingId && { id: { not: excludeBookingId } }),
  };

  const [userConflicts, mentorConflicts] = await Promise.all([
    prisma.booking.findMany({
      where: {
        ...overlapCondition,
        userId,
      },
      select: { id: true, date: true, startTime: true, endTime: true, status: true },
    }),
    prisma.booking.findMany({
      where: {
        ...overlapCondition,
        mentorId,
      },
      select: { id: true, date: true, startTime: true, endTime: true, status: true },
    }),
  ]);

  return {
    hasConflicts: userConflicts.length > 0 || mentorConflicts.length > 0,
    userConflicts,
    mentorConflicts,
  };
}

/**
 * Create a booking record
 */
async function createBooking(data) {
  const { userId, mentorId, date, startTime, endTime, callType } = data;

  const { hasConflicts, userConflicts, mentorConflicts } = await findActiveBookingConflicts({
    userId,
    mentorId,
    date,
    startTime,
    endTime,
  });

  if (hasConflicts) {
    const error = new Error('Selected slot is already booked for user or mentor');
    error.statusCode = 409;
    error.details = { userConflicts, mentorConflicts };
    throw error;
  }

  const booking = await prisma.booking.create({
    data: { userId, mentorId, date, startTime, endTime, callType },
    include: {
      user: { select: { id: true, name: true, email: true } },
      mentor: { select: { id: true, name: true, email: true } },
    },
  });

  return booking;
}

module.exports = { validateBookingSlot, findActiveBookingConflicts, createBooking };
