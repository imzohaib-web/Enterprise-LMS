import React from 'react';
import PageMeta from '../../../components/common/PageMeta';
import HeroSection from '../../../components/public/HeroSection';
import FeatureCard from '../../../components/public/FeatureCard';
import CourseCard, { CourseData } from '../../../components/public/CourseCard';
import LearningPathCard, { LearningPathData } from '../../../components/public/LearningPathCard';
import Testimonials from '../../../components/public/Testimonials';
import FAQAccordion from '../../../components/public/FAQAccordion';
import CTASection from '../../../components/public/CTASection';
import {
  GridIcon,
  TaskIcon,
  PieChartIcon,
  ShootingStarIcon,
  ChatIcon,
  MailIcon,
  UserCircleIcon,
  ListIcon,
  BoxIconLine,
} from '../../../icons';

const sampleCourses: CourseData[] = [
  {
    id: '1',
    title: 'Advanced React 19 & Enterprise Architecture',
    instructor: 'Alex Mercer',
    duration: '12 Weeks',
    level: 'Advanced',
    studentsEnrolled: 3420,
    rating: 4.9,
    price: 'Free',
    category: 'Frontend',
    imageBg: 'bg-gradient-to-br from-blue-600 to-indigo-800',
  },
  {
    id: '2',
    title: 'Node.js Microservices & Event-Driven Systems',
    instructor: 'Dr. Elena Rostova',
    duration: '10 Weeks',
    level: 'Intermediate',
    studentsEnrolled: 2850,
    rating: 4.8,
    price: 'Pro',
    category: 'Backend',
    imageBg: 'bg-gradient-to-br from-emerald-600 to-teal-800',
  },
  {
    id: '3',
    title: 'Python for Data Science & Neural Networks',
    instructor: 'David Chen',
    duration: '14 Weeks',
    level: 'Beginner',
    studentsEnrolled: 4120,
    rating: 4.9,
    price: 'Free',
    category: 'Data Science',
    imageBg: 'bg-gradient-to-br from-amber-500 to-orange-700',
  },
  {
    id: '4',
    title: 'Machine Learning Engineering & LLM Ops',
    instructor: 'Dr. Sarah Connor',
    duration: '16 Weeks',
    level: 'Advanced',
    studentsEnrolled: 1980,
    rating: 4.9,
    price: 'Pro',
    category: 'AI & ML',
    imageBg: 'bg-gradient-to-br from-purple-600 to-pink-800',
  },
  {
    id: '5',
    title: 'UI/UX Design Systems & Tailwind Engineering',
    instructor: 'Jessica Alba',
    duration: '8 Weeks',
    level: 'Beginner',
    studentsEnrolled: 2150,
    rating: 4.7,
    price: 'Free',
    category: 'UI/UX Design',
    imageBg: 'bg-gradient-to-br from-rose-500 to-red-700',
  },
  {
    id: '6',
    title: 'Cloud Native DevOps, Kubernetes & CI/CD',
    instructor: 'Marcus Vance',
    duration: '12 Weeks',
    level: 'Intermediate',
    studentsEnrolled: 3100,
    rating: 4.8,
    price: 'Pro',
    category: 'DevOps',
    imageBg: 'bg-gradient-to-br from-cyan-600 to-blue-800',
  },
];

