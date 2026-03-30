const prisma = require('../config/db');
const { comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');
const logger = require('../utils/logger');

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: 'USER' });

    logger.info(`User logged in: ${user.email}`);
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: 'USER' },
    });
  } catch (err) {
    next(err);
  }
};

const loginMentor = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const mentor = await prisma.mentor.findUnique({ where: { email } });
    if (!mentor) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const valid = await comparePassword(password, mentor.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken({ id: mentor.id, email: mentor.email, role: 'MENTOR' });

    logger.info(`Mentor logged in: ${mentor.email}`);
    res.json({
      success: true,
      token,
      user: { id: mentor.id, name: mentor.name, email: mentor.email, role: 'MENTOR' },
    });
  } catch (err) {
    next(err);
  }
};

const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const valid = await comparePassword(password, admin.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken({ id: admin.id, email: admin.email, role: 'ADMIN' });

    logger.info(`Admin logged in: ${admin.email}`);
    res.json({
      success: true,
      token,
      user: { id: admin.id, email: admin.email, role: 'ADMIN' },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { loginUser, loginMentor, loginAdmin };
