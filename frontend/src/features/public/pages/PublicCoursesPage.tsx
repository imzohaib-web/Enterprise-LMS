import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageMeta from '../../../components/common/PageMeta';
import CourseCard, { CourseData } from '../../../components/public/CourseCard';
import { Search, SlidersHorizontal } from 'lucide-react';

const allCoursesData: CourseData[] = [
  {
    id: '1',
    title: 'Advanced React 19 & Enterprise Architecture',
    instructor: 'Alex Mercer',
    duration: '12 Weeks',
    level: 'Advanced',
    studentsEnrolled: 3420,
    rating: 4.9,
    price: 'Free',
    category: 'Frontend',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    progress: 85,
  },
  {
    id: '2',
    title: 'Node.js Microservices & Event-Driven Systems',
    instructor: 'Dr. Elena Rostova',
    duration: '10 Weeks',
    level: 'Intermediate',
    studentsEnrolled: 2850,
    rating: 4.8,
    price: 'Pro',
    category: 'Backend',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    progress: 60,
  },
  {
    id: '3',
    title: 'Python for Data Science & Neural Networks',
    instructor: 'David Chen',
    duration: '14 Weeks',
    level: 'Beginner',
    studentsEnrolled: 4120,
    rating: 4.9,
    price: 'Free',
    category: 'Data Science',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    progress: 40,
  },
  {
    id: '4',
    title: 'Machine Learning Engineering & LLM Ops',
    instructor: 'Dr. Sarah Connor',
    duration: '16 Weeks',
    level: 'Advanced',
    studentsEnrolled: 1980,
    rating: 4.9,
    price: 'Pro',
    category: 'AI & ML',
    thumbnailUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    progress: 90,
  },
  {
    id: '5',
    title: 'UI/UX Design Systems & Tailwind Engineering',
    instructor: 'Jessica Alba',
    duration: '8 Weeks',
    level: 'Beginner',
    studentsEnrolled: 2150,
    rating: 4.7,
    price: 'Free',
    category: 'UI/UX Design',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80',
    progress: 55,
  },
  {
    id: '6',
    title: 'Cloud Native DevOps, Kubernetes & CI/CD',
    instructor: 'Marcus Vance',
    duration: '12 Weeks',
    level: 'Intermediate',
    studentsEnrolled: 3100,
    rating: 4.8,
    price: 'Pro',
    category: 'DevOps',
    thumbnailUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
    progress: 70,
  },
];

export const PublicCoursesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');

  const categories = ['All', 'Frontend', 'Backend', 'AI & ML', 'Data Science', 'DevOps', 'UI/UX Design'];

  const filteredCourses = allCoursesData.filter((course) => {
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;

    return matchesCategory && matchesSearch && matchesLevel;
  });

  return (
    <>
      <PageMeta
        title="Course Catalog | SkillForge LMS"
        description="Browse production-ready software development, cloud, and AI engineering courses."
      />

      <div className="py-14 lg:py-20 relative z-10 space-y-12 bg-[#0B0E17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl mx-auto space-y-3"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>PRODUCTION CURRICULUM</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Production-Grade Course Catalog.
            </h1>
            <p className="text-sm sm:text-base text-gray-400 font-normal max-w-xl mx-auto leading-relaxed">
              Handcrafted modules with practical quizzes, real-world sandboxes, and verified digital credentials.
            </p>
          </motion.div>

          {/* Search & Filter Control Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 rounded-2xl bg-[#090C15] border border-white/10 backdrop-blur-2xl shadow-xl space-y-5"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Input */}
              <div className="w-full md:w-96 relative">
                <input
                  type="text"
                  placeholder="Search courses or instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 text-xs sm:text-sm bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 font-mono"
                />
                <Search className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
              </div>

              {/* Level Dropdown Filter */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-xs font-mono text-gray-400 whitespace-nowrap flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" /> Level Filter:
                </span>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full md:w-44 px-3.5 py-2 text-xs font-mono bg-white/[0.04] border border-white/10 rounded-xl text-white focus:outline-none"
                >
                  <option value="All" className="bg-[#090C15] text-white">All Levels</option>
                  <option value="Beginner" className="bg-[#090C15] text-white">Beginner</option>
                  <option value="Intermediate" className="bg-[#090C15] text-white">Intermediate</option>
                  <option value="Advanced" className="bg-[#090C15] text-white">Advanced</option>
                </select>
              </div>
            </div>

            {/* Category Pills Bar */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold'
                      : 'bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Course Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course, idx) => (
                <CourseCard key={course.id} course={course} index={idx} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 p-8 border border-dashed border-white/15 rounded-2xl bg-[#090C15]">
              <p className="text-base font-bold text-white">No courses match your filter criteria</p>
              <p className="text-xs text-gray-400 mt-1 font-mono">Try resetting search keywords or selecting another category.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setSelectedLevel('All');
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg transition-all"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PublicCoursesPage;
