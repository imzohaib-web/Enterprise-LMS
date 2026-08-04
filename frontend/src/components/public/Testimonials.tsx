import React from 'react';

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
    company: 'FinTech Solutions',
    review:
      'The React & TypeScript architecture path on Enterprise LMS helped me master state management and custom hook design. The verified certificate was a huge plus during my promotion evaluation!',
    rating: 5,
    initials: 'SJ',
    color: 'bg-brand-500',
  },
  {
    id: '2',
    name: 'Marcus Vance',
    role: 'Backend Architect',
    company: 'CloudScale Inc.',
    review:
      'The Node.js and Microservices module is top notch. Hands-on assessment quizzes and real-world project scenarios made complex distributed system concepts easy to grasp.',
    rating: 5,
    initials: 'MV',
    color: 'bg-indigo-500',
  },
  {
    id: '3',
    name: 'Elena Rostova',
    role: 'DevOps & Cloud Engineer',
    company: 'Ezitech Incubator',
    review:
      'Outstanding curriculum structure! Self-paced learning combined with automated progress tracking gave me the confidence to transition into Cloud Engineering.',
    rating: 5,
    initials: 'ER',
    color: 'bg-purple-500',
  },
];

export const Testimonials: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {testimonials.map((item) => (
        <div
          key={item.id}
          className="flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 shadow-xs hover:shadow-lg transition-all duration-300 space-y-4"
        >
          {/* Rating Stars */}
          <div className="flex items-center gap-1 text-amber-400 text-sm">
            {Array.from({ length: item.rating }).map((_, i) => (
              <span key={i}>★</span>
            ))}
          </div>

          {/* Quote */}
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
            "{item.review}"
          </p>

          {/* User Meta */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
            <div className={`w-10 h-10 rounded-full ${item.color} text-white font-bold text-sm flex items-center justify-center shadow-xs`}>
              {item.initials}
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                {item.name}
              </h4>
              <p className="text-2xs text-gray-500 dark:text-gray-400">
                {item.role} • <span className="text-brand-500">{item.company}</span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Testimonials;
