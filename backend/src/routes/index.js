const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const mentorRoutes = require('./mentor.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/mentor', mentorRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'MentorQue API is running', timestamp: new Date().toISOString() });
});

module.exports = router;
