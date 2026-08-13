import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const defaultFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'How do self-paced interactive coding labs work?',
    answer:
      'Each course module includes embedded interactive code sandboxes with live test runners. You write and execute code directly in your browser, receiving immediate feedback on test assertions before advancing to the next lesson.',
  },
  {
    id: '2',
    question: 'How are cryptographic verification codes validated by employers?',
    answer:
      'Every certificate issued by SkillForge features a unique cryptographic code (e.g. SF-2026-8921-VERIFIED). Employers and incubators can input this code on our public Certificate Verification page (/verify) to instantly confirm authenticity, student identity, and syllabus score.',
  },
  {
    id: '3',
    question: 'Are course assessments and quizzes timed?',
    answer:
      'Final certification exams and milestone assessments feature live countdown timers to simulate technical interviewing environments. Practice lesson quizzes allow unlimited untimed retries to ensure concept mastery.',
  },
  {
    id: '4',
    question: 'What happens after completing a career roadmap path?',
    answer:
      'Upon finishing all required courses in a Guided Learning Path, you receive a master Career Path Credential, a comprehensive syllabus transcript, and access to incubator hiring partner networks.',
  },
  {
    id: '5',
    question: 'Can organizational admins track team progress via Admin Analytics?',
    answer:
      'Yes! Approved enterprise administrators and team managers gain access to the Admin Analytics panel, allowing real-time monitoring of team study hours, assessment scores, and completion metrics.',
  },
  {
    id: '6',
    question: 'Is SkillForge LMS optimized for mobile study sessions?',
    answer:
      'SkillForge LMS is 100% responsive across mobile phones, tablets, and desktop workstations. You can stream video lessons, review code snippets, and take practice quizzes on any mobile browser.',
  },
];

export const FAQAccordion: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('1');

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-3.5 max-w-3xl mx-auto">
      {defaultFAQs.map((faq, idx) => {
        const isOpen = openId === faq.id;
        return (
          <motion.div
            key={faq.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className={`rounded-xl border transition-all duration-300 overflow-hidden ${
              isOpen
                ? 'bg-[#0C101D] border-white/25 shadow-lg'
                : 'bg-[#090C15] border-white/10 hover:border-white/20'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(faq.id)}
              className="w-full px-5 py-4 text-left flex items-center justify-between font-bold text-white hover:text-brand-300 transition-colors focus:outline-none"
            >
              <span className="text-sm sm:text-base flex items-center gap-3 tracking-tight">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                {faq.question}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className={`ml-3 flex items-center justify-center w-6 h-6 rounded-md border text-xs ${
                  isOpen
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-white/[0.04] text-gray-400 border-white/10'
                }`}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.span>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-300 leading-relaxed font-normal border-t border-white/5">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default FAQAccordion;
