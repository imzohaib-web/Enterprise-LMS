import React from 'react';
import { Link } from 'react-router-dom';
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
}

interface CourseCardProps {
  course: CourseData;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      {/* Thumbnail Placeholder */}
      <div className={`relative h-48 w-full ${course.imageBg} flex items-center justify-center p-6 text-white overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        <span className="relative z-10 text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
          {course.category}
        </span>
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-amber-300">
          ★ {course.rating.toFixed(1)}
        </div>
        <div className="absolute bottom-3 right-3 z-10 text-xs font-extrabold px-2.5 py-1 bg-white text-gray-900 rounded-lg shadow-sm">
          {course.price}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5 justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span className="font-semibold text-brand-600 dark:text-brand-400">{course.level}</span>
            <span>{course.duration}</span>
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors line-clamp-2">
            {course.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            By <strong className="text-gray-700 dark:text-gray-300">{course.instructor}</strong>
          </p>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            👥 {course.studentsEnrolled.toLocaleString()} Students
          </span>
          <Link
            to={PUBLIC.REGISTER}
            className="px-4 py-2 text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 dark:hover:text-white rounded-xl transition-all"
          >
            Enroll Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
