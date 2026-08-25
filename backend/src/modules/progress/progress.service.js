'use strict';
const mongoose = require('mongoose');
const { StudentProgressModel } = require('./progress.model');
const { StudentActivityModel } = require('./activity.model');

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

  async logActivity(studentId, courseId, lessonId, durationMinutes = 1, type = 'general') {
    const todayStr = new Date().toISOString().split('T')[0];
    const mins = Math.max(1, Math.round(Number(durationMinutes) || 1));

    await StudentActivityModel.create({
      studentId,
      courseId: courseId && mongoose.Types.ObjectId.isValid(courseId) ? courseId : undefined,
      lessonId: lessonId ? String(lessonId) : undefined,
      date: todayStr,
      durationMinutes: mins,
      type: type || 'general',
    });

    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
      await StudentProgressModel.updateOne(
        { studentId, courseId },
        { $set: { lastActivity: new Date() } }
      ).exec();
    }
    return { success: true };
  }

  async getWeeklyActivity(studentId) {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon, ... 6 is Sat
    const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);

    const weekDays = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      weekDays.push({
        date: dateStr,
        day: dayNames[i],
      });
    }

    const startOfWeekStr = weekDays[0].date;
    const endOfWeekStr = weekDays[6].date;

    const aggregation = await StudentActivityModel.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(studentId),
          date: { $gte: startOfWeekStr, $lte: endOfWeekStr },
        },
      },
      {
        $group: {
          _id: '$date',
          totalMinutes: { $sum: '$durationMinutes' },
        },
      },
    ]);

    const activityMap = new Map(aggregation.map((a) => [a._id, a.totalMinutes]));

    let overallWeeklyMinutes = 0;
    const activityResult = weekDays.map((wd) => {
      const mins = activityMap.get(wd.date) || 0;
      overallWeeklyMinutes += mins;
      return {
        date: wd.date,
        day: wd.day,
        minutes: mins,
        formatted: this.formatMinutes(mins),
      };
    });

    return {
      period: 'week',
      totalMinutes: overallWeeklyMinutes,
      totalFormatted: this.formatMinutes(overallWeeklyMinutes),
      activity: activityResult,
    };
  }

  formatMinutes(totalMins) {
    if (!totalMins || totalMins <= 0) return '0m';
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  }

  async markLessonComplete(studentId, courseId, lessonId) {
    const Enrollment = require('../../models/Enrollment');
    const User = require('../../models/User');
    const Course = require('../../models/Course');
    const AppError = require('../../utils/AppError');

    const user = await User.findById(studentId).lean();
    if (!user) throw AppError.unauthorized('User not found');

    if (user.role !== 'admin' && user.role !== 'instructor') {
      const enrollment = await Enrollment.findOne({ student: studentId, course: courseId }).lean();
      if (!enrollment) {
        throw AppError.forbidden('You are not enrolled in this course');
      }
    }

    const course = await Course.findById(courseId).lean();
    if (!course) throw AppError.notFound('Course not found');

    // Collect all valid lesson IDs from all sections of the course
    const validLessonIds = new Set();
    (course.sections || []).forEach((sec) => {
      (sec.lessons || []).forEach((les) => {
        if (les._id) validLessonIds.add(les._id.toString());
      });
    });

    if (!validLessonIds.has(String(lessonId))) {
      throw AppError.notFound('Lesson not found in this course');
    }

    const progress = await this.getOrCreateProgress(studentId, courseId);

    const lessonIdStr = String(lessonId);
    if (!progress.completedLessons.includes(lessonIdStr)) {
      progress.completedLessons.push(lessonIdStr);
    }
    progress.lastActivity = new Date();

    const totalCourseLessons = validLessonIds.size;
    await this.recalculateMetrics(progress, totalCourseLessons);
    await progress.save();

    // Sync state to Enrollment model
    await this.syncEnrollment(studentId, courseId, progress);

    await this.logActivity(studentId, courseId, lessonIdStr, 5, 'general');

    if (progress.completed) {
      try {
        const certificateService = require('../certificates/certificate.service');
        await certificateService.generateCertificate(studentId, courseId);
      } catch (certErr) {
        console.warn('Auto certificate generation skipped:', certErr.message);
      }
    }

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
    await this.recalculateMetrics(progress);
    await progress.save();

    await this.syncEnrollment(studentId, courseId, progress);

    await this.logActivity(studentId, courseId, quizId, 10, 'quiz');

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

  async syncEnrollment(studentId, courseId, progress) {
    const Enrollment = require('../../models/Enrollment');
    try {
      const updateData = {
        progressPercentage: progress.progressPercentage,
        completedLessons: progress.completedLessons,
        lastActive: progress.lastActivity || new Date(),
        lastAccessedAt: progress.lastActivity || new Date(),
      };
      if (progress.completed || progress.progressPercentage >= 100) {
        updateData.status = 'completed';
        updateData.completedAt = progress.completedAt || new Date();
      }
      await Enrollment.updateOne(
        { student: studentId, course: courseId },
        { $set: updateData }
      );
    } catch (err) {
      console.warn('Enrollment sync warning:', err.message);
    }
  }

  async getUserAllProgress(studentId) {
    const Enrollment = require('../../models/Enrollment');
    const enrollments = await Enrollment.find({ student: studentId })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'firstName lastName' },
      })
      .lean();

    const progressRecords = await StudentProgressModel.find({ studentId }).exec();
    const progressMap = new Map();
    progressRecords.forEach((p) => {
      if (p.courseId) {
        progressMap.set(p.courseId.toString(), p);
      }
    });

    const result = [];
    for (const enc of enrollments) {
      if (!enc.course) continue;
      const courseIdStr = enc.course._id.toString();
      let progDoc = progressMap.get(courseIdStr);

      if (!progDoc) {
        progDoc = await this.getOrCreateProgress(studentId, courseIdStr);
      }

      await this.recalculateMetrics(progDoc);

      result.push({
        ...this.toResponseDTO(progDoc),
        course: enc.course,
        enrollmentStatus: enc.status || 'active',
        enrolledAt: enc.createdAt,
      });
    }

    return result;
  }

  async getCourseProgressDTO(studentId, courseId) {
    const Enrollment = require('../../models/Enrollment');
    const User = require('../../models/User');
    const AppError = require('../../utils/AppError');

    const user = await User.findById(studentId).lean();
    if (!user) throw AppError.unauthorized('User not found');

    if (user.role !== 'admin' && user.role !== 'instructor') {
      const enrollment = await Enrollment.findOne({ student: studentId, course: courseId }).lean();
      if (!enrollment) {
        throw AppError.forbidden('You are not enrolled in this course');
      }
    }

    const progress = await this.getOrCreateProgress(studentId, courseId);
    await this.recalculateMetrics(progress);
    return this.toResponseDTO(progress);
  }

  async recalculateMetrics(progress, totalCourseLessons = null) {
    if (progress.quizScores && progress.quizScores.length > 0) {
      const totalPercentage = progress.quizScores.reduce((sum, item) => sum + item.percentage, 0);
      progress.overallScore = Number((totalPercentage / progress.quizScores.length).toFixed(2));
    } else {
      progress.overallScore = 0;
    }

    let totalLessons = totalCourseLessons;
    if (totalLessons === null && progress.courseId) {
      try {
        const Course = require('../../models/Course');
        const course = await Course.findById(progress.courseId).select('sections').lean();
        if (course && course.sections) {
          totalLessons = course.sections.reduce((acc, sec) => acc + (sec.lessons ? sec.lessons.length : 0), 0);
        }
      } catch (e) {
        totalLessons = 0;
      }
    }

    const lessonCount = progress.completedLessons ? progress.completedLessons.length : 0;
    const totalRequiredLessons = totalLessons || 0;

    let calculatedPercentage = 0;
    if (totalRequiredLessons > 0) {
      calculatedPercentage = Math.min(100, Math.round((lessonCount / totalRequiredLessons) * 100));
    }

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
