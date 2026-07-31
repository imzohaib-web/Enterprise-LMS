import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Clock, Users, Star } from 'lucide-react';
import { PUBLIC } from '../../constants/routes';

export interface CourseData {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  studentsEnrolled: number;
  rating: number;
  price: string;
  category: string;
  imageBg: string;
  progress?: number;
}

interface CourseCardProps {
  course: CourseData;
  index?: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, index = 0 }) => {
  const [bookmarked, setBookmarked] = useState(false);

  const initials = course.instructor
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: (index % 3) * 0.1 }}
      whileHover={{ y: -6 }}
      className="group flex flex-col h-full overflow-hidden rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-brand-500/40 backdrop-blur-xl shadow-xl transition-colors duration-300"
    >
      {/* Thumbnail Container */}
      <div className={`relative h-56 w-full ${course.imageBg} flex items-center justify-center p-6 text-white overflow-hidden`}>
        <motion.div
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300"
        />
        
        {/* Category & Difficulty Badges */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/20">
            {course.category}
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-brand-500/80 backdrop-blur-md rounded-full text-white">
            {course.level}
          </span>
        </div>

        {/* Interactive Bookmark Button */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => setBookmarked(!bookmarked)}
          aria-label="Bookmark course"
          className={`absolute top-4 right-4 z-10 p-2 rounded-full backdrop-blur-md border transition-all duration-200 ${
            bookmarked
              ? 'bg-amber-500/80 text-white border-amber-400 shadow-lg'
              : 'bg-black/50 text-gray-300 border-white/20 hover:text-white hover:bg-black/70'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-white' : ''}`} />
        </motion.button>

        {/* Rating Badge */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1 text-xs font-bold px-3 py-1 bg-black/70 backdrop-blur-md rounded-xl text-amber-300 border border-white/10">
          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
          <span>{course.rating.toFixed(1)}</span>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-4 right-4 z-10 text-xs font-black px-3.5 py-1 bg-white text-gray-900 rounded-xl shadow-md">
          {course.price}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-col flex-1 p-6 justify-between space-y-5">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              {course.studentsEnrolled.toLocaleString()}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug">
            {course.title}
          </h3>

          {/* Instructor Meta */}
          <div className="flex items-center gap-2.5 mt-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-500 to-purple-500 text-white font-bold text-2xs flex items-center justify-center border border-white/20">
              {initials}
            </div>
            <span className="text-xs text-gray-400 font-medium">
              By <strong className="text-gray-200">{course.instructor}</strong>
            </span>
          </div>
        </div>

        {/* Course Progress Indicator Preview */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-[11px] font-semibold text-gray-400">
            <span>Syllabus Completion</span>
            <span className="text-brand-400">{course.progress || 75}%</span>
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              whileInView={{ width: `${course.progress || 75}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              className="bg-gradient-to-r from-brand-500 to-indigo-500 h-1.5 rounded-full"
            />
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">
            Certified Path
          </span>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to={PUBLIC.REGISTER}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-[0_0_15px_rgba(70,95,255,0.3)] transition-all block text-center"
            >
              Enroll Now
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
