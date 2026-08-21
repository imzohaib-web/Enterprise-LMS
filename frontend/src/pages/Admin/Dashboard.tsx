import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { adminService } from '../../services/admin.service';
import { userService } from '../../services/user.service';
import StatsCard from '../../components/lms/StatsCard';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

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
  stroke: { curve: 'smooth', width: 2.5 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 100] } },
  xaxis: { categories, labels: { style: { colors: isDark ? '#9ca3af' : '#6b7280', fontSize: '12px', fontWeight: 500 } }, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { labels: { style: { colors: isDark ? '#9ca3af' : '#6b7280', fontSize: '12px' } } },
  grid: { borderColor: isDark ? '#374151' : '#f3f4f6', strokeDashArray: 4 },
  tooltip: { theme: isDark ? 'dark' : 'light' },
  colors: ['#6366f1', '#10b981'],
  dataLabels: { enabled: false },
  legend: { show: true, labels: { colors: isDark ? '#d1d5db' : '#374151' } },
});

const barOptions = (categories: string[], isDark: boolean): ApexOptions => ({
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit', background: 'transparent' },
  plotOptions: { bar: { borderRadius: 8, columnWidth: '50%' } },
  xaxis: { categories, labels: { style: { colors: isDark ? '#9ca3af' : '#6b7280', fontSize: '11px' }, rotate: -25 }, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { labels: { style: { colors: isDark ? '#9ca3af' : '#6b7280', fontSize: '12px' } } },
  grid: { borderColor: isDark ? '#374151' : '#f3f4f6', strokeDashArray: 4 },
  tooltip: { theme: isDark ? 'dark' : 'light' },
  colors: ['#6366f1'],
  dataLabels: { enabled: false },
});

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse p-1">
    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/4" />
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const isDark = document.documentElement.classList.contains('dark');

  const { data: overview, isLoading: overviewLoading, isError: isOverviewError, error: overviewError, refetch: refetchOverview } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: () => adminService.getOverview().then((r) => r.data.data),
    refetchInterval: 30000,
    retry: 2,
  });

  const { data: growth, isLoading: growthLoading } = useQuery({
    queryKey: ['admin', 'growth'],
    queryFn: () => adminService.getStudentGrowth(6).then((r) => r.data.data),
    retry: 2,
  });

  const { data: enrollmentTrend, isLoading: trendLoading } = useQuery({
    queryKey: ['admin', 'enrollmentTrend'],
    queryFn: () => adminService.getEnrollmentTrend(6).then((r) => r.data.data),
    retry: 2,
  });

  const { data: coursePerformance } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: () => adminService.getCoursePerformance(8).then((r) => r.data.data),
    retry: 2,
  });

  const { data: categories } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminService.getCategoryBreakdown().then((r) => r.data.data),
    retry: 2,
  });

  const { data: usersRes } = useQuery({
    queryKey: ['admin', 'dashboard-users'],
    queryFn: () => userService.listUsers({ page: 1, limit: 10 }).then((r) => r.data),
    retry: 2,
  });

  const recentUsers = (usersRes?.data as any)?.users ?? (usersRes as any)?.users ?? [];

  if (overviewLoading || growthLoading || trendLoading) {
    return <DashboardSkeleton />;
  }

  if (isOverviewError) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl space-y-4 my-6 shadow-sm">
        <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Failed to Load Executive Dashboard Telemetry</h2>
        <p className="text-xs text-red-500 max-w-md mx-auto">
          {(overviewError as any)?.response?.data?.message || (overviewError as any)?.message || 'Unauthorized or network connection error'}
        </p>
        <button
          onClick={() => refetchOverview()}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-xs"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Executive Coursera/Canvas Style Header & Telemetry Chip Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1">
          <PageBreadcrumb pageTitle="Executive Admin Dashboard" />
        </div>
        <div className="flex items-center gap-2 -mt-6">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Platform Engine: Operational
          </div>
          <Link
            to="/admin/analytics"
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-xs"
          >
            Open Analytics Suite →
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatsCard
          title="Total Users"
          value={overview?.users.total ?? 0}
          subtitle={`${overview?.users.students ?? 0} active students • ${overview?.users.admins ?? 0} admins`}
          icon={<UsersIcon />}
          color="indigo"
        />
        <StatsCard
          title="Published Courses"
          value={overview?.courses.published ?? 0}
          subtitle={`${overview?.courses.draft ?? 0} draft submissions`}
          icon={<BookIcon />}
          color="emerald"
        />
        <StatsCard
          title="Total Enrollments"
          value={overview?.enrollments.total ?? 0}
          subtitle={`${overview?.enrollments.completed ?? 0} course completions`}
          icon={<TrendIcon />}
          color="purple"
        />
        <StatsCard
          title="Completion Rate"
          value={`${overview?.enrollments.completionRate ?? 0}%`}
          subtitle="Platform learning index"
          icon={<CheckIcon />}
          color="amber"
        />
      </div>

      {/* Quick Action Governance Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-purple-900 rounded-2xl p-5 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-amber-400 text-amber-950">
              Governance Hub
            </span>
            <h3 className="text-sm font-extrabold text-white">Administrative Action Center</h3>
          </div>
          <p className="text-xs text-indigo-200">
            Direct access to pending instructor applications, course moderation, security telemetry, and data exporters.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/users?tab=applications"
            className="px-3.5 py-2 text-xs font-bold bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <span>🎓</span> Review Applications
          </Link>
          <Link
            to="/admin/courses"
            className="px-3.5 py-2 text-xs font-bold bg-indigo-700 hover:bg-indigo-600 text-white rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <span>📚</span> Course Moderation
          </Link>
          <Link
            to="/admin/audit-logs"
            className="px-3.5 py-2 text-xs font-bold bg-indigo-950/60 hover:bg-indigo-950 text-indigo-200 rounded-xl transition border border-indigo-700/50 flex items-center gap-1.5"
          >
            <span>🛡️</span> Security Logs
          </Link>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Student Growth */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Student Registration Velocity</h2>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full">Monthly Sign-ups</span>
          </div>
          {growth && growth.length > 0 ? (
            <ReactApexChart
              type="area"
              height={230}
              options={areaOptions(growth.map((d) => d.month), isDark)}
              series={[{ name: 'New Registered Students', data: growth.map((d) => d.count) }]}
            />
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-gray-400">
              No student growth data recorded in this period
            </div>
          )}
        </div>

        {/* Enrollment Trend */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Enrollment vs Completion Velocity</h2>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">Comparative Index</span>
          </div>
          {enrollmentTrend && enrollmentTrend.length > 0 ? (
            <ReactApexChart
              type="area"
              height={230}
              options={areaOptions(enrollmentTrend.map((d) => d.month), isDark)}
              series={[
                { name: 'Enrollments', data: enrollmentTrend.map((d) => d.enrollments) },
                { name: 'Completions', data: enrollmentTrend.map((d) => d.completions) },
              ]}
            />
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-gray-400">
              No enrollment trends recorded
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Top Courses */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Catalog Enrollment Volume</h2>
            <Link to="/admin/courses" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Manage Catalog →</Link>
          </div>
          {coursePerformance && coursePerformance.length > 0 ? (
            <ReactApexChart
              type="bar"
              height={230}
              options={barOptions(coursePerformance.map((c) => c.title.slice(0, 20)), isDark)}
              series={[{ name: 'Enrollments', data: coursePerformance.map((c) => c.enrollmentCount) }]}
            />
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-gray-400">
              No course enrollment metrics available
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Category Distribution</h2>
          {categories && categories.length > 0 ? (
            <ReactApexChart
              type="donut"
              height={230}
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
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-gray-400">
              No course categories registered
            </div>
          )}
        </div>
      </div>

      {/* ── Actionable Management Sections ────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Pending Instructor Applications */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Pending Applications ({overview?.actionable?.pendingApplicationsCount ?? (overview as any)?.actionable?.pendingApplications?.length ?? 0})
              </h2>
            </div>
            <Link to="/admin/users?tab=applications" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Review All →
            </Link>
          </div>
          <div className="p-4 flex-1">
            {overview?.actionable?.pendingApplications && overview.actionable.pendingApplications.length > 0 ? (
              <div className="space-y-3">
                {overview.actionable.pendingApplications.map((app: any) => (
                  <div key={app._id} className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl flex items-center justify-between gap-3 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                        🎓
                      </div>
                      <div>
                        <div className="font-bold text-xs text-gray-900 dark:text-white">{app.applicantName || app.email}</div>
                        <div className="text-[11px] text-gray-500">{app.specialization || 'Instructor Applicant'} • {app.experienceYears || 0} yrs exp</div>
                      </div>
                    </div>
                    <Link
                      to="/admin/users?tab=applications"
                      className="px-3 py-1 bg-indigo-600 text-white text-[11px] font-bold rounded-lg hover:bg-indigo-700 transition"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-xs text-gray-400 italic">
                ✓ No pending instructor applications requiring review
              </div>
            )}
          </div>
        </div>

        {/* Courses Awaiting Review */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Courses Awaiting Review ({overview?.actionable?.coursesAwaitingReviewCount ?? (overview as any)?.actionable?.coursesAwaitingReview?.length ?? 0})
              </h2>
            </div>
            <Link to="/admin/courses" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Moderation Console →
            </Link>
          </div>
          <div className="p-4 flex-1">
            {overview?.actionable?.coursesAwaitingReview && overview.actionable.coursesAwaitingReview.length > 0 ? (
              <div className="space-y-3">
                {overview.actionable.coursesAwaitingReview.map((c: any) => (
                  <div key={c._id} className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl flex items-center justify-between gap-3 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                        📚
                      </div>
                      <div>
                        <div className="font-bold text-xs text-gray-900 dark:text-white">{c.title}</div>
                        <div className="text-[11px] text-gray-500">By {c.instructor?.firstName ? `${c.instructor.firstName} ${c.instructor.lastName}` : 'Instructor'} • ${c.price || 0}</div>
                      </div>
                    </div>
                    <Link
                      to="/admin/courses"
                      className="px-3 py-1 bg-indigo-600 text-white text-[11px] font-bold rounded-lg hover:bg-indigo-700 transition"
                    >
                      Moderate
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-xs text-gray-400 italic">
                ✓ No course submissions pending moderation approval
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coursera/Canvas Style Registered Users Data Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent System Directory ({recentUsers.length})</h2>
            <p className="text-xs text-gray-500">Live platform accounts registered across all user roles</p>
          </div>
          <Link to="/admin/users" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Manage Full Directory →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/50 uppercase text-gray-500 font-semibold">
              <tr>
                {['User Identity', 'Assigned Role', 'Account Status', 'Registration Date'].map((h) => (
                  <th key={h} className="px-6 py-3.5 text-left tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {recentUsers.map((u: any) => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                        {u.firstName?.[0] || 'U'}{u.lastName?.[0] || ''}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{u.firstName} {u.lastName}</div>
                        <div className="text-[11px] text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${
                      u.role === 'admin' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' :
                      u.role === 'instructor' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' :
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 w-fit ${
                      u.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-gray-500 font-mono text-[11px]">
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
