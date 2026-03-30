const app = require('./app');
const config = require('./config/env');
const prisma = require('./config/db');
const logger = require('./utils/logger');

const startServer = async () => {
  try {
    // Test DB connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    app.listen(config.port, () => {
      logger.info(`🚀 MentorQue API running on port ${config.port}`);
      logger.info(`📡 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 API Base URL: http://localhost:${config.port}/api`);
    });
  } catch (error) {
    logger.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
