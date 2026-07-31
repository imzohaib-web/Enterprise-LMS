const { DiscussionModel, ReplyModel } = require('./discussion.model');
const AppError = require('../../utils/appError');
const socketService = require('../../sockets/socket');

let notificationService: any = null;
try {
  notificationService = require('../notifications/notification.service');
} catch (e) {
  // Graceful fallback if notification service is unavailable
}

export interface UserContext {
  id: string;
  name?: string;
  email?: string;
  role: string;
  avatar?: string;
}

export class DiscussionService {
  /**
   * Get all discussions for a course with search, filter, sort, and pagination.
   * Pinned discussions always appear first.
   */
  async getDiscussionsByCourse(courseId: string, options: any = {}) {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(options.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query: any = { courseId };

    if (options.search) {
      const searchRegex = new RegExp(options.search, 'i');
      query.$or = [{ title: searchRegex }, { content: searchRegex }, { tags: searchRegex }];
    }

    if (options.filter === 'pinned') {
      query.isPinned = true;
    } else if (options.filter === 'active') {
      query.repliesCount = { $gt: 0 };
    }

    // Determine sorting criteria
    let sortObj: any = {};
    if (options.sort === 'oldest') {
      sortObj = { isPinned: -1, createdAt: 1 };
    } else if (options.sort === 'replies') {
      sortObj = { isPinned: -1, repliesCount: -1, createdAt: -1 };
    } else {
      // Default: 'latest' or recent filter
      sortObj = { isPinned: -1, createdAt: -1 };
    }

    const [discussions, total] = await Promise.all([
      DiscussionModel.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      DiscussionModel.countDocuments(query),
    ]);

    return {
      discussions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Fetch single discussion details with all replies.
   */
  async getDiscussionById(discussionId: string) {
    const discussion = await DiscussionModel.findById(discussionId).lean();
    if (!discussion) {
      throw new AppError(`Discussion not found with ID: ${discussionId}`, 404);
    }

    const replies = await ReplyModel.find({ discussionId }).sort({ createdAt: 1 }).lean();

    return {
      ...discussion,
      replies,
    };
  }

  /**
   * Create a new discussion post.
   */
  async createDiscussion(author: UserContext, data: any) {
    const discussion = await DiscussionModel.create({
      courseId: data.courseId,
      authorId: author.id,
      authorName: author.name || 'Anonymous User',
      authorRole: author.role || 'student',
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      attachments: data.attachments || [],
      isPinned: false,
      isLocked: false,
      likes: [],
      likesCount: 0,
      repliesCount: 0,
    });

    const result = discussion.toObject();

    // Emit Socket.IO event
    if (socketService && typeof socketService.getIO === 'function') {
      const io = socketService.getIO();
      if (io) {
        io.to(`course:${data.courseId}`).emit('discussion:created', result);
        io.emit('discussion:created', result);
      }
    }

    // Notify instructor if created by student
    if (author.role === 'student' && notificationService && notificationService.createAndEmitNotification) {
      try {
        await notificationService.createAndEmitNotification({
          userId: 'instructor-1', // Default target instructor room/id or course instructor
          title: 'New Student Discussion Post',
          message: `${author.name || 'A student'} created a new discussion: "${data.title}"`,
          type: 'info',
          category: 'discussion',
          actionUrl: `/discussions/${result._id}`,
        });
      } catch (err) {
        // Non-blocking notification fallback
      }
    }

    return result;
  }

  /**
   * Update a discussion. Students can only update their own posts.
   */
  async updateDiscussion(discussionId: string, user: UserContext, updateData: any) {
    const discussion = await DiscussionModel.findById(discussionId);
    if (!discussion) {
      throw new AppError('Discussion not found', 404);
    }

    if (user.role !== 'instructor' && user.role !== 'admin' && String(discussion.authorId) !== String(user.id)) {
      throw new AppError('You do not have permission to edit this discussion', 403);
    }

    if (updateData.title !== undefined) discussion.title = updateData.title;
    if (updateData.content !== undefined) discussion.content = updateData.content;
    if (updateData.tags !== undefined) discussion.tags = updateData.tags;
    if (updateData.attachments !== undefined) discussion.attachments = updateData.attachments;

    await discussion.save();
    return discussion.toObject();
  }

  /**
   * Delete a discussion and all its replies.
   */
  async deleteDiscussion(discussionId: string, user: UserContext) {
    const discussion = await DiscussionModel.findById(discussionId);
    if (!discussion) {
      throw new AppError('Discussion not found', 404);
    }

    if (user.role !== 'instructor' && user.role !== 'admin' && String(discussion.authorId) !== String(user.id)) {
      throw new AppError('You do not have permission to delete this discussion', 403);
    }

    await Promise.all([
      DiscussionModel.findByIdAndDelete(discussionId),
      ReplyModel.deleteMany({ discussionId }),
    ]);

    return { id: discussionId, message: 'Discussion deleted successfully' };
  }

  /**
   * Add a reply to a discussion.
   */
  async createReply(discussionId: string, author: UserContext, replyData: any) {
    const discussion = await DiscussionModel.findById(discussionId);
    if (!discussion) {
      throw new AppError('Discussion not found', 404);
    }

    if (discussion.isLocked) {
      throw new AppError('This discussion is locked. New replies are disabled.', 400);
    }

    const reply = await ReplyModel.create({
      discussionId,
      authorId: author.id,
      authorName: author.name || 'Anonymous User',
      authorRole: author.role || 'student',
      content: replyData.content,
      parentReplyId: replyData.parentReplyId || null,
      likes: [],
      likesCount: 0,
    });

    // Increment discussion repliesCount
    discussion.repliesCount = (discussion.repliesCount || 0) + 1;
    await discussion.save();

    const result = reply.toObject();

    // Emit Socket.IO event
    if (socketService && typeof socketService.getIO === 'function') {
      const io = socketService.getIO();
      if (io) {
        io.to(`discussion:${discussionId}`).emit('reply:created', result);
        io.emit('reply:created', result);
      }
    }

    // Send notification to discussion author
    if (String(discussion.authorId) !== String(author.id) && notificationService && notificationService.createAndEmitNotification) {
      try {
        await notificationService.createAndEmitNotification({
          userId: String(discussion.authorId),
          title: 'New Reply on Your Post',
          message: `${author.name || 'Someone'} replied to your discussion "${discussion.title}"`,
          type: 'info',
          category: 'discussion',
          actionUrl: `/discussions/${discussionId}`,
        });
      } catch (err) {
        // Non-blocking notification failure
      }
    }

    return result;
  }

  /**
   * Update a reply. Students can only update their own replies.
   */
  async updateReply(replyId: string, user: UserContext, updateData: any) {
    const reply = await ReplyModel.findById(replyId);
    if (!reply) {
      throw new AppError('Reply not found', 404);
    }

    if (user.role !== 'instructor' && user.role !== 'admin' && String(reply.authorId) !== String(user.id)) {
      throw new AppError('You do not have permission to edit this reply', 403);
    }

    reply.content = updateData.content;
    await reply.save();
    return reply.toObject();
  }

  /**
   * Delete a reply.
   */
  async deleteReply(replyId: string, user: UserContext) {
    const reply = await ReplyModel.findById(replyId);
    if (!reply) {
      throw new AppError('Reply not found', 404);
    }

    if (user.role !== 'instructor' && user.role !== 'admin' && String(reply.authorId) !== String(user.id)) {
      throw new AppError('You do not have permission to delete this reply', 403);
    }

    const discussionId = reply.discussionId;
    await ReplyModel.findByIdAndDelete(replyId);

    // Decrement repliesCount on parent discussion
    if (discussionId) {
      await DiscussionModel.findByIdAndUpdate(discussionId, {
        $inc: { repliesCount: -1 },
      });
    }

    return { id: replyId, message: 'Reply deleted successfully' };
  }

  /**
   * Toggle like on a discussion.
   */
  async toggleLikeDiscussion(discussionId: string, userId: string) {
    const discussion = await DiscussionModel.findById(discussionId);
    if (!discussion) {
      throw new AppError('Discussion not found', 404);
    }

    const likesList = discussion.likes || [];
    const index = likesList.findIndex((id: any) => String(id) === String(userId));
    let isLiked = false;

    if (index >= 0) {
      likesList.splice(index, 1);
      isLiked = false;
    } else {
      likesList.push(userId);
      isLiked = true;
    }

    discussion.likes = likesList;
    discussion.likesCount = likesList.length;
    await discussion.save();

    const updated = discussion.toObject();

    if (socketService && typeof socketService.getIO === 'function') {
      const io = socketService.getIO();
      if (io) {
        io.emit('discussion:liked', { discussionId, likesCount: updated.likesCount, isLiked });
      }
    }

    return { ...updated, isLiked };
  }

  /**
   * Toggle like on a reply.
   */
  async toggleLikeReply(replyId: string, userId: string) {
    const reply = await ReplyModel.findById(replyId);
    if (!reply) {
      throw new AppError('Reply not found', 404);
    }

    const likesList = reply.likes || [];
    const index = likesList.findIndex((id: any) => String(id) === String(userId));
    let isLiked = false;

    if (index >= 0) {
      likesList.splice(index, 1);
      isLiked = false;
    } else {
      likesList.push(userId);
      isLiked = true;
    }

    reply.likes = likesList;
    reply.likesCount = likesList.length;
    await reply.save();

    const updated = reply.toObject();

    if (socketService && typeof socketService.getIO === 'function') {
      const io = socketService.getIO();
      if (io) {
        io.emit('reply:liked', { replyId, likesCount: updated.likesCount, isLiked });
      }
    }

    return { ...updated, isLiked };
  }

  /**
   * Pin or unpin a discussion (Instructors/Admins only).
   */
  async togglePinDiscussion(discussionId: string, userRole: string) {
    if (userRole !== 'instructor' && userRole !== 'admin') {
      throw new AppError('Only instructors can pin discussions', 403);
    }

    const discussion = await DiscussionModel.findById(discussionId);
    if (!discussion) {
      throw new AppError('Discussion not found', 404);
    }

    discussion.isPinned = !discussion.isPinned;
    await discussion.save();

    const result = discussion.toObject();

    if (socketService && typeof socketService.getIO === 'function') {
      const io = socketService.getIO();
      if (io) {
        io.emit('discussion:pinned', { discussionId, isPinned: result.isPinned });
      }
    }

    return result;
  }

  /**
   * Lock or unlock a discussion (Instructors/Admins only).
   */
  async toggleLockDiscussion(discussionId: string, userRole: string) {
    if (userRole !== 'instructor' && userRole !== 'admin') {
      throw new AppError('Only instructors can lock discussions', 403);
    }

    const discussion = await DiscussionModel.findById(discussionId);
    if (!discussion) {
      throw new AppError('Discussion not found', 404);
    }

    discussion.isLocked = !discussion.isLocked;
    await discussion.save();

    const result = discussion.toObject();

    if (socketService && typeof socketService.getIO === 'function') {
      const io = socketService.getIO();
      if (io) {
        io.emit('discussion:locked', { discussionId, isLocked: result.isLocked });
      }
    }

    return result;
  }
}

module.exports = {
  DiscussionService,
};
