export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id?: string;
  _id?: string;
  question: string;
  options: (Option | string)[];
  correctAnswer?: string;
  marks: number;
  explanation?: string;
  difficulty: QuestionDifficulty;
}

export interface Quiz {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  courseId: string;
  lessonId?: string;
  timeLimitMinutes: number;
  passingScore: number;
  questions: Question[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SubmittedAnswer {
  questionId: string;
  selectedOption: string;
}

export interface QuizSubmissionInput {
  studentId?: string;
  answers: SubmittedAnswer[];
  timeTakenSeconds?: number;
}

export interface QuizEvaluationResult {
  score: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  passed: boolean;
  timeTaken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: any;
}
