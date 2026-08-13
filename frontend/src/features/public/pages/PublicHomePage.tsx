import React from 'react';
import { motion } from 'framer-motion';
import PageMeta from '../../../components/common/PageMeta';
import HeroSection from '../../../components/public/HeroSection';
import FeatureCard from '../../../components/public/FeatureCard';
import CourseCard, { CourseData } from '../../../components/public/CourseCard';
import LearningPathCard, { LearningPathData } from '../../../components/public/LearningPathCard';
import Testimonials from '../../../components/public/Testimonials';
import FAQAccordion from '../../../components/public/FAQAccordion';
import CTASection from '../../../components/public/CTASection';
import {
  BookOpen,
  Layers,
  Award,
  ShieldCheck,
  BarChart3,
  MessageSquare,
  Bell,
  Users,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

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
    imageBg: 'bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900',
    progress: 85,
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
    imageBg: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900',
    progress: 60,
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
    imageBg: 'bg-gradient-to-br from-amber-500 via-orange-700 to-slate-900',
    progress: 40,
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
    imageBg: 'bg-gradient-to-br from-purple-600 via-pink-700 to-slate-900',
    progress: 90,
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
    imageBg: 'bg-gradient-to-br from-rose-500 via-red-700 to-slate-900',
    progress: 55,
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
    imageBg: 'bg-gradient-to-br from-cyan-600 via-blue-800 to-slate-900',
    progress: 70,
  },
];

const samplePaths: LearningPathData[] = [
  {
    id: '1',
    title: 'Frontend Engineer Career Path',
    difficulty: 'Intermediate',
    coursesCount: 6,
    duration: '4 Months',
    description: 'Master React 19, TypeScript, Next.js, component design systems, and web performance optimization.',
    skills: ['React 19', 'TypeScript', 'TailwindCSS', 'Redux Toolkit'],
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    progress: 80,
  },
  {
    id: '2',
    title: 'Backend Systems Engineer',
    difficulty: 'Advanced',
    coursesCount: 8,
    duration: '5 Months',
    description: 'Build scalable Node.js microservices, PostgreSQL databases, Redis caching, and gRPC APIs.',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker'],
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    progress: 65,
  },
  {
    id: '3',
    title: 'Full Stack Developer Track',
    difficulty: 'Beginner to Pro',
    coursesCount: 12,
    duration: '6 Months',
    description: 'Comprehensive end-to-end web engineering curriculum covering frontend, backend, and cloud setup.',
    skills: ['React', 'Node.js', 'REST APIs', 'Vite'],
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    progress: 45,
  },
  {
    id: '4',
    title: 'AI & ML Systems Engineer',
    difficulty: 'Advanced',
    coursesCount: 7,
    duration: '5 Months',
    description: 'Practical Machine Learning engineering, Python data pipelines, model deployment, and RAG architectures.',
    skills: ['Python', 'PyTorch', 'Scikit-Learn', 'LLMOps'],
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    progress: 90,
  },
  {
    id: '5',
    title: 'DevOps & Site Reliability',
    difficulty: 'Intermediate',
    coursesCount: 6,
    duration: '4 Months',
    description: 'Automate infrastructure with Terraform, Kubernetes, GitHub Actions CI/CD pipelines, and Cloud setup.',
    skills: ['Kubernetes', 'Docker', 'CI/CD', 'Terraform'],
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    progress: 50,
  },
  {
    id: '6',
    title: 'Cybersecurity & Appsec Specialist',
    difficulty: 'Intermediate',
    coursesCount: 5,
    duration: '3 Months',
    description: 'Learn secure coding practices, vulnerability assessments, OAuth2/JWT security, and web penetration testing.',
    skills: ['AppSec', 'OAuth2', 'Penetration Testing', 'Cryptography'],
    color: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    progress: 35,
  },
];

const featureList = [
  {
    id: 'f1',
    icon: <BookOpen className="w-7 h-7" />,
    title: 'Interactive Courses',
    description: 'Rich modular lessons with embedded coding challenges, video walkthroughs, and downloadable assets.',
    badge: 'Self-Paced',
    color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
  },
  {
    id: 'f2',
    icon: <Layers className="w-7 h-7" />,
    title: 'Learning Paths',
    description: 'Structured career roadmaps designed by senior software architects to guide learners from novice to principal.',
    badge: 'Structured',
    color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
  },
  {
    id: 'f3',
    icon: <Award className="w-7 h-7" />,
    title: 'Interactive Assessments',
    description: 'Timed quizzes, automated submission grading, and instant feedback to validate core technical competencies.',
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
  },
  {
    id: 'f4',
    icon: <ShieldCheck className="w-7 h-7" />,
    title: 'Verified Credentials',
    description: 'Tamper-proof digital credentials featuring unique verification codes for employer validation.',
    badge: 'Verifiable',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'f5',
    icon: <BarChart3 className="w-7 h-7" />,
    title: 'Progress Analytics',
    description: 'Real-time performance dashboards tracking study hours, lesson completion, and quiz accuracy.',
    color: 'from-brand-500/20 to-cyan-500/20 text-brand-400 border-brand-500/30',
  },
  {
    id: 'f6',
    icon: <MessageSquare className="w-7 h-7" />,
    title: 'Discussion Forums',
    description: 'Collaborative student-instructor forums to discuss code problems, project ideas, and peer review.',
    color: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30',
  },
  {
    id: 'f7',
    icon: <Bell className="w-7 h-7" />,
    title: 'Smart Notifications',
    description: 'Automated email and in-app alerts for quiz deadlines, grade releases, and announcement updates.',
    color: 'from-indigo-500/20 to-blue-500/20 text-indigo-400 border-indigo-500/30',
  },
  {
    id: 'f8',
    icon: <Users className="w-7 h-7" />,
    title: 'Instructor Dashboard',
    description: 'Authoring control panel for instructors to publish courses, review submissions, and manage student cohorts.',
    color: 'from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30',
  },
  {
    id: 'f9',
    icon: <SlidersHorizontal className="w-7 h-7" />,
    title: 'Admin Analytics',
    description: 'Governance and reporting insights for organizational administrators tracking overall program metrics.',
    color: 'from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/30',
  },
];

