import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import { useInstructorAnalytics } from '../hooks/useInstructorDashboard';

export const StatisticsPage: React.FC = () => {
  const { data: analytics, isLoading, isError, refetch } = useInstructorAnalytics();

  const metrics = analytics?.metrics || {
    totalStudents: 0,
    activeCourses: 0,
    courseCompletionRate: 0,
    averageQuizScore: 0,
    assessmentAttempts: 0,
    studentProgress: 0,
    learningPathCompletion: 0,
    discussionActivity: 0,
  };

  const charts = analytics?.charts || {
    monthlyEnrollments: [],
    quizPerformance: [],
    completionTrend: [],
    studentActivity: [],
  };

  // 1. Monthly Enrollments Line Chart Options
  const monthlyEnrollmentsOptions: ApexOptions = {
    colors: ['#465fff'],
    chart: { fontFamily: 'Outfit, sans-serif', type: 'line', height: 280, toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: { categories: charts.monthlyEnrollments.map((m: any) => m.month) },
    tooltip: { theme: 'dark' },
  };
  const monthlyEnrollmentsSeries = [
    { name: 'Monthly Enrollments', data: charts.monthlyEnrollments.map((m: any) => m.count) },
  ];

  // 2. Quiz Performance Bar Chart Options
  const quizPerformanceOptions: ApexOptions = {
    colors: ['#10b981', '#f59e0b'],
    chart: { fontFamily: 'Outfit, sans-serif', type: 'bar', height: 280, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: '50%', borderRadius: 6 } },
    xaxis: { categories: charts.quizPerformance.map((q: any) => q.category || q.courseTitle) },
    legend: { position: 'top' },
    tooltip: { theme: 'dark' },
  };
  const quizPerformanceSeries = [
    { name: 'Average Score (%)', data: charts.quizPerformance.map((q: any) => q.averageScore) },
    { name: 'Pass Rate (%)', data: charts.quizPerformance.map((q: any) => q.passRate) },
  ];

  // 3. Course Completion Trend Area Chart Options
  const completionTrendOptions: ApexOptions = {
    colors: ['#10b981', '#6366f1'],
    chart: { fontFamily: 'Outfit, sans-serif', type: 'area', height: 280, toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
    xaxis: { categories: charts.completionTrend.map((c: any) => c.month) },
    tooltip: { theme: 'dark' },
  };
  const completionTrendSeries = [
    { name: 'Completed Modules', data: charts.completionTrend.map((c: any) => c.completed) },
    { name: 'In Progress Modules', data: charts.completionTrend.map((c: any) => c.inProgress) },
  ];

  // 4. Weekly Student Activity Column Chart Options
  const studentActivityOptions: ApexOptions = {
    colors: ['#3b82f6'],
    chart: { fontFamily: 'Outfit, sans-serif', type: 'bar', height: 280, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 8 } },
    xaxis: { categories: charts.studentActivity.map((a: any) => a.day) },
    tooltip: { theme: 'dark' },
  };
  const studentActivitySeries = [
    { name: 'Active Students', data: charts.studentActivity.map((a: any) => a.active) },
  ];

  return (
    <>
      <PageMeta title="Analytics & Statistics | Instructor Dashboard" description="In-depth instructor analytics and performance metrics" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Instructor Analytics & Performance
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time insights generated directly via MongoDB aggregation pipelines.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 bg-brand-50 text-brand-600 hover:bg-brand-100 text-xs font-bold rounded-xl transition"
          >
            🔄 Refresh Analytics
          </button>
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
            <p className="text-sm text-gray-500">Computing MongoDB analytics pipelines...</p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center space-y-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">Failed to load analytics data.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            >
              Retry Pipeline Query
            </button>
          </div>
        ) : (
          <>
            {/* 8 Primary MongoDB Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                <div className="text-xs font-semibold text-gray-400 uppercase">Total Students</div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                  {metrics.totalStudents.toLocaleString()}
                </div>
                <div className="text-xs text-emerald-600 font-medium mt-1">Active Enrolled Learners</div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                <div className="text-xs font-semibold text-gray-400 uppercase">Active Courses</div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                  {metrics.activeCourses}
                </div>
                <div className="text-xs text-brand-600 font-medium mt-1">Published Catalog Modules</div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                <div className="text-xs font-semibold text-gray-400 uppercase">Course Completion Rate</div>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {metrics.courseCompletionRate}%
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mt-2">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${metrics.courseCompletionRate}%` }}></div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                <div className="text-xs font-semibold text-gray-400 uppercase">Average Quiz Score</div>
                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                  {metrics.averageQuizScore}%
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mt-2">
                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${metrics.averageQuizScore}%` }}></div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                <div className="text-xs font-semibold text-gray-400 uppercase">Assessment Attempts</div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                  {metrics.assessmentAttempts.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">Total Submissions</div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                <div className="text-xs font-semibold text-gray-400 uppercase">Student Progress</div>
                <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                  {metrics.studentProgress}%
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mt-2">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${metrics.studentProgress}%` }}></div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                <div className="text-xs font-semibold text-gray-400 uppercase">Learning Path Completion</div>
                <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">
                  {metrics.learningPathCompletion}%
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mt-2">
                  <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${metrics.learningPathCompletion}%` }}></div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                <div className="text-xs font-semibold text-gray-400 uppercase">Discussion Activity</div>
                <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                  {metrics.discussionActivity}
                </div>
                <div className="text-xs text-gray-500 mt-1">Forum Threads & Replies</div>
              </div>
            </div>

            {/* Live ApexCharts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComponentCard title="Monthly Enrollments" desc="Enrollment growth pipeline">
                <Chart options={monthlyEnrollmentsOptions} series={monthlyEnrollmentsSeries} type="line" height={280} />
              </ComponentCard>

              <ComponentCard title="Quiz Performance" desc="Category benchmarks and pass rates">
                <Chart options={quizPerformanceOptions} series={quizPerformanceSeries} type="bar" height={280} />
              </ComponentCard>

              <ComponentCard title="Course Completion Trend" desc="Completed vs in-progress modules">
                <Chart options={completionTrendOptions} series={completionTrendSeries} type="area" height={280} />
              </ComponentCard>

              <ComponentCard title="Weekly Student Activity" desc="Active student engagement by day">
                <Chart options={studentActivityOptions} series={studentActivitySeries} type="bar" height={280} />
              </ComponentCard>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default StatisticsPage;
