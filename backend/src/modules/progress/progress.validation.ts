import { z } from 'zod';

export const courseProgressParamsSchema = z.object({
  courseId: z.string().min(1, 'courseId is required'),
});

export const completeLessonParamsSchema = z.object({
  courseId: z.string().min(1, 'courseId is required'),
  lessonId: z.string().min(1, 'lessonId is required'),
});

export type CourseProgressParams = z.infer<typeof courseProgressParamsSchema>;
export type CompleteLessonParams = z.infer<typeof completeLessonParamsSchema>;
