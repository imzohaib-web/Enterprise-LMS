import { Schema, model } from 'mongoose';
import { IQuizDocument } from './assessment.types';

const QuestionSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    options: { type: Schema.Types.Mixed, required: true },
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

const QuizSchema = new Schema<IQuizDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', index: true },
    timeLimitMinutes: { type: Number, required: true, min: 1, default: 30 },
    passingScore: { type: Number, required: true, min: 0, max: 100, default: 70 },
    questions: { type: [QuestionSchema], required: true },
  },
  { timestamps: true }
);

export const QuizModel = model<IQuizDocument>('Quiz', QuizSchema);
