import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageMeta from '../../../components/common/PageMeta';
import { PUBLIC, STUDENT, INSTRUCTOR, ADMIN } from '../../../constants/routes';

export const PublicLoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'instructor' | 'admin'>('student');
  const [email, setEmail] = useState('alex.student@enterpriselms.com');
  const [password, setPassword] = useState('••••••••••••');
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'student' | 'instructor' | 'admin') => {
    setSelectedRole(role);
    if (role === 'student') setEmail('alex.student@enterpriselms.com');
    if (role === 'instructor') setEmail('dr.rostova@enterpriselms.com');
    if (role === 'admin') setEmail('admin@enterpriselms.com');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'student') navigate(STUDENT.DASHBOARD);
    else if (selectedRole === 'instructor') navigate(INSTRUCTOR.DASHBOARD);
    else navigate(ADMIN.DASHBOARD);
  };

  return (
    <>
      <PageMeta
        title="Sign In | Enterprise LMS"
        description="Sign in to your Enterprise LMS student, instructor, or administrator portal."
      />

      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8 p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 shadow-xl">
          {/* Header */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500 text-white font-extrabold text-lg flex items-center justify-center">
                LMS
              </div>
              <span className="font-extrabold text-gray-900 dark:text-white text-xl">
                Enterprise LMS
              </span>
            </Link>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight pt-2">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Access your personalized learning portal, assessments, and progress.
            </p>
          </div>

          {/* Quick Role Switcher for Demo */}
          <div className="p-1.5 bg-gray-100 dark:bg-gray-900 rounded-2xl flex items-center gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleRoleSelect('student')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                selectedRole === 'student'
                  ? 'bg-white dark:bg-gray-800 text-brand-500 font-bold shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('instructor')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                selectedRole === 'instructor'
                  ? 'bg-white dark:bg-gray-800 text-brand-500 font-bold shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              👨‍🏫 Instructor
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                selectedRole === 'admin'
                  ? 'bg-white dark:bg-gray-800 text-brand-500 font-bold shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              ⚙️ Admin
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Work / Academic Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-2xs font-semibold text-brand-500 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-400">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
                Remember this browser
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-xs transition-colors"
            >
              Sign In as {selectedRole.toUpperCase()}
            </button>
          </form>

          {/* Footer link */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Don't have an account yet?{' '}
            <Link to={PUBLIC.REGISTER} className="font-bold text-brand-500 hover:underline">
              Create Free Account
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default PublicLoginPage;
