import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  review: string;
  rating: number;
  initials: string;
  color: string;
}

const testimonials: TestimonialItem[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    role: 'Senior Frontend Engineer',
    company: 'FinTech Systems',
    review:
      'The React 19 architecture track on Enterprise LMS helped me master state management and custom hook design. The cryptographically verified certificate was a huge plus during my senior promotion!',
    rating: 5,
    initials: 'SJ',
    color: 'from-brand-500 to-indigo-600',
  },
  {
    id: '2',
    name: 'Marcus Vance',
    role: 'Backend Architect',
    company: 'CloudScale Inc.',
    review:
      'The Node.js and Microservices module is top notch. Real-world project scenarios, timed quizzes, and automated grading made complex distributed system concepts easy to master.',
    rating: 5,
    initials: 'MV',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: '3',
    name: 'Elena Rostova',
    role: 'DevOps Lead',
    company: 'Ezitech Incubator',
    review:
      'Outstanding curriculum structure! Self-paced learning combined with automated progress tracking gave me the confidence to transition into Cloud Native DevOps.',
    rating: 5,
    initials: 'ER',
    color: 'from-purple-500 to-pink-600',
  },
];

export const Testimonials: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {testimonials.map((item, idx) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: idx * 0.15 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="flex flex-col justify-between p-8 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-brand-500/40 backdrop-blur-xl shadow-xl transition-colors duration-300 space-y-6 group"
        >
          {/* Header & Rating Stars */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: item.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <Quote className="w-8 h-8 text-brand-500/30 group-hover:text-brand-400/50 transition-colors" />
          </div>

          {/* Quote Body */}
          <p className="text-sm text-gray-300 italic leading-relaxed font-normal">
            "{item.review}"
          </p>

          {/* User Meta */}
          <div className="flex items-center gap-3.5 pt-6 border-t border-white/10">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${item.color} text-white font-black text-sm flex items-center justify-center shadow-md border border-white/20`}>
              {item.initials}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">
                {item.name}
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                {item.role} • <span className="text-brand-300 font-semibold">{item.company}</span>
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Testimonials;
