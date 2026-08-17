import type { User } from './user';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published' | 'archived' | 'pending_approval' | 'under_review' | 'rejected';
export type LessonType = 'video' | 'pdf' | 'text' | 'assignment' | 'article' | 'quiz';

export interface Resource {
  name: string;
  url: string;
}

export interface Lesson {
  _id: string;
  title: string;
  type: LessonType;
  content?: string;
  videoUrl?: string;
  videoPublicId?: string;
  duration: number;
  documentUrl?: string;
  documentPublicId?: string;
  isPreview: boolean;
  order: number;
  resources: Resource[];
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  _id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  courseCount: number;
}

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc?: string;
  thumbnail?: string;
  level: CourseLevel;
  language: string;
  price: number;
  isFree: boolean;
  status: CourseStatus;
  isFeatured?: boolean;
  tags: string[];
  category?: Category;
  instructor?: Partial<User>;
  prerequisites?: Partial<Course>[];
  learningOutcomes: string[];
  requirements: string[];
  sections: Section[];
  enrollmentCount: number;
  completionCount: number;
  averageRating: number;
  ratingCount: number;
  totalDuration: number;
  lessonCount?: number;
  sectionCount?: number;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: Partial<User>;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  _id: string;
  student: string | Partial<User>;
  course: string | Partial<Course>;
  status: 'active' | 'completed' | 'dropped';
  enrolledAt: string;
  completedAt?: string;
  progressPercentage: number;
  completedLessons: string[];
  lastAccessedAt?: string;
}

export interface CreateCoursePayload {
  title: string;
  description: string;
  shortDesc?: string;
  thumbnail?: string;
  level: CourseLevel;
  language?: string;
  price?: number;
  isFree?: boolean;
  tags?: string[];
  category?: string;
  prerequisites?: string[];
  learningOutcomes?: string[];
  requirements?: string[];
}

export interface CreateSectionPayload {
  title: string;
  description?: string;
  order?: number;
}

export interface CreateLessonPayload {
  title: string;
  type: LessonType;
  content?: string;
  videoUrl?: string;
  videoPublicId?: string;
  duration?: number;
  documentUrl?: string;
  documentPublicId?: string;
  isPreview?: boolean;
  order?: number;
  resources?: Resource[];
}

export interface UploadResult {
  url: string;
  publicId: string;
  duration?: number;
  format?: string;
}
