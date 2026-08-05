'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuizScoreRecordSchema = new Schema(
  {
    quizId: { type: String, required: true },
    score: { type: Number, required: true, default: 0 },
    percentage: { type: Number, required: true, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const StudentProgressSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    completedLessons: { type: [String], default: [] },
    completedQuizzes: { type: [String], default: [] },
    quizScores: { type: [QuizScoreRecordSchema], default: [] },
    overallScore: { type: Number, default: 0 },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    completed: { type: Boolean, default: false },
    lastActivity: { type: Date, default: Date.now },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

StudentProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const StudentProgressModel =
  mongoose.models.StudentProgress || mongoose.model('StudentProgress', StudentProgressSchema);

module.exports = {
  StudentProgressModel,
};
