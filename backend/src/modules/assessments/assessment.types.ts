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

export interface ISubmittedAnswer {
  questionId: string;
  selectedOption: string;
}

export interface ISubmitQuizInput {
  studentId?: string;
  answers: ISubmittedAnswer[];
  timeTakenSeconds?: number;
}

export interface IEvaluatedAnswer {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  marksAwarded: number;
}

export interface IQuizAttempt {
  quizId: Types.ObjectId | string;
  studentId: Types.ObjectId | string;
  answers: IEvaluatedAnswer[];
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  correctAnswersCount: number;
  wrongAnswersCount: number;
  timeTakenSeconds: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQuizAttemptDocument extends IQuizAttempt, Document {}

export interface IQuizEvaluationResponse {
  score: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  passed: boolean;
  timeTaken: string;
}

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
