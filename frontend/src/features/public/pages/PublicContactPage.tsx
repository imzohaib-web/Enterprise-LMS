import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageMeta from '../../../components/common/PageMeta';
import CTASection from '../../../components/public/CTASection';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

export const PublicContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const onSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <PageMeta
        title="Contact Support | SkillForge LMS"
        description="Get in touch with SkillForge LMS support, incubator partnerships, and enterprise admissions."
      />

      <div className="py-12 lg:py-16 relative z-10 space-y-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header Banner */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-brand-400 bg-brand-500/10 border border-brand-500/20 px-4 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Get In Touch
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
              We're Here to Help Your Team Scale
            </h1>
            <p className="text-base text-gray-400 font-normal max-w-xl mx-auto">
              Have questions about enterprise cohort licensing, incubator onboarding, or technical course authoring? Reach out to our admissions team.
            </p>
          </motion.div>

          {/* 2-Column Contact Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Contact Info Glass Cards */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5 space-y-6"
            >
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand-400" /> Contact Information
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Our enterprise support team is available Monday through Friday to assist with technical queries and cohort setup.
                </p>

                <div className="space-y-5 pt-2">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-2xs font-bold text-gray-400 uppercase tracking-wider block">Email Support</span>
                      <a href="mailto:support@skillforgelms.com" className="text-sm font-bold text-white hover:text-brand-300 transition-colors">
                        support@skillforgelms.com
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-2xs font-bold text-gray-400 uppercase tracking-wider block">Admissions Hotline</span>
                      <a href="tel:+18005558842" className="text-sm font-bold text-white hover:text-emerald-300 transition-colors">
                        +1 (800) 555-8842
                      </a>
                    </div>
                  </div>

                  {/* Office Address */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-2xs font-bold text-gray-400 uppercase tracking-wider block">Incubator HQ</span>
                      <p className="text-sm font-semibold text-white">
                        100 Tech Academy Plaza, Suite 400<br />San Francisco, CA 94107
                      </p>
                    </div>
                  </div>

                  {/* Office Hours */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-2xs font-bold text-gray-400 uppercase tracking-wider block">Office Hours</span>
                      <p className="text-sm font-semibold text-white">
                        Mon – Fri: 9:00 AM – 6:00 PM EST
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Modern Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl space-y-6"
            >
              <h3 className="text-xl font-black text-white">
                Send Us a Message
              </h3>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="submitted-state"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white font-bold mx-auto flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="text-lg font-black text-white">
                      Message Sent Successfully
                    </h4>
                    <p className="text-xs text-emerald-300 leading-relaxed max-w-sm mx-auto">
                      Thank you for reaching out! Our enterprise admissions team will review your query and respond within 24 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-4 px-5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={onSubmitForm} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Alex Mercer"
                          className="w-full px-4 py-3 text-sm bg-white/[0.04] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                          Work Email
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="alex@company.com"
                          className="w-full px-4 py-3 text-sm bg-white/[0.04] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enterprise Licensing / Course Authoring..."
                        className="w-full px-4 py-3 text-sm bg-white/[0.04] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                        Your Message
                      </label>
                      <textarea
                        rows={5}
                        required
                        placeholder="Tell us about your team size, learning goals, or partnership requirements..."
                        className="w-full px-4 py-3 text-sm bg-white/[0.04] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 px-6 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </button>
                  </form>
                )}
              </AnimatePresence>
            </motion.div>

          </div>

          {/* Bottom FAQ / Support CTA */}
          <CTASection />

        </div>
      </div>
    </>
  );
};

export default PublicContactPage;
