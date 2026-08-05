'use strict';
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: { type: mongoose.Schema.Types.Mixed, required: true },
    correctAnswer: { type: String, required: true },
    marks: { type: Number, required: true, min: 1, default: 1 },
    explanation: { type: String, default: '' },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', index: true },
    timeLimitMinutes: { type: Number, required: true, min: 1, default: 30 },
    passingScore: { type: Number, required: true, min: 0, max: 100, default: 70 },
    questions: { type: [questionSchema], required: true },
  },
  { timestamps: true }
);

const evaluatedAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    selectedOption: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    marksAwarded: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    answers: { type: [evaluatedAnswerSchema], required: true },
    score: { type: Number, required: true, default: 0 },
    totalMarks: { type: Number, required: true, default: 0 },
    percentage: { type: Number, required: true, default: 0 },
    passed: { type: Boolean, required: true, default: false },
    correctAnswersCount: { type: Number, required: true, default: 0 },
    wrongAnswersCount: { type: Number, required: true, default: 0 },
    timeTakenSeconds: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const QuizModel = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
const QuizAttemptModel = mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', quizAttemptSchema);

module.exports = {
  QuizModel,
  QuizAttemptModel,
  Quiz: QuizModel,
  QuizAttempt: QuizAttemptModel,
};
