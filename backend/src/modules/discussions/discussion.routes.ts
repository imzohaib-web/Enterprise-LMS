import { Router } from 'express';
const { DiscussionController } = require('./discussion.controller');
const { protect, restrictTo } = require('../../middlewares/auth.middleware');

const router = Router();
const replyRouter = Router();
const controller = new DiscussionController();

// Discussions Endpoints
router.get('/course/:courseId', protect, controller.getDiscussionsByCourse);
router.get('/:discussionId', protect, controller.getDiscussionById);
router.post('/', protect, controller.createDiscussion);
router.patch('/:id', protect, controller.updateDiscussion);
router.delete('/:id', protect, controller.deleteDiscussion);

// Replies on discussion
router.post('/:id/replies', protect, controller.createReply);
router.post('/:id/like', protect, controller.toggleLikeDiscussion);

// Instructor-only actions on discussion
router.patch('/:id/pin', protect, restrictTo('instructor', 'admin'), controller.togglePinDiscussion);
router.patch('/:id/lock', protect, restrictTo('instructor', 'admin'), controller.toggleLockDiscussion);

// Standalone Reply Endpoints
replyRouter.patch('/:id', protect, controller.updateReply);
replyRouter.delete('/:id', protect, controller.deleteReply);
replyRouter.post('/:id/like', protect, controller.toggleLikeReply);

export default router;

module.exports = {
  discussionRouter: router,
  replyRouter: replyRouter,
  router,
};
