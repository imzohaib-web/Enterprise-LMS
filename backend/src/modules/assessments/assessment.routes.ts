import { Router } from 'express';
import { AssessmentController } from './assessment.controller';
import { requireRole } from './assessment.middleware';

const router = Router();
const controller = new AssessmentController();

// Create Quiz - Instructor & Admin only
router.post('/', requireRole('instructor', 'admin'), controller.createQuiz);

// Get All Quizzes - Accessible to all roles (Students & Instructors)
router.get('/', controller.getAllQuizzes);

// Get Quiz by ID - Accessible to all roles (Students & Instructors)
router.get('/:id', controller.getQuizById);

// Update Quiz - Instructor & Admin only
router.put('/:id', requireRole('instructor', 'admin'), controller.updateQuiz);

// Delete Quiz - Instructor & Admin only
router.delete('/:id', requireRole('instructor', 'admin'), controller.deleteQuiz);

export default router;
