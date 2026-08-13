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
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
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
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
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
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
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
    thumbnailUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
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
    thumbnailUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80',
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
    thumbnailUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
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
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
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
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
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
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
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
    thumbnailUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
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
    thumbnailUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
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
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    progress: 35,
  },
];

const featureList = [
  {
    id: 'f1',
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Interactive Courses & Labs',
    description: 'Rich modular lessons with embedded code sandboxes, automated test assertions, and downloadable architecture assets.',
    badge: 'Self-Paced',
  },
  {
    id: 'f2',
    icon: <Layers className="w-5 h-5" />,
    title: 'Guided Learning Paths',
    description: 'Structured career roadmaps designed by senior software architects to guide learners from foundation to principal level.',
    badge: 'Structured',
  },
  {
    id: 'f3',
    icon: <Award className="w-5 h-5" />,
    title: 'Automated Assessments',
    description: 'Timed quizzes, instant submission verification, and live test runner feedback to validate core technical competencies.',
    badge: 'Auto-Graded',
  },
  {
    id: 'f4',
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'Verified Credentials',
    description: 'Tamper-proof digital certificates featuring unique cryptographic verification codes for employer validation.',
    badge: 'Verifiable',
  },
  {
    id: 'f5',
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Real-Time Progress Tracking',
    description: 'Detailed analytics tracking syllabus progress, lab completion rates, accuracy stats, and study hours.',
    badge: 'Analytics',
  },
  {
    id: 'f6',
    icon: <MessageSquare className="w-5 h-5" />,
    title: 'Cohort Discussion Forums',
    description: 'Collaborative student-instructor forums to review code challenges, share project ideas, and facilitate peer review.',
    badge: 'Collaborative',
  },
  {
    id: 'f7',
    icon: <Bell className="w-5 h-5" />,
    title: 'Smart Notifications',
    description: 'Automated email and in-app alerts for quiz deadlines, grade releases, and critical cohort announcements.',
    badge: 'Automated',
  },
  {
    id: 'f8',
    icon: <Users className="w-5 h-5" />,
    title: 'Instructor Dashboard',
    description: 'Authoring control panel for instructors to publish courses, review submissions, and manage student cohorts.',
    badge: 'Instructor',
  },
  {
    id: 'f9',
    icon: <SlidersHorizontal className="w-5 h-5" />,
    title: 'Admin Governance & Analytics',
    description: 'Governance and compliance reporting insights for organizational administrators tracking overall program metrics.',
    badge: 'Enterprise',
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

      {/* Capabilities Infinite Horizontal Marquee Section */}
      <section className="py-14 lg:py-20 relative z-10 border-y border-white/[0.08] bg-[#0B0E17] backdrop-blur-2xl overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl mx-auto space-y-3"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>CAPABILITIES & PLATFORM ECOSYSTEM</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Enterprise Capabilities Built for End-to-End Skill Mastery.
            </h2>
            <p className="text-sm sm:text-base text-gray-400 font-normal max-w-2xl mx-auto leading-relaxed">
              From interactive coding sandboxes to automated assessment engines and cryptographically verified credentials, SkillForge powers complete workforce transformation.
            </p>
          </motion.div>
        </div>

        {/* Continuous Infinite Horizontal Marquee Track */}
        <div className="relative w-full overflow-hidden py-3">
          
          {/* Left Side Ambient Edge Gradient Mask Fade */}
          <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-44 bg-gradient-to-r from-[#0B0E17] via-[#0B0E17]/90 to-transparent z-20 pointer-events-none" />
          
          {/* Right Side Ambient Edge Gradient Mask Fade */}
          <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-44 bg-gradient-to-l from-[#0B0E17] via-[#0B0E17]/90 to-transparent z-20 pointer-events-none" />

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

      {/* Learning Paths Section */}
      <section id="paths" className="py-14 lg:py-20 relative z-10 border-t border-white/[0.08] bg-[#0B0E17] backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl mx-auto mb-12 space-y-3"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>CAREER ROADMAPS & PATHWAYS</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Structured Career Pathways.
            </h2>
            <p className="text-sm sm:text-base text-gray-400 font-normal max-w-2xl mx-auto leading-relaxed">
              Follow curated course sequences designed by principal software architects to achieve industry specialization.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {samplePaths.map((path, idx) => (
              <LearningPathCard key={path.id} path={path} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-14 lg:py-20 relative z-10 border-t border-white/[0.08] bg-[#0B0E17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl mx-auto mb-12 space-y-3"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>AUTHENTIC REVIEWS & PROMOTIONS</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Validated Outcomes from Industry Engineers.
            </h2>
            <p className="text-sm sm:text-base text-gray-400 font-normal max-w-2xl mx-auto leading-relaxed">
              Real reviews from software engineers, cloud architects, and team leads who accelerated their careers through SkillForge.
            </p>
          </motion.div>

          <Testimonials />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-14 lg:py-20 relative z-10 border-t border-white/[0.08] bg-[#0B0E17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl mx-auto mb-12 space-y-3"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Everything You Need to Know.
            </h2>
            <p className="text-sm sm:text-base text-gray-400 font-normal max-w-2xl mx-auto leading-relaxed">
              Answers regarding self-paced modules, cryptographic certificates, assessment grading, and enterprise team analytics.
            </p>
          </motion.div>

          <FAQAccordion />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <CTASection />
      </section>
    </>
  );
};

export default PublicHomePage;
