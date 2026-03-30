const express = require('express');
const {
  getAllUsers,
  getAllMentors,
  getRecommendations,
  getAvailabilityOverlap,
  bookCall,
  getAllBookings,
  decideBookingRequest,
  updateMentorMetadata,
} = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const checkRole = require('../middleware/role.middleware');

const router = express.Router();

// All admin routes require ADMIN role
router.use(authMiddleware, checkRole('ADMIN'));

router.get('/users', getAllUsers);
router.get('/mentors', getAllMentors);
router.get('/recommendations/:userId', getRecommendations);
router.get('/availability-overlap', getAvailabilityOverlap);
router.post('/book', bookCall);
router.get('/bookings', getAllBookings);
router.patch('/bookings/:bookingId/request-decision', decideBookingRequest);
router.patch('/mentors/:mentorId', updateMentorMetadata);

module.exports = router;
