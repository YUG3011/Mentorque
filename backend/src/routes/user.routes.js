const express = require('express');
const {
	getMe,
	updateProfile,
	addAvailability,
	getMyAvailability,
	getMyBookings,
	cancelMyBooking,
} = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const checkRole = require('../middleware/role.middleware');

const router = express.Router();

// All user routes require authentication and USER role
router.use(authMiddleware, checkRole('USER'));

router.get('/me', getMe);
router.post('/profile', updateProfile);
router.post('/availability', addAvailability);
router.get('/availability', getMyAvailability);
router.get('/bookings', getMyBookings);
router.patch('/bookings/:bookingId/cancel', cancelMyBooking);

module.exports = router;
