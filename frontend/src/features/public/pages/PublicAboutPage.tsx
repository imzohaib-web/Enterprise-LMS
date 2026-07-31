import React from 'react';
import { motion } from 'framer-motion';
import PageMeta from '../../../components/common/PageMeta';
import {
  Target,
  Compass,
  Sparkles,
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
    { number: '10,000+', label: 'Active Students Enrolled', icon: <Users className="w-6 h-6 text-brand-400" /> },
    { number: '250+', label: 'Production Courses & Labs', icon: <BookOpen className="w-6 h-6 text-blue-400" /> },
    { number: '50+', label: 'Industry Expert Mentors', icon: <Award className="w-6 h-6 text-purple-400" /> },
    { number: '95%', label: 'Placement & Certificate Rate', icon: <TrendingUp className="w-6 h-6 text-emerald-400" /> },
  ];

  const milestones = [
    { year: '2024', title: 'Platform Foundation', description: 'Launched SkillForge LMS to provide practical, project-based engineering education.' },
    { year: '2025', title: 'Incubator & Cohort Expansion', description: 'Partnered with tech incubators and enterprise engineering teams to deliver live cohort roadmaps.' },
    { year: '2026', title: 'Cryptographic Credential Trust', description: 'Integrated tamper-proof certificate verification and real-world microservice labs.' },
  ];

  return (
    <>
      <PageMeta
        title="About SkillForge LMS | Modern EdTech Academy"
        description="Discover SkillForge LMS's mission to empower developers and tech incubators with production-grade engineering curricula."
      />

      <div className="py-12 lg:py-16 relative z-10 space-y-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Hero Banner */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-brand-400 bg-brand-500/10 border border-brand-500/20 px-4 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Our Mission & Vision
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              Bridging the Gap Between Learning & Production Engineering
            </h1>
            <p className="text-base text-gray-300 font-normal leading-relaxed">
              SkillForge LMS replaces outdated video-only tutorials with an interactive, assessment-driven, and verifiable learning environment designed for modern software architects and career switchers.
            </p>
          </motion.div>

          {/* Platform Statistics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((st, idx) => (
              <motion.div
                key={st.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl text-center space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                  {st.icon}
                </div>
                <span className="text-3xl lg:text-4xl font-black text-white block tracking-tight">{st.number}</span>
                <p className="text-xs font-medium text-gray-400">{st.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Mission & Vision Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 lg:p-10 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl space-y-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
                <Target className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Our Mission</h2>
              <p className="text-sm text-gray-300 leading-relaxed font-normal">
                To democratize enterprise-grade software engineering education by providing hands-on curricula, real-world microservice labs, and verifiable credentials that empower students to build meaningful careers.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 lg:p-10 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl space-y-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Compass className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Our Vision</h2>
              <p className="text-sm text-gray-300 leading-relaxed font-normal">
                To become the global trust standard for tech incubators, software academies, and enterprise engineering cohorts validating technical competency through cryptographically verifiable achievements.
              </p>
            </motion.div>
          </div>

          {/* Why Choose SkillForge LMS Grid */}
          <div className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-brand-400">Why SkillForge LMS</span>
              <h2 className="text-3xl font-black text-white">Built for High-Impact Engineers</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl space-y-4"
              >
                <div className="p-3 w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Code className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Production-Ready Curricula</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Courses designed around modern React 19, Node.js microservices, Cloud Native DevOps, and Machine Learning.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl space-y-4"
              >
                <div className="p-3 w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Verifiable Credentials</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Instant employer verification codes for every issued certificate to demonstrate authentic skill mastery.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl space-y-4"
              >
                <div className="p-3 w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Guided Career Roadmaps</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Sequential learning paths with progress tracking that guide students step-by-step from beginner to senior roles.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Stepped Timeline Section */}
          <div className="p-8 sm:p-12 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-brand-400">Platform Milestones</span>
              <h2 className="text-3xl font-black text-white">Our Journey So Far</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {milestones.map((m) => (
                <div key={m.year} className="relative space-y-3 p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                  <span className="px-3 py-1 text-2xs font-extrabold text-brand-300 bg-brand-500/20 border border-brand-500/30 rounded-full inline-block">
                    {m.year}
                  </span>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {m.title}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{m.description}</p>
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
