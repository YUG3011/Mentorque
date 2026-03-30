const express = require('express');
const {
	addAvailability,
	deleteAvailability,
	getMyAvailability,
	getProfile,
	getMyBookings,
	getRescheduleOptions,
	requestBookingChange,
} = require('../controllers/mentor.controller');
const authMiddleware = require('../middleware/auth.middleware');
const checkRole = require('../middleware/role.middleware');

const router = express.Router();

// All mentor routes require MENTOR role
router.use(authMiddleware, checkRole('MENTOR'));

router.get('/me', getProfile);
router.post('/availability', addAvailability);
router.delete('/availability/:slotId', deleteAvailability);
router.get('/availability', getMyAvailability);
router.get('/bookings', getMyBookings);
router.get('/bookings/:bookingId/reschedule-options', getRescheduleOptions);
router.post('/bookings/:bookingId/request-change', requestBookingChange);

module.exports = router;
