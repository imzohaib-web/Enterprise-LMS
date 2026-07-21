export interface Option {
  id: string;
  text: string;
}

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id?: string;
  questionText: string;
  options: Option[];
  correctAnswer: string;
  marks: number;
  explanation?: string;
  difficulty: QuestionDifficulty;
}

export interface Quiz {
  id: string;
  title: string;
  courseId: string;
  lessonId?: string;
  description: string;
  timeLimitMinutes: number;
  passingScore: number;
  questions: Question[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SubmittedAnswer {
  questionId: string;
  selectedOptionId: string;
}

export interface QuizSubmission {
  quizId: string;
  userId: string;
  answers: SubmittedAnswer[];
}

export interface AttemptAnswerResult {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  marksAwarded: number;
}

export type QuizAttemptStatus = 'in-progress' | 'completed' | 'timed-out';

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: AttemptAnswerResult[];
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  completedAt?: string;
  status: QuizAttemptStatus;
}
