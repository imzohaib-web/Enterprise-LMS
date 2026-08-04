import React, { useState } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import CourseCard, { CourseData } from '../../../components/public/CourseCard';

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
    imageBg: 'bg-gradient-to-br from-blue-600 to-indigo-800',
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
    imageBg: 'bg-gradient-to-br from-emerald-600 to-teal-800',
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
    imageBg: 'bg-gradient-to-br from-amber-500 to-orange-700',
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
    imageBg: 'bg-gradient-to-br from-purple-600 to-pink-800',
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
    imageBg: 'bg-gradient-to-br from-rose-500 to-red-700',
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
    imageBg: 'bg-gradient-to-br from-cyan-600 to-blue-800',
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
        title="Courses Catalog | Enterprise LMS"
        description="Browse production-ready software development, cloud, and AI engineering courses."
      />

      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Title */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest bg-brand-50 dark:bg-brand-500/10 px-3.5 py-1.5 rounded-full">
              Production Curriculum
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Explore Our Course Catalog
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Handcrafted modules with practical quizzes, real-world projects, and verified digital credentials.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search input */}
              <div className="w-full md:w-96 relative">
                <input
                  type="text"
                  placeholder="Search courses or instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
                <span className="absolute left-3.5 top-3 text-gray-400 text-sm">🔍</span>
              </div>

              {/* Level Dropdown */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Level:
                </span>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full md:w-48 px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-brand-500 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
            <div className="text-center py-16 p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200">No courses match your filter</p>
              <p className="text-xs text-gray-500 mt-1">Try adjusting your search query or category selection.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setSelectedLevel('All');
                }}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-brand-500 rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PublicCoursesPage;
