import type { Course } from './course';

export type PathLevel = 'beginner' | 'intermediate' | 'advanced';

export interface PathCourse {
  course: Partial<Course>;
  order: number;
  isRequired: boolean;
}

export interface LearningPath {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  level: PathLevel;
  thumbnail?: string;
  tags: string[];
  isPublished: boolean;
  createdBy?: { firstName: string; lastName: string };
  courses: PathCourse[];
  enrollmentCount: number;
  estimatedHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLearningPathPayload {
  title: string;
  description?: string;
  level: PathLevel;
  thumbnail?: string;
  tags?: string[];
  isPublished?: boolean;
  courses?: { course: string; order: number; isRequired?: boolean }[];
}
