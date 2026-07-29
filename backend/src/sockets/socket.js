const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.IO with HTTP Server instance
 */
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join personal user room for targeted notifications
    socket.on('join-room', (userId) => {
      if (userId) {
        const roomName = `user:${userId}`;
        socket.join(roomName);
        console.log(`[Socket.IO] Socket ${socket.id} joined room ${roomName}`);
      }
    });

    // Join course room for discussion updates
    socket.on('join-course', (courseId) => {
      if (courseId) {
        const roomName = `course:${courseId}`;
        socket.join(roomName);
        console.log(`[Socket.IO] Socket ${socket.id} joined course room ${roomName}`);
      }
    });

    // Join specific discussion room for live replies
    socket.on('join-discussion', (discussionId) => {
      if (discussionId) {
        const roomName = `discussion:${discussionId}`;
        socket.join(roomName);
        console.log(`[Socket.IO] Socket ${socket.id} joined discussion room ${roomName}`);
      }
    });

    // Leave room on disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get active Socket.IO server instance
 */
const getIO = () => {
  if (!io) {
    console.warn('[Socket.IO] io instance accessed before initialization.');
  }
  return io;
};

/**
 * Emit real-time notification event to a specific user
 */
const emitNotificationToUser = (userId, notificationData) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit('notification', notificationData);
  }
};

/**
 * Emit updated unread count to a specific user
 */
const emitUnreadCountToUser = (userId, count) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit('unread-count', { unreadCount: count });
  }
};

/**
 * Emit real-time dashboard refresh signal to all clients
 */
const emitDashboardRefresh = () => {
  if (io) {
    io.emit('dashboard-refresh', { timestamp: new Date().toISOString() });
  }
};

module.exports = {
  initSocket,
  getIO,
  emitNotificationToUser,
  emitUnreadCountToUser,
  emitDashboardRefresh,
};
