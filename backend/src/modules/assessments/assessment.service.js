'use strict';
const mongoose = require('mongoose');
const { QuizModel, QuizAttemptModel } = require('./assessment.model');
const progressService = require('../progress/progress.service');

class AssessmentService {
  async createQuiz(quizData) {
    const quiz = new QuizModel(quizData);
    return await quiz.save();
  }

  async getAllQuizzes(filter = {}) {
    const queryFilter = {};
    if (filter.courseId) queryFilter.courseId = filter.courseId;
    if (filter.lessonId) queryFilter.lessonId = filter.lessonId;

    return await QuizModel.find(queryFilter)
      .populate('courseId', 'title slug')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async getQuizById(id) {
    return await QuizModel.findById(id).populate('courseId', 'title slug').exec();
  }

  async updateQuiz(id, updateData) {
    return await QuizModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async deleteQuiz(id) {
    return await QuizModel.findByIdAndDelete(id).exec();
  }

  async submitQuizAttempt(quizId, studentId, submissionInput) {
    const quiz = await QuizModel.findById(quizId).exec();
    if (!quiz) {
      const err = new Error(`Quiz not found with ID: ${quizId}`);
      err.statusCode = 404;
      throw err;
    }

    let totalScore = 0;
    let totalPossibleMarks = 0;
    let correctAnswersCount = 0;
    let wrongAnswersCount = 0;

    const evaluatedAnswers = quiz.questions.map((q) => {
      const qIdStr = q._id ? q._id.toString() : '';
      const qMarks = q.marks || 1;
      totalPossibleMarks += qMarks;

      const submitted = (submissionInput.answers || []).find(
        (a) => a.questionId === qIdStr || a.questionId === q.question
      );

      const isCorrect = submitted ? submitted.selectedOption === q.correctAnswer : false;
      const marksAwarded = isCorrect ? qMarks : 0;

      if (isCorrect) {
        correctAnswersCount++;
        totalScore += qMarks;
      } else {
        wrongAnswersCount++;
      }

      return {
        questionId: qIdStr || q.question,
        selectedOption: submitted ? submitted.selectedOption : '',
        isCorrect,
        marksAwarded,
      };
    });

    const percentage = totalPossibleMarks > 0 ? Number(((totalScore / totalPossibleMarks) * 100).toFixed(2)) : 0;
    const passed = percentage >= quiz.passingScore;
    const timeTakenSeconds = submissionInput.timeTakenSeconds || 0;

    let attempt;
    try {
      attempt = new QuizAttemptModel({
        quizId,
        studentId,
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
          quizId,
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
        actionUrl: `/student/assessments/${quizId}/result`,
        metadata: { quizId, percentage, passed },
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
