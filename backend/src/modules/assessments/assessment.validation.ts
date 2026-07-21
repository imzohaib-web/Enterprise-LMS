import { z } from 'zod';

export const optionSchema = z.union([
  z.string().min(1, 'Option text cannot be empty'),
  z.object({
    id: z.string().min(1, 'Option id is required'),
    text: z.string().min(1, 'Option text is required'),
  }),
]);

export const questionSchema = z.object({
  question: z.string().min(1, 'Question text is required'),
  options: z.array(optionSchema).min(2, 'At least 2 options are required'),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  marks: z.number().min(1, 'Marks must be at least 1').default(1),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  explanation: z.string().optional(),
});

export const createQuizSchema = z.object({
  title: z.string().min(3, 'Quiz title must be at least 3 characters long'),
  description: z.string().default(''),
  courseId: z.string().min(1, 'courseId is required'),
  lessonId: z.string().optional(),
  timeLimitMinutes: z.number().min(1, 'Time limit must be at least 1 minute').default(30),
  passingScore: z.number().min(0).max(100, 'Passing score must be between 0 and 100').default(70),
  questions: z.array(questionSchema).min(1, 'Quiz must have at least 1 question'),
});

export const updateQuizSchema = createQuizSchema.partial();

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
