import React, { useState } from 'react';

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
      'Simply click the "Get Started" or "Enroll Now" button on any course card. Create a free account or sign in to immediately access self-paced modules, interactive quizzes, and course resources.',
  },
  {
    id: '2',
    question: 'How are certificates verified by employers?',
    answer:
      'Every certificate issued by Enterprise LMS includes a unique verification code and QR code. Employers and incubators can enter this code on our public Certificate Verification page (/verify) to instantly confirm authenticity, student identity, and completion date.',
  },
  {
    id: '3',
    question: 'Can I access courses and take assessments on mobile devices?',
    answer:
      'Yes! The platform is 100% responsive across mobile phones, tablets, and desktop computers. You can stream video lessons, review code examples, and take quizzes seamlessly on any modern browser.',
  },
  {
    id: '4',
    question: 'Are quizzes and assessments timed?',
    answer:
      'Certain course assessments and certification exams feature countdown timers to simulate real-world technical assessments. Practice quizzes allow untimed retries to reinforce learning.',
  },
  {
    id: '5',
    question: 'Can instructors create and publish custom courses?',
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
      {defaultFAQs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div
            key={faq.id}
            className="rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800 overflow-hidden transition-all duration-200"
          >
            <button
              type="button"
              onClick={() => toggle(faq.id)}
              className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-gray-900 dark:text-white hover:text-brand-500 transition-colors focus:outline-none"
            >
              <span className="text-base">{faq.question}</span>
              <span className="ml-4 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-extrabold text-sm">
                {isOpen ? '−' : '+'}
              </span>
            </button>

            {isOpen && (
              <div className="px-6 pb-5 pt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700/50">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FAQAccordion;
