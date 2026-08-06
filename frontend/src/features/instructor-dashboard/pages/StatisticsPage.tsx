import React from 'react';
import PageMeta from '../../../components/common/PageMeta';
import EnrollmentChart from '../components/EnrollmentChart';
import QuizPerformanceChart from '../components/QuizPerformanceChart';
import ComponentCard from '../../../components/common/ComponentCard';

export const StatisticsPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Analytics & Statistics | Instructor Dashboard" description="In-depth instructor analytics and performance metrics" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Instructor Analytics & Statistics
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Visual insights into student engagement, enrollment trajectories, and quiz score benchmarks.
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnrollmentChart />
          <QuizPerformanceChart />
        </div>

        {/* Detailed Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ComponentCard title="Active Completion Rate" desc="Global module completion">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>Average Completion</span>
                <span className="text-brand-600 dark:text-brand-400">84%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <div className="bg-brand-500 h-2 rounded-full" style={{ width: '84%' }}></div>
              </div>
              <p className="text-xs text-gray-400 pt-2">
                +4.2% higher than previous quarter benchmark
              </p>
            </div>
          </ComponentCard>

          <ComponentCard title="Quiz Pass Ratio" desc="Assessment evaluation metrics">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>First-Attempt Pass</span>
                <span className="text-emerald-600 dark:text-emerald-400">89.5%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '89.5%' }}></div>
              </div>
              <p className="text-xs text-gray-400 pt-2">
                High student retention and assessment clarity
              </p>
            </div>
          </ComponentCard>

          <ComponentCard title="Instructor Rating" desc="Student feedback score">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">4.9</span>
                <span className="text-sm text-amber-500">★★★★★</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Based on 840 verified student course reviews
              </p>
            </div>
          </ComponentCard>
        </div>
      </div>
    </>
  );
};

export default StatisticsPage;
