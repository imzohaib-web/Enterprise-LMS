const express = require('express');
const notificationController = require('./notification.controller');
const InstructorController = require('../instructor/instructor.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all notification endpoints
router.use(protect);

// GET /api/v1/notifications (Paginated notifications list)
router.get('/', notificationController.getNotifications);

// GET /api/v1/notifications/unread-count
router.get('/unread-count', notificationController.getUnreadCount);

// GET /api/v1/notifications/sent (Instructor Sent Notifications)
router.get('/sent', InstructorController.getSentNotifications);

// POST /api/v1/notifications/send (Instructor Send Notification)
router.post('/send', InstructorController.sendNotification);

// PATCH /api/v1/notifications/read-all (Must be placed before /:id/read)
router.patch('/read-all', notificationController.markAllAsRead);

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', notificationController.markAsRead);

// DELETE /api/v1/notifications/:id
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
