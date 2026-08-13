import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  courseTag: string;
  review: string;
  rating: number;
  initials: string;
}

const testimonials: TestimonialItem[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    role: 'Senior Frontend Engineer',
    company: 'FinTech Systems',
    courseTag: 'React 19 Architecture',
    review:
      'The React 19 architecture track on SkillForge helped me master state management and custom hook design. The cryptographically verified certificate was a huge plus during my senior promotion!',
    rating: 5,
    initials: 'SJ',
  },
  {
    id: '2',
    name: 'Marcus Vance',
    role: 'Backend Architect',
    company: 'CloudScale Inc.',
    courseTag: 'Node.js Microservices',
    review:
      'The Node.js and Microservices module is top notch. Real-world project scenarios, timed quizzes, and automated grading made complex distributed system concepts easy to master.',
    rating: 5,
    initials: 'MV',
  },
  {
    id: '3',
    name: 'Dr. Elena Rostova',
    role: 'DevOps Lead',
    company: 'Nexus Incubator',
    courseTag: 'DevOps & SRE',
    review:
      'Outstanding curriculum structure! Self-paced learning combined with automated progress tracking gave me the confidence to transition into Cloud Native DevOps.',
    rating: 5,
    initials: 'ER',
  },
];

export const Testimonials: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {testimonials.map((item, idx) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: idx * 0.1 }}
          whileHover={{ y: -5 }}
          className="group flex flex-col justify-between p-7 rounded-2xl bg-[#090C15] hover:bg-[#0C101D] border border-white/10 hover:border-white/25 backdrop-blur-2xl shadow-xl transition-all duration-300 space-y-6"
        >
          {/* Top Header & Rating Stars */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {item.courseTag}
              </span>
            </div>

            <Quote className="w-6 h-6 text-gray-400 mb-3 opacity-60 group-hover:text-brand-400 transition-colors" />

            {/* Quote Body */}
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal italic">
              "{item.review}"
            </p>
          </div>

          {/* User Meta Footer */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white font-mono font-bold text-xs flex items-center justify-center border border-white/15 shrink-0">
              {item.initials}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">
                {item.name}
              </h4>
              <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                {item.role} • <span className="text-gray-300 font-semibold">{item.company}</span>
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Testimonials;
