import { Schema, model } from 'mongoose';
import { IStudentProgressDocument } from './progress.types';

const QuizScoreRecordSchema = new Schema(
  {
    quizId: { type: String, required: true },
    score: { type: Number, required: true, default: 0 },
    percentage: { type: Number, required: true, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const StudentProgressSchema = new Schema<IStudentProgressDocument>(
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

// Ensure unique progress tracking record per student & course
StudentProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const StudentProgressModel = model<IStudentProgressDocument>('StudentProgress', StudentProgressSchema);
