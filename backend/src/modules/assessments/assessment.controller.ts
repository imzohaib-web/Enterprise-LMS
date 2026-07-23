import { Request, Response, NextFunction } from 'express';
import { AssessmentService } from './assessment.service';
import { createQuizSchema, updateQuizSchema, submitQuizSchema } from './assessment.validation';

/**
 * HTTP Controller handlers for Assessment endpoints.
 * Enforces Zod validation and standardized API response formats.
 */
export class AssessmentController {
  private assessmentService: AssessmentService;

  constructor() {
    this.assessmentService = new AssessmentService();
  }

  /**
   * POST /api/v1/assessments
   * Create a new Quiz document (Instructors/Admins).
   */
  public createQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validationResult = createQuizSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: 'Validation failed for quiz creation input',
          errors: validationResult.error.format(),
        });
        return;
      }

      const quiz = await this.assessmentService.createQuiz(validationResult.data);
      res.status(201).json({
        success: true,
        message: 'Quiz created successfully',
        data: quiz,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/assessments
   * Get all quizzes, with optional query filters (courseId, lessonId).
   */
  public getAllQuizzes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId, lessonId } = req.query;
      const quizzes = await this.assessmentService.getAllQuizzes({
        courseId: courseId ? String(courseId) : undefined,
        lessonId: lessonId ? String(lessonId) : undefined,
      });
      res.status(200).json({
        success: true,
        message: 'Quizzes retrieved successfully',
        data: quizzes,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/assessments/:id
   * Fetch a single quiz by ID.
   */
  public getQuizById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const quiz = await this.assessmentService.getQuizById(id);
      if (!quiz) {
        res.status(404).json({
          success: false,
          message: `Quiz not found with ID: ${id}`,
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Quiz retrieved successfully',
        data: quiz,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/assessments/:id
   * Update an existing quiz by ID (Instructors/Admins).
   */
  public updateQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const validationResult = updateQuizSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: 'Validation failed for quiz update input',
          errors: validationResult.error.format(),
        });
        return;
      }

      const updatedQuiz = await this.assessmentService.updateQuiz(id, validationResult.data);
      if (!updatedQuiz) {
        res.status(404).json({
          success: false,
          message: `Quiz not found with ID: ${id}`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Quiz updated successfully',
        data: updatedQuiz,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/assessments/:id
   * Delete a quiz by ID (Instructors/Admins).
   */
  public deleteQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deletedQuiz = await this.assessmentService.deleteQuiz(id);
      if (!deletedQuiz) {
        res.status(404).json({
          success: false,
          message: `Quiz not found with ID: ${id}`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Quiz deleted successfully',
        data: { id },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/assessments/:quizId/submit
   * Process and evaluate student quiz submission.
   */
  public submitQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { quizId } = req.params;
      const validationResult = submitQuizSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: 'Validation failed for quiz submission',
          errors: validationResult.error.format(),
        });
        return;
      }

      const studentId = validationResult.data.studentId || req.user?.id || '60d0fe4f5311236168a109ca';

      const evaluationResult = await this.assessmentService.submitQuizAttempt(
        quizId,
        studentId,
        validationResult.data
      );

      res.status(201).json({
        success: true,
        message: 'Quiz submitted and evaluated successfully',
        data: evaluationResult,
      });
    } catch (error: any) {
      if (error.message && error.message.includes('Quiz not found')) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };
}
