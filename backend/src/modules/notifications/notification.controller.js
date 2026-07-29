const notificationService = require('./notification.service');
const { sendSuccess } = require('../../utils/apiResponse');

/**
 * GET /api/v1/notifications
 * Get paginated notifications for the authenticated user
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit, category, isRead } = req.query;

    const result = await notificationService.getUserNotifications(userId, {
      page,
      limit,
      category,
      isRead,
    });

    return sendSuccess(res, 200, 'Notifications retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/notifications/unread-count
 * Get count of unread notifications
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const unreadCount = await notificationService.getUnreadCount(userId);

    return sendSuccess(res, 200, 'Unread notification count retrieved', { unreadCount });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a single notification as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await notificationService.markAsRead(id, userId);

    return sendSuccess(res, 200, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all unread notifications for user as read
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await notificationService.markAllAsRead(userId);

    return sendSuccess(res, 200, 'All notifications marked as read', result);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/notifications/:id
 * Delete a notification
 */
const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await notificationService.deleteNotification(id, userId);

    return sendSuccess(res, 200, 'Notification deleted successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
