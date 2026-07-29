import React, { useState } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import { useStudentProgressList } from '../hooks/useInstructorDashboard';

export const StudentProgressPage: React.FC = () => {
  const { data: students, isLoading } = useStudentProgressList();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = students?.filter(
    (s) =>
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageMeta title="Student Progress | Instructor Dashboard" description="Track student progress across courses" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Student Progress Overview
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Monitor individual student completion percentages, module achievements, and average grades.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search student or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Table Card */}
        <ComponentCard title="Enrolled Students Progress" desc="Real-time progress records">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-400">Loading student progress...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Modules Completed</th>
                    <th className="py-3 px-4">Completion Progress</th>
                    <th className="py-3 px-4">Avg Score</th>
                    <th className="py-3 px-4 text-right">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {filtered && filtered.length > 0 ? (
                    filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                          <img
                            src={item.avatar || '/images/user/owner.jpg'}
                            alt={item.studentName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{item.studentName}</p>
                            <p className="text-xs text-gray-400">{item.studentEmail}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300 font-medium">
                          {item.courseName}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-800 dark:text-gray-200">
                          {item.completedModules} / {item.totalModules}
                        </td>
                        <td className="py-3.5 px-4 min-w-[160px]">
                          <div className="flex items-center gap-3">
                            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                              <div
                                className="bg-brand-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${item.progressPercent}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-9 text-right">
                              {item.progressPercent}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`font-bold ${item.avgScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {item.avgScore}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-xs text-gray-400">
                          {item.lastActive}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No student progress records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
};

export default StudentProgressPage;
