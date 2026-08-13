import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Clock, Users, Star, Code, ArrowRight } from 'lucide-react';
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
  imageBg?: string;
  thumbnailUrl?: string;
  progress?: number;
}

interface CourseCardProps {
  course: CourseData;
  index?: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, index = 0 }) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [imgError, setImgError] = useState(false);

  const initials = course.instructor
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: (index % 3) * 0.08 }}
      whileHover={{ y: -5 }}
      className="group flex flex-col h-full overflow-hidden rounded-2xl bg-[#090C15] hover:bg-[#0C101D] border border-white/10 hover:border-white/25 backdrop-blur-2xl shadow-xl transition-all duration-300"
    >
      {/* 16:9 Aspect Video Thumbnail Container */}
      <div className="relative aspect-video w-full bg-[#06080F] overflow-hidden">
        {/* Course Thumbnail Image or Abstract Fallback Pattern */}
        {course.thumbnailUrl && !imgError ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0D1322] via-[#090C15] to-[#12182B] flex items-center justify-center p-6 relative">
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 225" fill="none">
              <circle cx="200" cy="112" r="80" stroke="white" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="112" x2="400" y2="112" stroke="white" strokeWidth="1" />
            </svg>
            <Code className="w-10 h-10 text-brand-400 opacity-60" />
          </div>
        )}

        {/* Dark Gradient Overlay for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090C15] via-black/30 to-transparent pointer-events-none" />

        {/* Top Overlay Controls & Badges */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-emerald-400 border border-emerald-500/30">
              {course.category}
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-white/10 backdrop-blur-md rounded-md text-gray-300 border border-white/15">
              {course.level}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => setBookmarked(!bookmarked)}
            aria-label="Bookmark course"
            className={`p-1.5 rounded-lg backdrop-blur-md border transition-all duration-200 ${
              bookmarked
                ? 'bg-amber-500/80 text-white border-amber-400 shadow-md'
                : 'bg-black/60 text-gray-300 border-white/15 hover:text-white hover:bg-black/80'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-white' : ''}`} />
          </motion.button>
        </div>

        {/* Bottom Overlay Info (Rating & Price) */}
        <div className="absolute bottom-2.5 left-3 right-3 z-10 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-amber-300 border border-white/10">
            <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
            <span>{course.rating.toFixed(1)}</span>
          </div>

          <div className="text-xs font-bold font-mono px-2.5 py-0.5 bg-white/90 text-gray-950 rounded-md shadow-sm">
            {course.price}
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-col flex-1 p-5 justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2.5 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              {course.studentsEnrolled.toLocaleString()} Enrolled
            </span>
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug tracking-tight">
            {course.title}
          </h3>

          {/* Instructor Meta */}
          <div className="flex items-center gap-2 mt-3">
            <div className="w-6 h-6 rounded-full bg-white/10 text-white font-bold text-[10px] flex items-center justify-center border border-white/15">
              {initials}
            </div>
            <span className="text-xs text-gray-400 font-normal">
              By <strong className="text-gray-200 font-medium">{course.instructor}</strong>
            </span>
          </div>
        </div>

        {/* Syllabus Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] font-mono text-gray-400">
            <span>Syllabus Completion</span>
            <span className="text-emerald-400 font-bold">{course.progress || 75}%</span>
          </div>
          <div className="w-full bg-gray-800/80 h-1.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              whileInView={{ width: `${course.progress || 75}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              className="bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-400 h-1.5 rounded-full"
            />
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] font-mono text-gray-400">
            Certified Path
          </span>
          <Link
            to={PUBLIC.REGISTER}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/15 border border-white/15 rounded-lg transition-all"
          >
            <span>Enroll Now</span>
            <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
