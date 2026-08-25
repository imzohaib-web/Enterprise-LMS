export interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  publishedCourses: number;
  draftCourses?: number;
  assignedCourses?: number;
  activeEnrollments?: number;
  upcomingAssessments?: number;
  pendingAssessments: number;
  pendingQuizReviews?: number;
  certificatesIssued?: number;
  learningPaths?: number;
  recentDiscussions?: number;
  notifications?: number;
  coursesGrowth?: number;
  studentsGrowth?: number;
  publishedGrowth?: number;
  pendingGrowth?: number;
  recentActivity?: ActivityItem[];
}

export interface InstructorCourse {
  id: string;
  _id?: string;
  title: string;
  category: string;
  description?: string;
  status: 'published' | 'draft' | 'archived' | 'pending_approval' | 'under_review' | 'rejected';
  enrolledStudents: number;
  enrolledStudentsCount?: number;
  totalModules: number;
  lessonsCount?: number;
  assessmentsCount?: number;
  createdAt: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  coverImage?: string;
  price?: number;
  rating?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  sections?: any[];
}

export interface StudentProgressItem {
  id: string;
  studentId?: string;
  studentName: string;
  studentEmail: string;
  avatar?: string;
  courseId?: string;
  courseName: string;
  progressPercent: number;
  completedModules: number;
  totalModules: number;
  status?: 'active' | 'completed' | 'in_progress' | string;
  avgScore: number;
  lastActive: string;
  enrolledAt?: string;
  quizAttempts?: {
    id: string;
    quizTitle: string;
    percentage: number;
    passed: boolean;
    attemptDate: string;
  }[];
  assignmentSubmissions?: {
    id: string;
    assignmentTitle: string;
    fileName?: string;
    fileUrl?: string;
    score: number;
    maxScore: number;
    status: string;
    submittedAt: string;
  }[];
}

export interface QuizAnswerDetail {
  questionId: string;
  questionText: string;
  type?: 'mcq' | 'true_false' | 'short_answer' | 'long_answer' | 'code' | string;
  options?: string[] | any[];
  correctAnswer?: string;
  marks?: number;
  explanation?: string;
  selectedOption?: string;
  textAnswer?: string;
  codeAnswer?: string;
  submittedAnswer?: string;
  isCorrect?: boolean;
  marksAwarded?: number;
  feedback?: string;
}

export interface QuizResultItem {
  id: string;
  _id?: string;
  quizTitle: string;
  courseName: string;
  studentName: string;
  studentEmail?: string;
  studentAvatar?: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  status?: 'submitted' | 'reviewed' | 'pending_review';
  attemptDate: string;
  feedback?: string;
  answers?: QuizAnswerDetail[];
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

export interface InstructorProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  department?: string;
  qualification?: string;
  specialization?: string;
  experience?: string;
  bio?: string;
  joinedDate?: string;
  stats?: {
    totalCourses?: number;
    totalStudents?: number;
    totalAssessments?: number;
    avgRating?: number;
  };
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
  settings?: any;
}

export interface DiscussionItem {
  id: string;
  title: string;
  content: string;
  courseName: string;
  authorName: string;
  authorAvatar?: string;
  isPinned: boolean;
  isLocked: boolean;
  tags?: string[];
  repliesCount: number;
  replies?: any[];
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'assessment' | 'course' | 'enrollment' | 'discussion' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface InstructorAssignment {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  instructions?: string;
  courseId: string;
  courseTitle?: string;
  lessonId?: string;
  dueDate: string;
  maxScore: number;
  allowedFileTypes?: string[];
  status?: 'published' | 'draft' | 'archived';
  submissionCount?: number;
  gradedCount?: number;
  createdAt?: string;
}

export interface AssignmentSubmissionItem {
  id: string;
  assignmentId: string;
  assignmentTitle?: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentAvatar?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  textSubmission?: string;
  status: 'submitted' | 'graded' | 'resubmitted';
  score: number;
  maxScore: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string | null;
}

export interface InstructorCertificate {
  id: string;
  certificateId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  courseId: string;
  courseTitle: string;
  verificationCode: string;
  certificateUrl: string;
  qrCode?: string;
  issuedAt: string;
  status: string;
}
