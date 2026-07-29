const { z } = require('zod');

const getNotificationsQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  category: z.enum(['assessment', 'certificate', 'course', 'progress', 'discussion', 'system']).optional(),
  isRead: z.string().optional().transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
});

const notificationIdParamSchema = z.object({
  id: z.string().min(1, 'Notification ID is required'),
});

const createNotificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['info', 'success', 'warning', 'error']).optional().default('info'),
  category: z.enum(['assessment', 'certificate', 'course', 'progress', 'discussion', 'system']).optional().default('system'),
  actionUrl: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

module.exports = {
  getNotificationsQuerySchema,
  notificationIdParamSchema,
  createNotificationSchema,
};
