import { Document, Types } from 'mongoose';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'long_answer' | 'code';
export type AssessmentStatus = 'draft' | 'published' | 'scheduled' | 'archived';
export type AssessmentType = 'quiz' | 'assignment' | 'exam';

export interface IOption {
  id: string;
  text: string;
}

export interface IQuestion {
  _id?: Types.ObjectId | string;
  question: string;
  type?: QuestionType;
  options?: IOption[] | string[];
  correctAnswer?: string;
  marks: number;
  explanation?: string;
  difficulty?: QuestionDifficulty;
  imageUrl?: string;
}

export interface IQuiz {
  title: string;
  description?: string;
  courseId: Types.ObjectId | string;
  lessonId?: Types.ObjectId | string;
  instructorId?: Types.ObjectId | string;
  type?: AssessmentType;
  status?: AssessmentStatus;
  dueDate?: Date | string;
  scheduledFor?: Date | string;
  timeLimitMinutes: number;
  passingScore: number;
  totalMarks?: number;
  attemptsAllowed?: number;
  shuffleQuestions?: boolean;
  negativeMarking?: boolean;
  negativeMarksPerQuestion?: number;
  visibility?: 'public' | 'enrolled' | 'private';
  questions: IQuestion[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQuizDocument extends IQuiz, Document {}

export interface ISubmittedAnswer {
  questionId: string;
  selectedOption?: string;
  textAnswer?: string;
  codeAnswer?: string;
}

export interface ISubmitQuizInput {
  studentId?: string;
  answers: ISubmittedAnswer[];
  timeTakenSeconds?: number;
}

export interface IEvaluatedAnswer {
  questionId: string;
  selectedOption?: string;
  textAnswer?: string;
  codeAnswer?: string;
  isCorrect: boolean;
  marksAwarded: number;
  feedback?: string;
}

export interface IQuizAttempt {
  quizId: Types.ObjectId | string;
  studentId: Types.ObjectId | string;
  courseId?: Types.ObjectId | string;
  instructorId?: Types.ObjectId | string;
  answers: IEvaluatedAnswer[];
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  status?: 'submitted' | 'reviewed' | 'pending_review';
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
