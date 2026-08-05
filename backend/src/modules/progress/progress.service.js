'use strict';
const { StudentProgressModel } = require('./progress.model');

class ProgressService {
  async getOrCreateProgress(studentId, courseId) {
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

  async markLessonComplete(studentId, courseId, lessonId) {
    const progress = await this.getOrCreateProgress(studentId, courseId);
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }
    progress.lastActivity = new Date();
    this.recalculateMetrics(progress);
    await progress.save();
    return this.toResponseDTO(progress);
  }

  async recordQuizSubmission(studentId, courseId, quizId, score, percentage) {
    const progress = await this.getOrCreateProgress(studentId, courseId);
    if (!progress.completedQuizzes.includes(quizId)) {
      progress.completedQuizzes.push(quizId);
    }

    const existingScoreIdx = progress.quizScores.findIndex((q) => q.quizId === quizId);
    if (existingScoreIdx >= 0) {
      progress.quizScores[existingScoreIdx] = { quizId, score, percentage, updatedAt: new Date() };
    } else {
      progress.quizScores.push({ quizId, score, percentage, updatedAt: new Date() });
    }

    progress.lastActivity = new Date();
    this.recalculateMetrics(progress);
    await progress.save();

    if (progress.completed) {
      try {
        const certificateService = require('../certificates/certificate.service');
        await certificateService.generateCertificate(studentId, courseId);
      } catch (certErr) {
        console.warn('Auto certificate generation skipped:', certErr.message);
      }
    }

    try {
      const { emitDashboardRefresh } = require('../../sockets/socket');
      emitDashboardRefresh();
    } catch (socketErr) {
      console.warn('Dashboard refresh trigger warning:', socketErr.message);
    }

    return this.toResponseDTO(progress);
  }

  async getUserAllProgress(studentId) {
    const records = await StudentProgressModel.find({ studentId }).populate('courseId').sort({ lastActivity: -1 }).exec();
    return records.map((r) => this.toResponseDTO(r));
  }

  async getCourseProgressDTO(studentId, courseId) {
    const progress = await this.getOrCreateProgress(studentId, courseId);
    return this.toResponseDTO(progress);
  }

  recalculateMetrics(progress) {
    if (progress.quizScores && progress.quizScores.length > 0) {
      const totalPercentage = progress.quizScores.reduce((sum, item) => sum + item.percentage, 0);
      progress.overallScore = Number((totalPercentage / progress.quizScores.length).toFixed(2));
    } else {
      progress.overallScore = 0;
    }

    const lessonCount = progress.completedLessons.length;
    const quizCount = progress.completedQuizzes.length;
    const totalCompletedItems = lessonCount + quizCount;

    const calculatedPercentage = totalCompletedItems > 0 ? Math.min(100, totalCompletedItems * 20) : 0;
    progress.progressPercentage = Number(calculatedPercentage.toFixed(2));

    const isCompleted = progress.progressPercentage >= 100;
    progress.completed = isCompleted;

    if (isCompleted && !progress.completedAt) {
      progress.completedAt = new Date();
    } else if (!isCompleted) {
      progress.completedAt = undefined;
    }
  }

  toResponseDTO(doc) {
    return {
      id: doc._id,
      studentId: doc.studentId,
      courseId: doc.courseId,
      progressPercentage: doc.progressPercentage,
      completedLessons: doc.completedLessons,
      completedQuizzes: doc.completedQuizzes,
      averageQuizScore: doc.overallScore,
      quizScores: doc.quizScores,
      completed: doc.completed,
      lastActivity: doc.lastActivity,
      completedAt: doc.completedAt,
    };
  }
}

module.exports = new ProgressService();
