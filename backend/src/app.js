require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const errorMiddleware = require('./middleware/error.middleware');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Error handler
app.use(errorMiddleware);

module.exports = app;
