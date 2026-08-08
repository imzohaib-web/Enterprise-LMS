import type { Course, Section, Lesson } from '../../types/course';
import type { CourseProgressData } from '../../services/progress.service';

export interface FlatLesson extends Lesson {
  sectionId: string;
  sectionTitle: string;
  sectionOrder: number;
  flatIndex: number;
}

export interface CoursePlayerContextType {
  course: Course;
  sections: Section[];
  flatLessons: FlatLesson[];
  activeLesson: FlatLesson | null;
  activeLessonIndex: number;
  progress: CourseProgressData | null;
  completedLessonIds: Set<string>;
  isEnrolled: boolean;
  onSelectLesson: (lessonId: string) => void;
  onMarkComplete: (lessonId: string) => Promise<void>;
  onNextLesson: () => void;
  onPrevLesson: () => void;
  isMarkingComplete: boolean;
}
