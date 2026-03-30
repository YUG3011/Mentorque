const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

module.exports = { generateToken, verifyToken };
