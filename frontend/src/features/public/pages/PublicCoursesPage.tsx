import React, { useState } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import CourseCard, { CourseData } from '../../../components/public/CourseCard';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

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
    imageBg: 'bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900',
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
    imageBg: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900',
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
    imageBg: 'bg-gradient-to-br from-amber-500 via-orange-700 to-slate-900',
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
    imageBg: 'bg-gradient-to-br from-purple-600 via-pink-700 to-slate-900',
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
    imageBg: 'bg-gradient-to-br from-rose-500 via-red-700 to-slate-900',
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
    imageBg: 'bg-gradient-to-br from-cyan-600 via-blue-800 to-slate-900',
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
        title="Course Catalog | Enterprise LMS"
        description="Browse production-ready software development, cloud, and AI engineering courses."
      />

      <div className="py-20 lg:py-28 relative z-10 space-y-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header Title */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-brand-400 bg-brand-500/10 border border-brand-500/20 px-4 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Production Curriculum
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
              Explore Our Course Catalog
            </h1>
            <p className="text-base text-gray-400 font-normal max-w-xl mx-auto">
              Handcrafted modules with practical quizzes, real-world projects, and verified digital credentials.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search input */}
              <div className="w-full md:w-96 relative">
                <input
                  type="text"
                  placeholder="Search courses or instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-11 text-sm bg-white/[0.04] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                />
                <Search className="absolute left-4 top-3.5 text-gray-400 w-4 h-4" />
              </div>

              {/* Level Dropdown */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-xs font-semibold text-gray-400 whitespace-nowrap flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-brand-400" /> Filter Level:
                </span>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full md:w-48 px-4 py-2.5 text-sm bg-white/[0.04] border border-white/10 rounded-2xl text-white focus:outline-none"
                >
                  <option value="All" className="bg-gray-900 text-white">All Levels</option>
                  <option value="Beginner" className="bg-gray-900 text-white">Beginner</option>
                  <option value="Intermediate" className="bg-gray-900 text-white">Intermediate</option>
                  <option value="Advanced" className="bg-gray-900 text-white">Advanced</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-brand-500 text-white shadow-[0_0_15px_rgba(70,95,255,0.4)]'
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Course Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 p-8 border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
              <p className="text-lg font-bold text-white">No courses match your filter criteria</p>
              <p className="text-xs text-gray-400 mt-1">Try resetting search keywords or selecting another category.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setSelectedLevel('All');
                }}
                className="mt-5 px-5 py-2.5 text-xs font-bold text-white bg-brand-500 rounded-xl"
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
