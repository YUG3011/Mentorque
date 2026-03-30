/**
 * Availability Service
 * Handles overlap detection between user and mentor availability
 */

/**
 * Check if two time slots overlap
 * Overlap exists if: (start1 < end2) AND (start2 < end1)
 */
function slotsOverlap(slot1, slot2) {
  const toMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const start1 = toMinutes(slot1.startTime);
  const end1 = toMinutes(slot1.endTime);
  const start2 = toMinutes(slot2.startTime);
  const end2 = toMinutes(slot2.endTime);

  return start1 < end2 && start2 < end1;
}

/**
 * Find all overlapping slots between user and mentor availabilities
 */
function findOverlaps(userAvailabilities, mentorAvailabilities) {
  const overlaps = [];

  for (const userSlot of userAvailabilities) {
    for (const mentorSlot of mentorAvailabilities) {
      if (userSlot.date === mentorSlot.date && slotsOverlap(userSlot, mentorSlot)) {
        const overlapStart = laterTime(userSlot.startTime, mentorSlot.startTime);
        const overlapEnd = earlierTime(userSlot.endTime, mentorSlot.endTime);

        overlaps.push({
          date: userSlot.date,
          startTime: overlapStart,
          endTime: overlapEnd,
          userSlotId: userSlot.id,
          mentorSlotId: mentorSlot.id,
        });
      }
    }
  }

  return overlaps;
}

function toMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function toTimeString(minutes) {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function laterTime(t1, t2) {
  return toMinutes(t1) >= toMinutes(t2) ? t1 : t2;
}

function earlierTime(t1, t2) {
  return toMinutes(t1) <= toMinutes(t2) ? t1 : t2;
}

module.exports = { findOverlaps, slotsOverlap };
