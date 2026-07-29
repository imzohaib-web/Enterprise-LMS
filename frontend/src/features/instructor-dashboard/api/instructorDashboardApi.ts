import axiosInstance from '../../../api/axiosInstance';
import {
  InstructorStats,
  InstructorCourse,
  StudentProgressItem,
  QuizResultItem,
  ActivityItem,
  EnrollmentTrend,
  QuizPerformanceTrend,
} from '../types';

const MOCK_STATS: InstructorStats = {
  totalCourses: 12,
  totalStudents: 1450,
  publishedCourses: 9,
  pendingAssessments: 8,
  coursesGrowth: 8.5,
  studentsGrowth: 14.2,
  publishedGrowth: 5.0,
  pendingGrowth: -2.4,
};

const MOCK_COURSES: InstructorCourse[] = [
  {
    id: 'course-1',
    title: 'Advanced Full-Stack Engineering with Node.js & React',
    category: 'Software Engineering',
    status: 'published',
    enrolledStudents: 420,
    totalModules: 14,
    createdAt: '2026-01-15',
  },
  {
    id: 'course-2',
    title: 'Enterprise Architecture & Microservices',
    category: 'Cloud & Architecture',
    status: 'published',
    enrolledStudents: 310,
    totalModules: 10,
    createdAt: '2026-02-01',
  },
  {
    id: 'course-3',
    title: 'Docker & Kubernetes for Production Engineering',
    category: 'DevOps',
    status: 'published',
    enrolledStudents: 280,
    totalModules: 12,
    createdAt: '2026-03-10',
  },
  {
    id: 'course-4',
    title: 'Database Systems & SQL Optimization Mastery',
    category: 'Databases',
    status: 'published',
    enrolledStudents: 240,
    totalModules: 8,
    createdAt: '2026-04-05',
  },
  {
    id: 'course-5',
    title: 'Modern Cyber Security Fundamentals',
    category: 'Security',
    status: 'draft',
    enrolledStudents: 0,
    totalModules: 6,
    createdAt: '2026-06-20',
  },
  {
    id: 'course-6',
    title: 'AI & Machine Learning Model Deployment',
    category: 'Artificial Intelligence',
    status: 'draft',
    enrolledStudents: 0,
    totalModules: 15,
    createdAt: '2026-07-01',
  },
];

const MOCK_STUDENT_PROGRESS: StudentProgressItem[] = [
  {
    id: 'sp-1',
    studentName: 'Alexander Wright',
    studentEmail: 'alex.wright@example.com',
    avatar: '/images/user/owner.jpg',
    courseName: 'Advanced Full-Stack Engineering with Node.js & React',
    progressPercent: 88,
    completedModules: 12,
    totalModules: 14,
    avgScore: 94,
    lastActive: '2 hours ago',
  },
  {
    id: 'sp-2',
    studentName: 'Sophia Martinez',
    studentEmail: 'sophia.m@example.com',
    avatar: '/images/user/owner.jpg',
    courseName: 'Enterprise Architecture & Microservices',
    progressPercent: 72,
    completedModules: 7,
    totalModules: 10,
    avgScore: 88,
    lastActive: '5 hours ago',
  },
  {
    id: 'sp-3',
    studentName: 'David Chen',
    studentEmail: 'david.chen@example.com',
    avatar: '/images/user/owner.jpg',
    courseName: 'Docker & Kubernetes for Production Engineering',
    progressPercent: 95,
    completedModules: 11,
    totalModules: 12,
    avgScore: 96,
    lastActive: '1 day ago',
  },
  {
    id: 'sp-4',
    studentName: 'Emma Watson',
    studentEmail: 'emma.w@example.com',
    avatar: '/images/user/owner.jpg',
    courseName: 'Database Systems & SQL Optimization Mastery',
    progressPercent: 60,
    completedModules: 5,
    totalModules: 8,
    avgScore: 82,
    lastActive: '3 days ago',
  },
  {
    id: 'sp-5',
    studentName: 'Liam Johnson',
    studentEmail: 'liam.j@example.com',
    avatar: '/images/user/owner.jpg',
    courseName: 'Advanced Full-Stack Engineering with Node.js & React',
    progressPercent: 45,
    completedModules: 6,
    totalModules: 14,
    avgScore: 78,
    lastActive: '4 hours ago',
  },
];

