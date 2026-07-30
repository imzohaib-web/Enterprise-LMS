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
    question: 'How do I enroll in a course or learning path?',
    answer:
      'Click the "Get Started" or "Enroll Now" button on any course card. Create a free account or sign in to immediately access self-paced modules, interactive quizzes, and downloadable course resources.',
  },
  {
    id: '2',
    question: 'How are certificates verified by employers and incubators?',
    answer:
      'Every certificate issued by Enterprise LMS includes a unique verification code and QR link. Employers and incubators can enter this code on our public Certificate Verification page (/verify) to instantly confirm authenticity, student identity, and completion grade.',
  },
  {
    id: '3',
    question: 'Can I access courses and take assessments on mobile devices?',
    answer:
      'Yes! The platform is 100% responsive across mobile phones, tablets, and desktops. You can watch video lessons, inspect code examples, and submit quizzes seamlessly on any modern mobile browser.',
  },
  {
    id: '4',
    question: 'Are quizzes and assessments timed?',
    answer:
      'Certain course assessments and final certification exams feature live countdown timers to simulate real-world technical interview assessments. Practice quizzes allow untimed retries to solidify mastery.',
  },
  {
    id: '5',
    question: 'Can instructors and incubators create custom courses?',
    answer:
      'Approved instructors and organizational admins have access to the Instructor Dashboard where they can author modules, create quizzes, track student performance analytics, and issue credentials.',
  },
];

export const FAQAccordion: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('1');

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {defaultFAQs.map((faq, idx) => {
        const isOpen = openId === faq.id;
        return (
          <motion.div
            key={faq.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className={`rounded-2xl border transition-colors duration-300 overflow-hidden ${
              isOpen
                ? 'bg-white/[0.04] border-brand-500/50 shadow-[0_0_25px_rgba(70,95,255,0.15)]'
                : 'bg-white/[0.02] border-white/10 hover:border-white/20'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(faq.id)}
              className="w-full px-6 py-5 text-left flex items-center justify-between font-bold text-white hover:text-brand-300 transition-colors focus:outline-none"
            >
              <span className="text-base sm:text-lg flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-brand-400 shrink-0" />
                {faq.question}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className={`ml-4 flex items-center justify-center w-8 h-8 rounded-full border text-sm font-black ${
                  isOpen
                    ? 'bg-brand-500 text-white border-brand-400'
                    : 'bg-white/5 text-gray-300 border-white/10'
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.span>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="px-6 pb-6 pt-2 text-sm text-gray-300 leading-relaxed border-t border-white/5">
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
