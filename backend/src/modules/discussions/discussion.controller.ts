import { Request, Response, NextFunction } from 'express';
const { DiscussionService } = require('./discussion.service');
const { sendSuccess } = require('../../utils/apiResponse');
const {
  createDiscussionSchema,
  updateDiscussionSchema,
  createReplySchema,
  updateReplySchema,
} = require('./discussion.validation');

const discussionService = new DiscussionService();

export class DiscussionController {
  /**
   * GET /api/v1/discussions/course/:courseId
   */
  public getDiscussionsByCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const result = await discussionService.getDiscussionsByCourse(courseId, req.query);
      return sendSuccess(res, 200, 'Discussions retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/discussions/:discussionId
   */
  public getDiscussionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const discussionId = req.params.discussionId || req.params.id;
      const discussion = await discussionService.getDiscussionById(discussionId);
      return sendSuccess(res, 200, 'Discussion details retrieved successfully', discussion);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/discussions
   */
  public createDiscussion = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createDiscussionSchema.parse(req.body);
      const user = req.user || { id: 'user-demo-1', name: 'Demo User', role: 'student' };
      const discussion = await discussionService.createDiscussion(user, validatedData);
      return sendSuccess(res, 201, 'Discussion post created successfully', discussion);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/discussions/:id
   */
  public updateDiscussion = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const validatedData = updateDiscussionSchema.parse(req.body);
      const user = req.user || { id: 'user-demo-1', role: 'student' };
      const updated = await discussionService.updateDiscussion(id, user, validatedData);
      return sendSuccess(res, 200, 'Discussion updated successfully', updated);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/discussions/:id
   */
  public deleteDiscussion = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user || { id: 'user-demo-1', role: 'student' };
      const result = await discussionService.deleteDiscussion(id, user);
      return sendSuccess(res, 200, 'Discussion deleted successfully', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/discussions/:id/replies
   */
  public createReply = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const validatedData = createReplySchema.parse(req.body);
      const user = req.user || { id: 'user-demo-1', name: 'Demo User', role: 'student' };
      const reply = await discussionService.createReply(id, user, validatedData);
      return sendSuccess(res, 201, 'Reply posted successfully', reply);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/replies/:id
   */
  public updateReply = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const validatedData = updateReplySchema.parse(req.body);
      const user = req.user || { id: 'user-demo-1', role: 'student' };
      const updated = await discussionService.updateReply(id, user, validatedData);
      return sendSuccess(res, 200, 'Reply updated successfully', updated);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/replies/:id
   */
  public deleteReply = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user || { id: 'user-demo-1', role: 'student' };
      const result = await discussionService.deleteReply(id, user);
      return sendSuccess(res, 200, 'Reply deleted successfully', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/discussions/:id/like
   */
  public toggleLikeDiscussion = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'user-demo-1';
      const result = await discussionService.toggleLikeDiscussion(id, userId);
      return sendSuccess(res, 200, 'Discussion like toggled', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/replies/:id/like
   */
  public toggleLikeReply = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'user-demo-1';
      const result = await discussionService.toggleLikeReply(id, userId);
      return sendSuccess(res, 200, 'Reply like toggled', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/discussions/:id/pin
   */
  public togglePinDiscussion = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userRole = req.user?.role || 'instructor';
      const result = await discussionService.togglePinDiscussion(id, userRole);
      return sendSuccess(res, 200, 'Discussion pin status updated', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/discussions/:id/lock
   */
  public toggleLockDiscussion = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userRole = req.user?.role || 'instructor';
      const result = await discussionService.toggleLockDiscussion(id, userRole);
      return sendSuccess(res, 200, 'Discussion lock status updated', result);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  DiscussionController,
};
