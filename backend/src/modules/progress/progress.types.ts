import { Document, Types } from 'mongoose';

export interface IQuizScoreRecord {
  quizId: string;
  score: number;
  percentage: number;
  updatedAt?: Date;
}

export interface IStudentProgress {
  studentId: Types.ObjectId | string;
  courseId: Types.ObjectId | string;
  completedLessons: string[];
  completedQuizzes: string[];
  quizScores: IQuizScoreRecord[];
  overallScore: number;
  progressPercentage: number;
  completed: boolean;
  lastActivity: Date;
  startedAt: Date;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStudentProgressDocument extends IStudentProgress, Document {}

export interface IProgressResponseDTO {
  progressPercentage: number;
  completedLessons: string[];
  completedQuizzes: string[];
  averageQuizScore: number;
  completed: boolean;
  lastActivity: Date;
}
