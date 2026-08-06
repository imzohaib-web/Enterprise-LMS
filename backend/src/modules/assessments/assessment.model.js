'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['mcq', 'true_false', 'short_answer', 'long_answer', 'code'],
      default: 'mcq',
    },
    options: { type: Schema.Types.Mixed, default: [] },
    correctAnswer: { type: String, default: '' },
    marks: { type: Number, required: true, min: 1, default: 1 },
    explanation: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
  },
  { _id: true }
);

const QuizSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', index: true },
    instructorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    type: { type: String, enum: ['quiz', 'assignment', 'exam'], default: 'quiz' },
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled', 'archived'],
      default: 'published',
      index: true,
    },
    dueDate: { type: Date },
    scheduledFor: { type: Date },
    timeLimitMinutes: { type: Number, required: true, min: 1, default: 30 },
    passingScore: { type: Number, required: true, min: 0, max: 100, default: 70 },
    totalMarks: { type: Number, default: 100 },
    attemptsAllowed: { type: Number, default: 3 },
    shuffleQuestions: { type: Boolean, default: false },
    negativeMarking: { type: Boolean, default: false },
    negativeMarksPerQuestion: { type: Number, default: 0 },
    visibility: { type: String, enum: ['public', 'enrolled', 'private'], default: 'enrolled' },
    questions: { type: [QuestionSchema], required: true },
  },
  { timestamps: true }
);

const EvaluatedAnswerSchema = new Schema(
  {
    questionId: { type: String, required: true },
    selectedOption: { type: String, default: '' },
    textAnswer: { type: String, default: '' },
    codeAnswer: { type: String, default: '' },
    isCorrect: { type: Boolean, required: true, default: false },
    marksAwarded: { type: Number, required: true, default: 0 },
    feedback: { type: String, default: '' },
  },
  { _id: false }
);

const QuizAttemptSchema = new Schema(
  {
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    instructorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    answers: { type: [EvaluatedAnswerSchema], required: true },
    score: { type: Number, required: true, default: 0 },
    totalMarks: { type: Number, required: true, default: 0 },
    percentage: { type: Number, required: true, default: 0 },
    passed: { type: Boolean, required: true, default: false },
    status: {
      type: String,
      enum: ['submitted', 'reviewed', 'pending_review'],
      default: 'submitted',
    },
    correctAnswersCount: { type: Number, required: true, default: 0 },
    wrongAnswersCount: { type: Number, required: true, default: 0 },
    timeTakenSeconds: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const QuizModel = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
const QuizAttemptModel = mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', QuizAttemptSchema);

module.exports = {
  QuizModel,
  QuizAttemptModel,
  Quiz: QuizModel,
  QuizAttempt: QuizAttemptModel,
};
