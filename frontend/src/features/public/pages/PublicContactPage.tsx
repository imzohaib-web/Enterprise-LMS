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

      <div className="py-14 lg:py-20 relative z-10 space-y-16 bg-[#0B0E17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          {/* Header Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl mx-auto space-y-3"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>GET IN TOUCH</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              We're Here to Help Your Team Scale.
            </h1>
            <p className="text-sm sm:text-base text-gray-400 font-normal max-w-xl mx-auto leading-relaxed">
              Have questions about enterprise cohort licensing, incubator onboarding, or technical course authoring? Reach out to our admissions team.
            </p>
          </motion.div>

          {/* 2-Column Contact Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Contact Info Glass Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 space-y-6"
            >
              <div className="p-7 rounded-2xl bg-[#090C15] border border-white/10 backdrop-blur-2xl shadow-xl space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
                  <MessageSquare className="w-4 h-4 text-emerald-400" /> Contact Information
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-normal">
                  Our enterprise support team is available Monday through Friday to assist with technical queries and cohort setup.
                </p>

                <div className="space-y-4 pt-1">
                  {/* Email */}
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-white/[0.04] text-emerald-400 border border-white/15 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Email Support</span>
                      <a href="mailto:support@skillforgelms.com" className="text-xs sm:text-sm font-semibold text-white hover:text-emerald-400 transition-colors">
                        support@skillforgelms.com
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-white/[0.04] text-emerald-400 border border-white/15 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Admissions Hotline</span>
                      <a href="tel:+18005558842" className="text-xs sm:text-sm font-semibold text-white hover:text-emerald-400 transition-colors font-mono">
                        +1 (800) 555-8842
                      </a>
                    </div>
                  </div>

                  {/* Office Address */}
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-white/[0.04] text-gray-300 border border-white/15 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Incubator HQ</span>
                      <p className="text-xs sm:text-sm font-semibold text-white">
                        100 Tech Academy Plaza, Suite 400<br />San Francisco, CA 94107
                      </p>
                    </div>
                  </div>

                  {/* Office Hours */}
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-white/[0.04] text-amber-400 border border-white/15 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Office Hours</span>
                      <p className="text-xs sm:text-sm font-semibold text-white font-mono">
                        Mon – Fri: 9:00 AM – 6:00 PM EST
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Modern Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 p-7 sm:p-9 rounded-2xl bg-[#090C15] border border-white/10 backdrop-blur-2xl shadow-xl space-y-5"
            >
              <h3 className="text-lg font-bold text-white tracking-tight">
                Send Us a Message
              </h3>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="submitted-state"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-gray-950 font-bold mx-auto flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">
                      Message Sent Successfully
                    </h4>
                    <p className="text-xs text-emerald-300 leading-relaxed max-w-sm mx-auto font-normal">
                      Thank you for reaching out! Our enterprise admissions team will review your query and respond within 24 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-3 px-4 py-2 text-xs font-semibold text-gray-950 bg-white hover:bg-gray-100 rounded-lg transition-all"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={onSubmitForm} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-gray-300 uppercase tracking-wider mb-1.5">
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Alex Mercer"
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-gray-300 uppercase tracking-wider mb-1.5">
                          Work Email
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="alex@company.com"
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-gray-300 uppercase tracking-wider mb-1.5">
                        Subject
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enterprise Licensing / Course Authoring..."
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-gray-300 uppercase tracking-wider mb-1.5">
                        Your Message
                      </label>
                      <textarea
                        rows={5}
                        required
                        placeholder="Tell us about your team size, learning goals, or partnership requirements..."
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-5 text-xs sm:text-sm font-bold text-gray-950 bg-white hover:bg-gray-100 rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4 text-gray-950" />
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
