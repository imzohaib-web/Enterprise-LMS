'use strict';
const { DiscussionService } = require('./discussion.service');
const { sendSuccess } = require('../../utils/apiResponse');
const {
  createDiscussionSchema,
  updateDiscussionSchema,
  createReplySchema,
  updateReplySchema,
} = require('./discussion.validation');

const discussionService = new DiscussionService();

class DiscussionController {
  async getDiscussionsByCourse(req, res, next) {
    try {
      const courseId = req.params.courseId || req.query.courseId || 'all';
      const result = await discussionService.getDiscussionsByCourse(courseId, req.query);
      return sendSuccess(res, 200, 'Discussions retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getDiscussionById(req, res, next) {
    try {
      const discussionId = req.params.discussionId || req.params.id;
      const discussion = await discussionService.getDiscussionById(discussionId);
      return sendSuccess(res, 200, 'Discussion details retrieved successfully', discussion);
    } catch (error) {
      next(error);
    }
  }

  async createDiscussion(req, res, next) {
    try {
      const validatedData = createDiscussionSchema.parse(req.body);
      const user = req.user || { id: 'user-demo-1', name: 'Demo User', role: 'student' };
      const discussion = await discussionService.createDiscussion(user, validatedData);
      return sendSuccess(res, 201, 'Discussion post created successfully', discussion);
    } catch (error) {
      next(error);
    }
  }

  async updateDiscussion(req, res, next) {
    try {
      const { id } = req.params;
      const validatedData = updateDiscussionSchema.parse(req.body);
      const user = req.user || { id: 'user-demo-1', role: 'student' };
      const updated = await discussionService.updateDiscussion(id, user, validatedData);
      return sendSuccess(res, 200, 'Discussion updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteDiscussion(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user || { id: 'user-demo-1', role: 'student' };
      const result = await discussionService.deleteDiscussion(id, user);
      return sendSuccess(res, 200, 'Discussion deleted successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async createReply(req, res, next) {
    try {
      const { id } = req.params;
      const validatedData = createReplySchema.parse(req.body);
      const user = req.user || { id: 'user-demo-1', name: 'Demo User', role: 'student' };
      const reply = await discussionService.createReply(id, user, validatedData);
      return sendSuccess(res, 201, 'Reply posted successfully', reply);
    } catch (error) {
      next(error);
    }
  }

  async updateReply(req, res, next) {
    try {
      const { id } = req.params;
      const validatedData = updateReplySchema.parse(req.body);
      const user = req.user || { id: 'user-demo-1', role: 'student' };
      const updated = await discussionService.updateReply(id, user, validatedData);
      return sendSuccess(res, 200, 'Reply updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteReply(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user || { id: 'user-demo-1', role: 'student' };
      const result = await discussionService.deleteReply(id, user);
      return sendSuccess(res, 200, 'Reply deleted successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async toggleLikeDiscussion(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'user-demo-1';
      const result = await discussionService.toggleLikeDiscussion(id, userId);
      return sendSuccess(res, 200, 'Discussion like toggled', result);
    } catch (error) {
      next(error);
    }
  }

  async toggleLikeReply(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'user-demo-1';
      const result = await discussionService.toggleLikeReply(id, userId);
      return sendSuccess(res, 200, 'Reply like toggled', result);
    } catch (error) {
      next(error);
    }
  }

  async togglePinDiscussion(req, res, next) {
    try {
      const { id } = req.params;
      const userRole = req.user?.role || 'instructor';
      const result = await discussionService.togglePinDiscussion(id, userRole);
      return sendSuccess(res, 200, 'Discussion pin status updated', result);
    } catch (error) {
      next(error);
    }
  }

  async toggleLockDiscussion(req, res, next) {
    try {
      const { id } = req.params;
      const userRole = req.user?.role || 'instructor';
      const result = await discussionService.toggleLockDiscussion(id, userRole);
      return sendSuccess(res, 200, 'Discussion lock status updated', result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = {
  DiscussionController,
};