export const PublicHomePage: React.FC = () => {
  // Duplicate features array for seamless infinite marquee scrolling
  const marqueeFeatures = [...featureList, ...featureList];

  return (
    <>
      <PageMeta
        title="SkillForge LMS | Production-Grade EdTech SaaS Platform"
        description="Learn industry-leading software development, cloud architecture, and AI skills with verified enterprise credentials."
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Infinite Horizontal Marquee Section (Compact Spacing) */}
      <section className="py-12 lg:py-16 relative z-10 border-y border-white/[0.08] bg-[#0E1322]/80 backdrop-blur-2xl overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto space-y-3"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-brand-400 bg-brand-500/10 border border-brand-500/20 px-4 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Enterprise Ecosystem
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Empowering Future IT Talent Through a Seamless Process
            </h2>
            <p className="text-base text-gray-400 font-normal max-w-2xl mx-auto">
              From foundational coding to enterprise cloud architecture, master real-world skills through interactive labs, cohort mentorship, and verifiable credentials.
            </p>
          </motion.div>
        </div>

        {/* Custom Sheryians-Style Infinite Horizontal Marquee Track */}
        <div className="relative w-full overflow-hidden py-2">
          
          {/* Left Side Ambient Edge Gradient Mask Fade */}
          <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-[#0C101A] via-[#0C101A]/80 to-transparent z-20 pointer-events-none" />
          
          {/* Right Side Ambient Edge Gradient Mask Fade */}
          <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-[#0C101A] via-[#0C101A]/80 to-transparent z-20 pointer-events-none" />

          {/* Continuous Auto-Scrolling Track */}
          <div className="overflow-x-auto hide-scrollbar flex w-full">
            <div className="animate-marquee flex items-center gap-6 sm:gap-8 px-4">
              {marqueeFeatures.map((item, idx) => (
                <FeatureCard
                  key={`${item.id}-${idx}`}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  badge={item.badge}
                  color={item.color}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Featured Courses Section (Compact Spacing) */}
      <section className="py-12 lg:py-16 relative z-10 bg-gradient-to-b from-[#0C101A] via-[#090D16] to-[#0D1220]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6"
          >
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-brand-400 bg-brand-500/10 border border-brand-500/20 px-4 py-1.5 rounded-full">
                Curriculum Catalog
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Explore Popular Courses
              </h2>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              Handcrafted modules taught by senior software architects and industry incubator mentors.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sampleCourses.map((course, idx) => (
              <CourseCard key={course.id} course={course} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Learning Paths Section (Compact Spacing) */}
      <section id="paths" className="py-12 lg:py-16 relative z-10 border-t border-white/10 bg-[#0D1220] backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto mb-10 space-y-3"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-brand-400 bg-brand-500/10 border border-brand-500/20 px-4 py-1.5 rounded-full">
              Career Roadmaps
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Guided Learning Paths
            </h2>
            <p className="text-base text-gray-400 font-normal">
              Follow curated course sequences to achieve industry specialization in record time.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {samplePaths.map((path, idx) => (
              <LearningPathCard key={path.id} path={path} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section (Compact Spacing) */}
      <section className="py-12 lg:py-16 relative z-10 bg-gradient-to-b from-[#0D1220] via-[#090D16] to-[#0C101A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto mb-10 space-y-3"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-brand-400 bg-brand-500/10 border border-brand-500/20 px-4 py-1.5 rounded-full">
              Student Success Stories
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Trusted by Engineers Worldwide
            </h2>
            <p className="text-base text-gray-400">
              Read how SkillForge LMS helped developers land promotions and launch tech startups.
            </p>
          </motion.div>

          <Testimonials />
        </div>
      </section>

      {/* FAQ Section (Compact Spacing) */}
      <section className="py-12 lg:py-16 relative z-10 border-t border-white/10 bg-[#0C101A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto mb-10 space-y-3"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-brand-400 bg-brand-500/10 border border-brand-500/20 px-4 py-1.5 rounded-full">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <FAQAccordion />
        </div>
      </section>

      {/* CTA Section (Compact Spacing) */}
      <section className="py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <CTASection />
      </section>
    </>
  );
};

export default PublicHomePage;
