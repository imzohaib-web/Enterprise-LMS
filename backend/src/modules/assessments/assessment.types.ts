import { Document, Types } from 'mongoose';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface IOption {
  id: string;
  text: string;
}

export interface IQuestion {
  _id?: Types.ObjectId | string;
  question: string;
  options: IOption[] | string[];
  correctAnswer: string;
  marks: number;
  explanation?: string;
  difficulty: QuestionDifficulty;
}

export interface IQuiz {
  title: string;
  description: string;
  courseId: Types.ObjectId | string;
  lessonId?: Types.ObjectId | string;
  timeLimitMinutes: number;
  passingScore: number;
  questions: IQuestion[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQuizDocument extends IQuiz, Document {}

export type UserRole = 'student' | 'instructor' | 'admin';

export interface AuthUser {
  id: string;
  role: UserRole;
  email?: string;
}

export interface StandardApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}
