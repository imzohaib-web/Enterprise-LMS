'use strict';
const mongoose = require('mongoose');
const { QuizModel, QuizAttemptModel } = require('./assessment.model');
const progressService = require('../progress/progress.service');
const Enrollment = require('../../models/Enrollment');
const Course = require('../../models/Course');
const AppError = require('../../utils/AppError');

class AssessmentService {
  async createQuiz(quizData, user = null) {
    if (!quizData.courseId) {
      throw AppError.badRequest('Associated course ID is required');
    }
    const course = await Course.findById(quizData.courseId).lean();
    if (!course) {
      throw AppError.notFound('Associated course');
    }
    if (user && user.role !== 'admin') {
      const instIdStr = course.instructor?._id ? course.instructor._id.toString() : course.instructor ? course.instructor.toString() : '';
      const userIdStr = (user._id || user.id).toString();
      if (instIdStr && instIdStr !== userIdStr) {
        throw AppError.forbidden('You can only create quizzes for courses you instruct');
      }
    }

    const quiz = new QuizModel({
      ...quizData,
      instructorId: user ? (user._id || user.id) : (quizData.instructorId || course.instructor),
    });
    return await quiz.save();
  }

  async getAllQuizzes(filter = {}, user = null) {
    const queryFilter = {};
    if (filter.courseId) queryFilter.courseId = filter.courseId;
    if (filter.lessonId) queryFilter.lessonId = filter.lessonId;

    if (user && user.role === 'student') {
      queryFilter.status = 'published';
      // Find active/completed courses student is enrolled in
      const studentId = user._id || user.id;
      const enrollments = await Enrollment.find({ student: studentId, status: { $in: ['active', 'completed'] } }).select('course').lean();
      const enrolledCourseIds = enrollments.map((e) => e.course);

      // Verify that enrolled courses are published
      const publishedCourses = await Course.find({ _id: { $in: enrolledCourseIds }, status: 'published' }).select('_id').lean();
      const validEnrolledCourseIds = publishedCourses.map((c) => c._id);

      if (filter.courseId) {
        const isEnrolledAndPublished = validEnrolledCourseIds.some((id) => id.toString() === filter.courseId.toString());
        if (!isEnrolledAndPublished) {
          return [];
        }
      } else {
        queryFilter.courseId = { $in: validEnrolledCourseIds };
      }
    }

    const quizzes = await QuizModel.find(queryFilter)
      .populate('courseId', 'title slug status')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (user && user.role === 'student') {
      return quizzes.map((q) => this.sanitizeQuizForStudent(q));
    }

    return quizzes;
  }

  async getQuizById(id, user = null, requestedCourseId = null) {
    const quiz = await QuizModel.findById(id).populate('courseId', 'title slug status').lean().exec();
    if (!quiz) return null;

    if (user && user.role === 'student') {
      const quizCourseId = quiz.courseId?._id ? quiz.courseId._id.toString() : quiz.courseId ? quiz.courseId.toString() : null;
      if (requestedCourseId && quizCourseId && quizCourseId !== requestedCourseId.toString()) {
        throw AppError.forbidden('Assessment does not belong to the requested course');
      }

      if (quizCourseId) {
        const course = await Course.findOne({ _id: quizCourseId, status: 'published' }).lean();
        if (!course) {
          throw AppError.forbidden('The course associated with this quiz is not available');
        }
        const studentId = user._id || user.id;
        const enrollment = await Enrollment.findOne({ student: studentId, course: quizCourseId, status: { $in: ['active', 'completed'] } }).lean();
        if (!enrollment) {
          throw AppError.forbidden('You are not enrolled in the course associated with this quiz');
        }
      }
      return this.sanitizeQuizForStudent(quiz);
    }

    return quiz;
  }

  sanitizeQuizForStudent(quiz) {
    if (!quiz || !quiz.questions) return quiz;
    const sanitizedQuestions = quiz.questions.map((q) => {
      const { correctAnswer, explanation, ...safeQuestion } = q;
      return safeQuestion;
    });
    return {
      ...quiz,
      questions: sanitizedQuestions,
    };
  }

