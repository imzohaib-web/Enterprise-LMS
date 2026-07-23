import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { adminService } from '../../services/admin.service';
import { userService } from '../../services/user.service';
import StatsCard from '../../components/lms/StatsCard';

// ── Icon helpers ─────────────────────────────────────────────────────────────
const UsersIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const BookIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);
const CheckIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const TrendIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

// ── Chart config factory ─────────────────────────────────────────────────────
const areaOptions = (categories: string[], isDark: boolean): ApexOptions => ({
  chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit', background: 'transparent' },
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 100] } },
  xaxis: { categories, labels: { style: { colors: isDark ? '#9ca3af' : '#6b7280', fontSize: '12px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { labels: { style: { colors: isDark ? '#9ca3af' : '#6b7280', fontSize: '12px' } } },
  grid: { borderColor: isDark ? '#374151' : '#f3f4f6', strokeDashArray: 4 },
  tooltip: { theme: isDark ? 'dark' : 'light' },
  colors: ['#6366f1', '#10b981'],
  dataLabels: { enabled: false },
  legend: { show: true, labels: { colors: isDark ? '#d1d5db' : '#374151' } },
});

const barOptions = (categories: string[], isDark: boolean): ApexOptions => ({
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit', background: 'transparent' },
  plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
  xaxis: { categories, labels: { style: { colors: isDark ? '#9ca3af' : '#6b7280', fontSize: '11px' }, rotate: -30 }, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { labels: { style: { colors: isDark ? '#9ca3af' : '#6b7280', fontSize: '12px' } } },
  grid: { borderColor: isDark ? '#374151' : '#f3f4f6', strokeDashArray: 4 },
  tooltip: { theme: isDark ? 'dark' : 'light' },
  colors: ['#6366f1'],
  dataLabels: { enabled: false },
});

const AdminDashboard: React.FC = () => {
  const isDark = document.documentElement.classList.contains('dark');

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: () => adminService.getOverview().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const { data: growth } = useQuery({
    queryKey: ['admin', 'growth'],
    queryFn: () => adminService.getStudentGrowth(6).then((r) => r.data.data),
  });

  const { data: enrollmentTrend } = useQuery({
    queryKey: ['admin', 'enrollmentTrend'],
    queryFn: () => adminService.getEnrollmentTrend(6).then((r) => r.data.data),
  });

  const { data: coursePerformance } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: () => adminService.getCoursePerformance(8).then((r) => r.data.data),
  });

  const { data: instructors } = useQuery({
    queryKey: ['admin', 'instructors'],
    queryFn: () => adminService.getInstructorPerformance(5).then((r) => r.data.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminService.getCategoryBreakdown().then((r) => r.data.data),
  });

  const { data: usersRes } = useQuery({
    queryKey: ['admin', 'dashboard-users'],
    queryFn: () => userService.listUsers({ page: 1, limit: 10 }).then((r) => r.data),
  });

  const recentUsers = (usersRes?.data as any)?.users ?? (usersRes as any)?.users ?? [];

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Platform analytics and management overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatsCard
          title="Total Users"
          value={overview?.users.total ?? 0}
          subtitle={`${overview?.users.students ?? 0} students • ${overview?.users.admins ?? 0} admins`}
          icon={<UsersIcon />}
          color="indigo"
        />
        <StatsCard
          title="Published Courses"
          value={overview?.courses.published ?? 0}
          subtitle={`${overview?.courses.draft ?? 0} drafts`}
          icon={<BookIcon />}
          color="emerald"
        />
        <StatsCard
          title="Total Enrollments"
          value={overview?.enrollments.total ?? 0}
          subtitle={`${overview?.enrollments.completed ?? 0} completed`}
          icon={<TrendIcon />}
          color="purple"
        />
        <StatsCard
          title="Completion Rate"
          value={`${overview?.enrollments.completionRate ?? 0}%`}
          subtitle="Course completion"
          icon={<CheckIcon />}
          color="amber"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Student Growth */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Student Growth</h2>
          {growth && (
            <ReactApexChart
              type="area"
              height={220}
              options={areaOptions(growth.map((d) => d.month), isDark)}
              series={[{ name: 'New Students', data: growth.map((d) => d.count) }]}
            />
          )}
        </div>

        {/* Enrollment Trend */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Enrollment Trend</h2>
          {enrollmentTrend && (
            <ReactApexChart
              type="area"
              height={220}
              options={areaOptions(enrollmentTrend.map((d) => d.month), isDark)}
              series={[
                { name: 'Enrollments', data: enrollmentTrend.map((d) => d.enrollments) },
                { name: 'Completions', data: enrollmentTrend.map((d) => d.completions) },
              ]}
            />
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Top Courses */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Course Enrollments</h2>
          {coursePerformance && coursePerformance.length > 0 && (
            <ReactApexChart
              type="bar"
              height={220}
              options={barOptions(coursePerformance.map((c) => c.title.slice(0, 20)), isDark)}
              series={[{ name: 'Enrollments', data: coursePerformance.map((c) => c.enrollmentCount) }]}
            />
          )}
        </div>

        {/* Category breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Categories</h2>
          {categories && categories.length > 0 && (
            <ReactApexChart
              type="donut"
              height={220}
              options={{
                labels: categories.map((c) => c.name),
                colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
                legend: { position: 'bottom', labels: { colors: isDark ? '#d1d5db' : '#374151' } },
                dataLabels: { enabled: false },
                tooltip: { theme: isDark ? 'dark' : 'light' },
                chart: { background: 'transparent', fontFamily: 'inherit' },
                plotOptions: { pie: { donut: { size: '65%' } } },
              }}
              series={categories.map((c) => c.count)}
            />
          )}
        </div>
      </div>

      {/* Registered System Users */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Registered Users ({recentUsers.length})</h2>
          <Link to="/admin/users" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            View All Users →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {['User', 'Role', 'Status', 'Joined'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {recentUsers.map((u: any) => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {u.firstName?.[0] || 'U'}{u.lastName?.[0] || ''}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{u.firstName} {u.lastName}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                      u.role === 'admin' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                      u.role === 'instructor' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No registered users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