const samplePaths: LearningPathData[] = [
  {
    id: '1',
    title: 'Frontend Engineer Career Path',
    difficulty: 'Intermediate',
    coursesCount: 6,
    duration: '4 Months',
    description: 'Master React, TypeScript, Next.js, component design systems, and web performance optimization.',
    skills: ['React', 'TypeScript', 'TailwindCSS', 'Redux Toolkit'],
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  {
    id: '2',
    title: 'Backend Systems Engineer',
    difficulty: 'Advanced',
    coursesCount: 8,
    duration: '5 Months',
    description: 'Build scalable Node.js microservices, PostgreSQL databases, Redis caching, and gRPC APIs.',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker'],
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  {
    id: '3',
    title: 'Full Stack Developer Track',
    difficulty: 'Beginner to Pro',
    coursesCount: 12,
    duration: '6 Months',
    description: 'Comprehensive end-to-end web engineering curriculum covering frontend, backend, and cloud setup.',
    skills: ['React', 'Node.js', 'REST APIs', 'Vite'],
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  },
  {
    id: '4',
    title: 'AI & ML Systems Engineer',
    difficulty: 'Advanced',
    coursesCount: 7,
    duration: '5 Months',
    description: 'Practical Machine Learning engineering, Python data pipelines, model deployment, and RAG architectures.',
    skills: ['Python', 'PyTorch', 'Scikit-Learn', 'LLMOps'],
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  {
    id: '5',
    title: 'DevOps & Site Reliability',
    difficulty: 'Intermediate',
    coursesCount: 6,
    duration: '4 Months',
    description: 'Automate infrastructure with Terraform, Kubernetes, GitHub Actions CI/CD pipelines, and Cloud infrastructure.',
    skills: ['Kubernetes', 'Docker', 'CI/CD', 'Terraform'],
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  },
  {
    id: '6',
    title: 'Cybersecurity & Appsec Specialist',
    difficulty: 'Intermediate',
    coursesCount: 5,
    duration: '3 Months',
    description: 'Learn secure coding practices, vulnerability assessments, OAuth2/JWT security, and web penetration testing.',
    skills: ['AppSec', 'OAuth2', 'Penetration Testing', 'Cryptography'],
    color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  },
];

export const PublicHomePage: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Enterprise LMS | Production-Grade Online Learning Platform"
        description="Learn industry-leading software development, cloud architecture, and AI skills with verified enterprise credentials."
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section (TASK 5) */}
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest bg-brand-50 dark:bg-brand-500/10 px-3 py-1 rounded-full">
              Enterprise Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Everything You Need to Scale Tech Education
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Built for individual learners, engineering cohorts, and professional incubator programs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ListIcon className="w-6 h-6" />}
              title="Interactive Courses"
              description="Rich modular lessons with embedded coding challenges, video walkthroughs, and downloadable assets."
              badge="Self-Paced"
            />
            <FeatureCard
              icon={<BoxIconLine className="w-6 h-6" />}
              title="Learning Paths"
              description="Structured career roadmaps designed by industry architects to guide learners from novice to senior engineer."
              badge="Structured"
            />
            <FeatureCard
              icon={<TaskIcon className="w-6 h-6" />}
              title="Interactive Assessments"
              description="Timed quizzes, automated submission grading, and instant feedback to validate core competencies."
            />
            <FeatureCard
              icon={<ShootingStarIcon className="w-6 h-6" />}
              title="Verified Certificates"
              description="Tamper-proof digital credentials featuring unique verification codes for employer validation."
              badge="Verifiable"
            />
            <FeatureCard
              icon={<PieChartIcon className="w-6 h-6" />}
              title="Progress Tracking"
              description="Real-time analytics dashboards tracking study hours, lesson completion, and quiz accuracy."
            />
            <FeatureCard
              icon={<ChatIcon className="w-6 h-6" />}
              title="Discussion Forums"
              description="Collaborative student-instructor forums to discuss code problems, project ideas, and peer feedback."
            />
            <FeatureCard
              icon={<MailIcon className="w-6 h-6" />}
              title="Smart Notifications"
              description="Automated email and in-app alerts for quiz deadlines, grade releases, and announcement updates."
            />
            <FeatureCard
              icon={<UserCircleIcon className="w-6 h-6" />}
              title="Instructor Dashboard"
              description="Authoring control panel for instructors to publish courses, review submissions, and manage students."
            />
            <FeatureCard
              icon={<GridIcon className="w-6 h-6" />}
              title="Admin Analytics"
              description="Governance and reporting insights for organizational administrators tracking overall program metrics."
            />
          </div>
        </div>
      </section>

      {/* Popular Courses Section (TASK 6) */}
      <section className="py-16 lg:py-24 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-brand-500 uppercase tracking-widest bg-brand-50 dark:bg-brand-500/10 px-3 py-1 rounded-full">
                Featured Curriculum
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-3">
                Explore Popular Courses
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
              Handcrafted modules taught by senior software architects and industry leaders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sampleCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Learning Paths Section (TASK 7) */}
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest bg-brand-50 dark:bg-brand-500/10 px-3 py-1 rounded-full">
              Career Acceleration
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Guided Learning Paths & Roadmaps
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Follow curated course sequences to achieve industry specialization in record time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {samplePaths.map((path) => (
              <LearningPathCard key={path.id} path={path} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section (TASK 8) */}
      <section className="py-16 lg:py-24 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest bg-brand-50 dark:bg-brand-500/10 px-3 py-1 rounded-full">
              Student Success Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Trusted by Engineers Worldwide
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Read how Enterprise LMS helped students land promotions and launch tech startups.
            </p>
          </div>

          <Testimonials />
        </div>
      </section>

      {/* FAQ Section (TASK 9) */}
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest bg-brand-50 dark:bg-brand-500/10 px-3 py-1 rounded-full">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <FAQAccordion />
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection />
      </section>
    </>
  );
};

export default PublicHomePage;
