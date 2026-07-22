import { Request, Response, NextFunction } from 'express';
import { ProgressService } from './progress.service';
import { courseProgressParamsSchema, completeLessonParamsSchema } from './progress.validation';

export class ProgressController {
  private progressService: ProgressService;

  constructor() {
    this.progressService = new ProgressService();
  }

  public getMyProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = req.user?.id || '60d0fe4f5311236168a109ca';
      const progressList = await this.progressService.getUserAllProgress(studentId);
      res.status(200).json({
        success: true,
        message: 'Student overall progress retrieved successfully',
        data: progressList,
      });
    } catch (error) {
      next(error);
    }
  };

  public getCourseProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validationResult = courseProgressParamsSchema.safeParse(req.params);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.format(),
        });
        return;
      }

      const studentId = req.user?.id || '60d0fe4f5311236168a109ca';
      const { courseId } = validationResult.data;
      const progressDTO = await this.progressService.getCourseProgressDTO(studentId, courseId);

      res.status(200).json({
        success: true,
        message: 'Course progress retrieved successfully',
        data: progressDTO,
      });
    } catch (error) {
      next(error);
    }
  };

  public markLessonComplete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validationResult = completeLessonParamsSchema.safeParse(req.params);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.format(),
        });
        return;
      }

      const studentId = req.user?.id || '60d0fe4f5311236168a109ca';
      const { courseId, lessonId } = validationResult.data;

      const updatedProgressDTO = await this.progressService.markLessonComplete(
        studentId,
        courseId,
        lessonId
      );

      res.status(200).json({
        success: true,
        message: 'Lesson completed successfully and progress updated',
        data: updatedProgressDTO,
      });
    } catch (error) {
      next(error);
    }
  };
}