  async updateQuiz(id, updateData, user = null) {
    if (user && user.role !== 'admin') {
      const quiz = await QuizModel.findById(id).lean();
      if (!quiz) return null;
      if (quiz.instructorId && quiz.instructorId.toString() !== (user._id || user.id).toString()) {
        throw AppError.forbidden('You do not have permission to update this quiz');
      }
    }
    return await QuizModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async deleteQuiz(id, user = null) {
    if (user && user.role !== 'admin') {
      const quiz = await QuizModel.findById(id).lean();
      if (!quiz) return null;
      if (quiz.instructorId && quiz.instructorId.toString() !== (user._id || user.id).toString()) {
        throw AppError.forbidden('You do not have permission to delete this quiz');
      }
    }
    return await QuizModel.findByIdAndDelete(id).exec();
  }

  async submitQuizAttempt(quizId, studentId, submissionInput, user = null) {
    const quiz = await QuizModel.findById(quizId).exec();
    if (!quiz) {
      throw AppError.notFound(`Quiz with ID ${quizId}`);
    }

    const effectiveStudentId = user ? (user._id || user.id) : studentId;
    const courseId = quiz.courseId?._id || quiz.courseId;
    if (courseId) {
      const course = await Course.findOne({ _id: courseId, status: 'published' }).lean();
      if (!course) {
        throw AppError.forbidden('The course associated with this quiz is not available');
      }
      const enrollment = await Enrollment.findOne({ student: effectiveStudentId, course: courseId, status: { $in: ['active', 'completed'] } }).lean();
      if (!enrollment) {
        throw AppError.forbidden('You must be enrolled in this course to submit this assessment');
      }
    }

    let totalScore = 0;
    let totalPossibleMarks = 0;
    let correctAnswersCount = 0;
    let wrongAnswersCount = 0;

    const submittedAnswers = submissionInput.answers || [];

    const evaluatedAnswers = quiz.questions.map((q) => {
      const qIdStr = q._id ? q._id.toString() : '';
      const qMarks = q.marks || 1;
      totalPossibleMarks += qMarks;

      const submitted = submittedAnswers.find(
        (a) =>
          a.questionId === qIdStr ||
          a.questionId === q.question ||
          (q.id && a.questionId === q.id)
      );

      const studentChoice = submitted ? String(submitted.selectedOption).trim() : '';
      const targetCorrect = String(q.correctAnswer).trim();

      let isCorrect = false;

      if (studentChoice && targetCorrect) {
        if (studentChoice.toLowerCase() === targetCorrect.toLowerCase()) {
          isCorrect = true;
        } else if (Array.isArray(q.options)) {
          const matchedOpt = q.options.find((opt) => {
            if (typeof opt === 'object' && opt !== null) {
              return (
                (opt.id && String(opt.id).trim().toLowerCase() === studentChoice.toLowerCase()) ||
                (opt.text && String(opt.text).trim().toLowerCase() === studentChoice.toLowerCase())
              );
            }
            return false;
          });
          if (matchedOpt) {
            const optText = matchedOpt.text || matchedOpt.id;
            const optId = matchedOpt.id;
            if (
              String(optText).trim().toLowerCase() === targetCorrect.toLowerCase() ||
              String(optId).trim().toLowerCase() === targetCorrect.toLowerCase()
            ) {
              isCorrect = true;
            }
          }
        }
      }

      const marksAwarded = isCorrect ? qMarks : 0;

      if (isCorrect) {
        correctAnswersCount++;
        totalScore += qMarks;
      } else {
        wrongAnswersCount++;
      }

      return {
        questionId: qIdStr || q.question,
        selectedOption: studentChoice,
        isCorrect,
        marksAwarded,
      };
    });

    const percentage = totalPossibleMarks > 0 ? Number(((totalScore / totalPossibleMarks) * 100).toFixed(2)) : 0;
    const passingThreshold = quiz.passingScore !== undefined ? quiz.passingScore : 70;
    const passed = percentage >= passingThreshold;
    const timeTakenSeconds = Number(submissionInput.timeTakenSeconds) || 0;

    let attempt;
    try {
      attempt = new QuizAttemptModel({
        quizId: quiz._id,
        studentId,
        courseId: quiz.courseId,
        instructorId: quiz.instructorId,
        answers: evaluatedAnswers,
        score: totalScore,
        totalMarks: totalPossibleMarks,
        percentage,
        passed,
        correctAnswersCount,
        wrongAnswersCount,
        timeTakenSeconds,
      });
      await attempt.save();
    } catch (saveErr) {
      console.error('Quiz attempt save error:', saveErr);
    }

    const effectiveCourseId = quiz.courseId ? quiz.courseId.toString() : null;

    if (effectiveCourseId) {
      try {
        await progressService.recordQuizSubmission(
          studentId,
          effectiveCourseId,
          quiz._id.toString(),
          totalScore,
          percentage
        );
      } catch (err) {
        console.error('Failed to trigger progress update on quiz submit:', err.message);
      }
    }

    try {
      const notificationService = require('../notifications/notification.service');
      await notificationService.createAndEmitNotification({
        userId: studentId,
        title: passed ? 'Quiz Passed! 🎉' : 'Quiz Attempt Completed',
        message: passed
          ? `You scored ${percentage}% on "${quiz.title}". Great work!`
          : `You scored ${percentage}% on "${quiz.title}". Review and try again.`,
        type: passed ? 'success' : 'warning',
        category: 'assessment',
        actionUrl: `/student/assessments/${quiz._id}/result`,
        metadata: { quizId: quiz._id, percentage, passed },
      });
    } catch (err) {
      console.warn('Failed to emit quiz notification:', err.message);
    }

    try {
      const { emitDashboardRefresh } = require('../../sockets/socket');
      emitDashboardRefresh();
    } catch (err) {
      console.warn('Failed to emit dashboard refresh:', err.message);
    }

    return {
      score: totalScore,
      percentage,
      correctAnswers: correctAnswersCount,
      wrongAnswers: wrongAnswersCount,
      passed,
      totalMarks: totalPossibleMarks,
      timeTaken: this.formatTimeTaken(timeTakenSeconds),
    };
  }

  formatTimeTaken(seconds) {
    if (!seconds || seconds <= 0) return '0 seconds';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0 && secs > 0) return `${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m`;
    return `${secs}s`;
  }

  async getLatestQuizAttempt(quizId, studentId) {
    const attempt = await QuizAttemptModel.findOne({ quizId, studentId })
      .sort({ createdAt: -1 })
      .lean();

    if (!attempt) {
      return null;
    }

    return {
      score: attempt.score,
      percentage: attempt.percentage,
      correctAnswers: attempt.correctAnswersCount,
      wrongAnswers: attempt.wrongAnswersCount,
      passed: attempt.passed,
      totalMarks: attempt.totalMarks,
      timeTaken: this.formatTimeTaken(attempt.timeTakenSeconds),
      createdAt: attempt.createdAt,
    };
  }
}

module.exports = new AssessmentService();

