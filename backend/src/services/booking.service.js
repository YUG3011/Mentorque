const prisma = require('../config/db');
const { findOverlaps } = require('./availability.service');

/**
 * Validate that the requested slot overlaps with both user and mentor availability
 */
async function validateBookingSlot(userId, mentorId, date, startTime, endTime) {
  const userAvail = await prisma.availability.findMany({ where: { userId } });
  const mentorAvail = await prisma.availability.findMany({ where: { mentorId } });

  const overlaps = findOverlaps(userAvail, mentorAvail);

  const requestedSlot = { date, startTime, endTime };

  const isValid = overlaps.some(
    (overlap) =>
      overlap.date === date &&
      overlap.startTime <= startTime &&
      overlap.endTime >= endTime
  );

  return { isValid, overlaps };
}

/**
 * Create a booking record
 */
async function createBooking(data) {
  const { userId, mentorId, date, startTime, endTime, callType } = data;

  const booking = await prisma.booking.create({
    data: { userId, mentorId, date, startTime, endTime, callType },
    include: {
      user: { select: { id: true, name: true, email: true } },
      mentor: { select: { id: true, name: true, email: true } },
    },
  });

  return booking;
}

module.exports = { validateBookingSlot, createBooking };
