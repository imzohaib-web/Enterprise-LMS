import { StudentProgressModel } from './progress.model';
import { IStudentProgressDocument, IProgressResponseDTO } from './progress.types';

export class ProgressService {
  public async getOrCreateProgress(studentId: string, courseId: string): Promise<IStudentProgressDocument> {
    let progress = await StudentProgressModel.findOne({ studentId, courseId }).exec();
    if (!progress) {
      progress = new StudentProgressModel({
        studentId,
        courseId,
        completedLessons: [],
        completedQuizzes: [],
        quizScores: [],
        overallScore: 0,
        progressPercentage: 0,
        completed: false,
        lastActivity: new Date(),
        startedAt: new Date(),
      });
      await progress.save();
    }
    return progress;
  }

  public async markLessonComplete(
    studentId: string,
    courseId: string,
    lessonId: string
  ): Promise<IProgressResponseDTO> {
    const progress = await this.getOrCreateProgress(studentId, courseId);

    // Prevent duplicate lesson completion
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    progress.lastActivity = new Date();
    this.recalculateMetrics(progress);

    await progress.save();
    return this.toResponseDTO(progress);
  }

  public async recordQuizSubmission(
    studentId: string,
    courseId: string,
    quizId: string,
    score: number,
    percentage: number
  ): Promise<IProgressResponseDTO> {
    const progress = await this.getOrCreateProgress(studentId, courseId);

    // Prevent duplicate quiz entry in completedQuizzes
    if (!progress.completedQuizzes.includes(quizId)) {
      progress.completedQuizzes.push(quizId);
    }

    // Update or add quiz score record
    const existingScoreIdx = progress.quizScores.findIndex((q) => q.quizId === quizId);
    if (existingScoreIdx >= 0) {
      progress.quizScores[existingScoreIdx] = {
        quizId,
        score,
        percentage,
        updatedAt: new Date(),
      };
    } else {
      progress.quizScores.push({
        quizId,
        score,
        percentage,
        updatedAt: new Date(),
      });
    }

    progress.lastActivity = new Date();
    this.recalculateMetrics(progress);

    await progress.save();

    // If 100% completed, auto-generate certificate and emit notification
    if (progress.completed) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const certificateService = require('../certificates/certificate.service');
        await certificateService.generateCertificate(studentId, courseId);
      } catch (certErr) {
        console.warn('Auto certificate generation skipped/error:', certErr);
      }
    }

    // Trigger real-time refresh signal to Dashboards
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { emitDashboardRefresh } = require('../../sockets/socket');
      emitDashboardRefresh();
    } catch (socketErr) {
      console.warn('Dashboard refresh trigger error:', socketErr);
    }

    return this.toResponseDTO(progress);
  }

  public async getUserAllProgress(studentId: string): Promise<IProgressResponseDTO[]> {
    const records = await StudentProgressModel.find({ studentId }).sort({ lastActivity: -1 }).exec();
    return records.map((r) => this.toResponseDTO(r));
  }

  public async getCourseProgressDTO(studentId: string, courseId: string): Promise<IProgressResponseDTO> {
    const progress = await this.getOrCreateProgress(studentId, courseId);
    return this.toResponseDTO(progress);
  }

  private recalculateMetrics(progress: IStudentProgressDocument): void {
    // 1. Calculate Average Quiz Score
    if (progress.quizScores && progress.quizScores.length > 0) {
      const totalPercentage = progress.quizScores.reduce((sum, item) => sum + item.percentage, 0);
      progress.overallScore = Number((totalPercentage / progress.quizScores.length).toFixed(2));
    } else {
      progress.overallScore = 0;
    }

    // 2. Calculate Progress Percentage
    const lessonCount = progress.completedLessons.length;
    const quizCount = progress.completedQuizzes.length;
    const totalCompletedItems = lessonCount + quizCount;

    const calculatedPercentage = totalCompletedItems > 0 ? Math.min(100, totalCompletedItems * 20) : 0;
    progress.progressPercentage = Number(calculatedPercentage.toFixed(2));

    // 3. Determine Course Completion Status
    const isCompleted = progress.progressPercentage >= 100;
    progress.completed = isCompleted;

    if (isCompleted) {
      if (!progress.completedAt) {
        progress.completedAt = new Date();
      }
    } else {
      progress.completedAt = undefined;
    }
  }

  public toResponseDTO(doc: IStudentProgressDocument): IProgressResponseDTO {
    return {
      progressPercentage: doc.progressPercentage,
      completedLessons: doc.completedLessons,
      completedQuizzes: doc.completedQuizzes,
      averageQuizScore: doc.overallScore,
      completed: doc.completed,
      lastActivity: doc.lastActivity,
    };
  }
}
