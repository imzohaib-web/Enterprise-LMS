'use strict';
const http = require('http');
const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets/socket');
const config = require('./config/env');

const PORT = config.port || 5000;

// Create HTTP server wrapping Express app
const server = http.createServer(app);

// Initialize Socket.IO with server
initSocket(server);

// Connect to MongoDB and start server
(async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Enterprise LMS Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1);
  }
})();
