import { Router } from 'express';
import { ProgressController } from './progress.controller';

const router = Router();
const controller = new ProgressController();

// GET /api/v1/progress/my-progress
router.get('/my-progress', controller.getMyProgress);

// GET /api/v1/progress/:courseId
router.get('/:courseId', controller.getCourseProgress);

// PATCH /api/v1/progress/:courseId/lesson/:lessonId
router.patch('/:courseId/lesson/:lessonId', controller.markLessonComplete);

export default router;
