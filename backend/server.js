'use strict';
require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { getRedis } = require('./src/config/redis');
const config = require('./src/config/env');

const PORT = config.port;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Warm up Redis (non-blocking)
  try {
    const redis = getRedis();
    if (redis) await redis.connect().catch(() => {});
  } catch {
    console.warn('⚠️  Redis skipped – running without cache');
  }

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`\n🚀 Enterprise LMS API running on port ${PORT}`);
    console.log(`📖 Swagger docs: http://localhost:${PORT}/api/v1/docs`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/v1/health`);
    console.log(`🌍 Environment:  ${config.nodeEnv}\n`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n${signal} received – shutting down gracefully...`);
    server.close(async () => {
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      console.log('✅ Server and DB connections closed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000); // Force exit after 10s
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('💥 Unhandled Rejection:', reason);
  });
};

startServer();
