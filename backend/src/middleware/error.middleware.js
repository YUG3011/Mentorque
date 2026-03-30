const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  logger.error(`${err.message} - ${req.method} ${req.originalUrl}`);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