const MOCK_QUIZ_RESULTS: QuizResultItem[] = [
  {
    id: 'qr-1',
    quizTitle: 'Node.js Event Loop & Async Architecture',
    courseName: 'Advanced Full-Stack Engineering with Node.js & React',
    studentName: 'Alexander Wright',
    studentAvatar: '/images/user/owner.jpg',
    score: 95,
    totalQuestions: 20,
    passed: true,
    attemptDate: '2026-07-22 14:30',
  },
  {
    id: 'qr-2',
    quizTitle: 'Microservices Communication Protocols',
    courseName: 'Enterprise Architecture & Microservices',
    studentName: 'Sophia Martinez',
    studentAvatar: '/images/user/owner.jpg',
    score: 85,
    totalQuestions: 15,
    passed: true,
    attemptDate: '2026-07-22 11:15',
  },
  {
    id: 'qr-3',
    quizTitle: 'Kubernetes Pod Ingress & Service Networking',
    courseName: 'Docker & Kubernetes for Production Engineering',
    studentName: 'David Chen',
    studentAvatar: '/images/user/owner.jpg',
    score: 98,
    totalQuestions: 25,
    passed: true,
    attemptDate: '2026-07-21 16:45',
  },
  {
    id: 'qr-4',
    quizTitle: 'SQL Indexing & Query Execution Plans',
    courseName: 'Database Systems & SQL Optimization Mastery',
    studentName: 'Emma Watson',
    studentAvatar: '/images/user/owner.jpg',
    score: 55,
    totalQuestions: 20,
    passed: false,
    attemptDate: '2026-07-20 09:20',
  },
  {
    id: 'qr-5',
    quizTitle: 'React Hooks & State Management Patterns',
    courseName: 'Advanced Full-Stack Engineering with Node.js & React',
    studentName: 'Liam Johnson',
    studentAvatar: '/images/user/owner.jpg',
    score: 90,
    totalQuestions: 10,
    passed: true,
    attemptDate: '2026-07-20 18:10',
  },
];

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'quiz_attempt',
    studentName: 'Alexander Wright',
    studentAvatar: '/images/user/owner.jpg',
    targetTitle: 'Node.js Event Loop & Async Architecture',
    scoreOrProgress: '95%',
    status: 'passed',
    timestamp: '10 minutes ago',
  },
  {
    id: 'act-2',
    type: 'enrollment',
    studentName: 'Olivia Taylor',
    studentAvatar: '/images/user/owner.jpg',
    targetTitle: 'Docker & Kubernetes for Production Engineering',
    status: 'enrolled',
    timestamp: '45 minutes ago',
  },
  {
    id: 'act-3',
    type: 'quiz_attempt',
    studentName: 'Emma Watson',
    studentAvatar: '/images/user/owner.jpg',
    targetTitle: 'SQL Indexing & Query Execution Plans',
    scoreOrProgress: '55%',
    status: 'failed',
    timestamp: '2 hours ago',
  },
  {
    id: 'act-4',
    type: 'enrollment',
    studentName: 'Ethan Davis',
    studentAvatar: '/images/user/owner.jpg',
    targetTitle: 'Advanced Full-Stack Engineering with Node.js & React',
    status: 'enrolled',
    timestamp: '3 hours ago',
  },
  {
    id: 'act-5',
    type: 'quiz_attempt',
    studentName: 'Sophia Martinez',
    studentAvatar: '/images/user/owner.jpg',
    targetTitle: 'Microservices Communication Protocols',
    scoreOrProgress: '85%',
    status: 'passed',
    timestamp: '5 hours ago',
  },
];

const MOCK_ENROLLMENT_TRENDS: EnrollmentTrend[] = [
  { month: 'Jan', enrollments: 120 },
  { month: 'Feb', enrollments: 185 },
  { month: 'Mar', enrollments: 240 },
  { month: 'Apr', enrollments: 310 },
  { month: 'May', enrollments: 290 },
  { month: 'Jun', enrollments: 380 },
  { month: 'Jul', enrollments: 450 },
];

const MOCK_QUIZ_PERFORMANCE_TRENDS: QuizPerformanceTrend[] = [
  { category: 'Full-Stack', averageScore: 88, passRate: 92 },
  { category: 'Architecture', averageScore: 82, passRate: 85 },
  { category: 'DevOps', averageScore: 91, passRate: 95 },
  { category: 'Databases', averageScore: 76, passRate: 78 },
  { category: 'Security', averageScore: 84, passRate: 88 },
];

export const getInstructorStats = async (): Promise<InstructorStats> => {
  try {
    const res = await axiosInstance.get('/instructor/dashboard/stats');
    return res.data?.data || MOCK_STATS;
  } catch (error) {
    return MOCK_STATS;
  }
};

export const getInstructorCourses = async (): Promise<InstructorCourse[]> => {
  try {
    const res = await axiosInstance.get('/instructor/courses');
    return res.data?.data || MOCK_COURSES;
  } catch (error) {
    return MOCK_COURSES;
  }
};

export const getStudentProgressList = async (): Promise<StudentProgressItem[]> => {
  try {
    const res = await axiosInstance.get('/instructor/students/progress');
    return res.data?.data || MOCK_STUDENT_PROGRESS;
  } catch (error) {
    return MOCK_STUDENT_PROGRESS;
  }
};

export const getQuizResultsList = async (): Promise<QuizResultItem[]> => {
  try {
    const res = await axiosInstance.get('/instructor/quiz-results');
    return res.data?.data || MOCK_QUIZ_RESULTS;
  } catch (error) {
    return MOCK_QUIZ_RESULTS;
  }
};

export const getInstructorActivities = async (): Promise<ActivityItem[]> => {
  try {
    const res = await axiosInstance.get('/instructor/activities');
    return res.data?.data || MOCK_ACTIVITIES;
  } catch (error) {
    return MOCK_ACTIVITIES;
  }
};

export const getEnrollmentTrends = async (): Promise<EnrollmentTrend[]> => {
  try {
    const res = await axiosInstance.get('/instructor/trends/enrollments');
    return res.data?.data || MOCK_ENROLLMENT_TRENDS;
  } catch (error) {
    return MOCK_ENROLLMENT_TRENDS;
  }
};

export const getQuizPerformanceTrends = async (): Promise<QuizPerformanceTrend[]> => {
  try {
    const res = await axiosInstance.get('/instructor/trends/quiz-performance');
    return res.data?.data || MOCK_QUIZ_PERFORMANCE_TRENDS;
  } catch (error) {
    return MOCK_QUIZ_PERFORMANCE_TRENDS;
  }
};
