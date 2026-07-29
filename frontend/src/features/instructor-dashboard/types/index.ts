export interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  publishedCourses: number;
  pendingAssessments: number;
  coursesGrowth?: number;
  studentsGrowth?: number;
  publishedGrowth?: number;
  pendingGrowth?: number;
}

export interface InstructorCourse {
  id: string;
  title: string;
  category: string;
  status: 'published' | 'draft';
  enrolledStudents: number;
  totalModules: number;
  createdAt: string;
  thumbnailUrl?: string;
}

export interface StudentProgressItem {
  id: string;
  studentName: string;
  studentEmail: string;
  avatar?: string;
  courseName: string;
  progressPercent: number;
  completedModules: number;
  totalModules: number;
  avgScore: number;
  lastActive: string;
}

export interface QuizResultItem {
  id: string;
  quizTitle: string;
  courseName: string;
  studentName: string;
  studentAvatar?: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  attemptDate: string;
}

export interface ActivityItem {
  id: string;
  type: 'quiz_attempt' | 'enrollment';
  studentName: string;
  studentAvatar?: string;
  targetTitle: string;
  scoreOrProgress?: string;
  status?: 'passed' | 'failed' | 'enrolled';
  timestamp: string;
}

export interface EnrollmentTrend {
  month: string;
  enrollments: number;
}

export interface QuizPerformanceTrend {
  category: string;
  averageScore: number;
  passRate: number;
}
