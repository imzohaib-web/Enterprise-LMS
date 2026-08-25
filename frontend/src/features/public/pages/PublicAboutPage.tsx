import React from 'react';
import { motion } from 'framer-motion';
import PageMeta from '../../../components/common/PageMeta';
import {
  Target,
  Compass,
  Award,
  BookOpen,
  Users,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Code,
  Layers,
} from 'lucide-react';

export const PublicAboutPage: React.FC = () => {
  const stats = [
    { number: '10,000+', label: 'Active Students Enrolled', icon: <Users className="w-5 h-5 text-emerald-400" /> },
    { number: '250+', label: 'Production Courses & Labs', icon: <BookOpen className="w-5 h-5 text-gray-300" /> },
    { number: '50+', label: 'Industry Expert Mentors', icon: <Award className="w-5 h-5 text-amber-400" /> },
    { number: '95%', label: 'Placement & Credential Rate', icon: <TrendingUp className="w-5 h-5 text-emerald-400" /> },
  ];

  const milestones = [
    { year: '2024', title: 'Platform Foundation', description: 'Launched SkillForge LMS to deliver project-based engineering education and code sandboxes.' },
    { year: '2025', title: 'Incubator & Cohort Expansion', description: 'Partnered with tech incubators and engineering teams to deliver live cohort roadmaps.' },
    { year: '2026', title: 'Cryptographic Credential Trust', description: 'Integrated tamper-proof certificate verification and real-world microservice lab assertions.' },
  ];

  return (
    <>
      <PageMeta
        title="About | SkillForge LMS"
        description="Discover SkillForge LMS's mission to empower software developers and tech incubators with production-grade engineering curricula."
      />

      <div className="py-14 lg:py-20 relative z-10 space-y-16 bg-[#0B0E17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          {/* Hero Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl mx-auto space-y-3"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>OUR MISSION & VISION</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Bridging the Gap Between Learning & Production Engineering.
            </h1>
            <p className="text-sm sm:text-base text-gray-400 font-normal leading-relaxed max-w-2xl mx-auto">
              SkillForge LMS replaces outdated video-only tutorials with an interactive, assessment-driven, and verifiable learning environment designed for software architects and career switchers.
            </p>
          </motion.div>

          {/* Platform Statistics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {stats.map((st, idx) => (
              <motion.div
                key={st.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                className="p-6 rounded-2xl bg-[#090C15] border border-white/10 backdrop-blur-2xl text-center space-y-2"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/15 flex items-center justify-center mx-auto mb-2 text-white">
                  {st.icon}
                </div>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-white block tracking-tight">{st.number}</span>
                <p className="text-xs text-gray-400 font-normal">{st.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Mission & Vision Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-7 lg:p-8 rounded-2xl bg-[#090C15] border border-white/10 backdrop-blur-2xl space-y-4"
            >
              <div className="w-11 h-11 rounded-xl bg-white/[0.04] text-emerald-400 flex items-center justify-center border border-white/15">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Our Mission</h2>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
                To democratize enterprise-grade software engineering education by providing hands-on curricula, real-world microservice labs, and verifiable credentials that empower students to build meaningful careers.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-7 lg:p-8 rounded-2xl bg-[#090C15] border border-white/10 backdrop-blur-2xl space-y-4"
            >
              <div className="w-11 h-11 rounded-xl bg-white/[0.04] text-brand-300 flex items-center justify-center border border-white/15">
                <Compass className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Our Vision</h2>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
                To become the global trust standard for tech incubators, software academies, and enterprise engineering cohorts validating technical competency through cryptographically verifiable achievements.
              </p>
            </motion.div>
          </div>

          {/* Why Choose SkillForge LMS Grid */}
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono uppercase text-emerald-400">WHY SKILLFORGE LMS</span>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">Built for High-Impact Engineers</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.08 }}
                className="p-7 rounded-2xl bg-[#090C15] border border-white/10 backdrop-blur-2xl space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] text-white border border-white/15 flex items-center justify-center">
                  <Code className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">Production-Ready Curricula</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-normal">
                  Courses designed around modern React 19, Node.js microservices, Cloud Native DevOps, and Machine Learning.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.16 }}
                className="p-7 rounded-2xl bg-[#090C15] border border-white/10 backdrop-blur-2xl space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] text-emerald-400 border border-white/15 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">Verifiable Credentials</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-normal">
                  Instant employer verification codes for every issued certificate to demonstrate authentic skill mastery.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.24 }}
                className="p-7 rounded-2xl bg-[#090C15] border border-white/10 backdrop-blur-2xl space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] text-gray-300 border border-white/15 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">Guided Career Roadmaps</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-normal">
                  Sequential learning paths with progress tracking that guide students step-by-step from beginner to senior roles.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Stepped Timeline Section */}
          <div className="p-7 sm:p-10 rounded-2xl bg-[#090C15] border border-white/10 backdrop-blur-2xl space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono uppercase text-emerald-400">PLATFORM MILESTONES</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Our Journey So Far</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {milestones.map((m) => (
                <div key={m.year} className="relative space-y-2.5 p-5 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md inline-block">
                    {m.year}
                  </span>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {m.title}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-normal">{m.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default PublicAboutPage;
