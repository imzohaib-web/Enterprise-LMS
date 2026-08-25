const Notification = require('./notification.model');
const AppError = require('../../utils/appError');
const { emitNotificationToUser, emitUnreadCountToUser } = require('../../sockets/socket');

const mongoose = require('mongoose');

/**
 * Get paginated notifications for a specific user
 */
const buildUserQuery = (userId) => {
  if (!userId) return {};
  const strId = userId.toString ? userId.toString() : String(userId);
  let objId = null;
  if (mongoose.Types.ObjectId.isValid(userId)) {
    objId = new mongoose.Types.ObjectId(userId);
  }
  const conditions = [
    { userId: strId },
    { recipient: strId },
    { 'metadata.recipientId': strId },
  ];
  if (objId) {
    conditions.push({ userId: objId }, { recipient: objId });
  }
  return { $or: conditions };
};

/**
 * Get paginated notifications for a specific user
 */
const buildUserQuery = (userId) => {
  if (!userId) return {};
  const strId = userId.toString ? userId.toString() : String(userId);
  return {
    $or: [
      { userId },
      { recipient: userId },
      { userId: strId },
      { recipient: strId }
    ]
  };
};

/**
 * Get paginated notifications for a specific user
 */
const getUserNotifications = async (userId, options = {}) => {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(options.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const query = buildUserQuery(userId);

  if (options.category && options.category !== 'all') {
    query.category = options.category;
  }

  if (typeof options.isRead === 'boolean') {
    query.isRead = options.isRead;
  }

  const [rawNotifications, total] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(query),
  ]);

  const notifications = rawNotifications.map((n) => ({
    ...n,
    id: n._id.toString(),
    _id: n._id.toString(),
  }));

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Get unread notifications count for a user
 */
const getUnreadCount = async (userId) => {
  const userQuery = buildUserQuery(userId);
  const count = await Notification.countDocuments({ ...userQuery, isRead: false });
  return count;
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (notificationId, userId) => {
  const userQuery = buildUserQuery(userId);
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, ...userQuery },
    { $set: { isRead: true } },
    { new: true }
  );

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  const unreadCount = await getUnreadCount(userId);
  emitUnreadCountToUser(userId, unreadCount);

  return notification;
};

/**
 * Mark all unread notifications for a user as read
 */
const markAllAsRead = async (userId) => {
  const userQuery = buildUserQuery(userId);
  await Notification.updateMany(
    { ...userQuery, isRead: false },
    { $set: { isRead: true } }
  );

  emitUnreadCountToUser(userId, 0);

  return { message: 'All notifications marked as read' };
};

/**
 * Delete a notification
 */
const deleteNotification = async (notificationId, userId) => {
  const userQuery = buildUserQuery(userId);
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    ...userQuery
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  const unreadCount = await getUnreadCount(userId);
  emitUnreadCountToUser(userId, unreadCount);

  return { message: 'Notification deleted successfully' };
};

/**
 * Create a new notification, persist it to MongoDB, and emit real-time Socket event
 */
const createAndEmitNotification = async (notificationData) => {
  const notification = await Notification.create({
    userId: notificationData.userId,
    recipient: notificationData.userId,
    title: notificationData.title,
    message: notificationData.message,
    type: notificationData.type || 'info',
    category: notificationData.category || 'system',
    actionUrl: notificationData.actionUrl || '',
    metadata: notificationData.metadata || {},
  });

  const plainNotification = notification.toObject();

  // Real-time socket emissions
  emitNotificationToUser(notificationData.userId, plainNotification);

  const unreadCount = await getUnreadCount(notificationData.userId);
  emitUnreadCountToUser(notificationData.userId, unreadCount);

  return plainNotification;
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createAndEmitNotification,
};
