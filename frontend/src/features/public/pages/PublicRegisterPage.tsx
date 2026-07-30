import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageMeta from '../../../components/common/PageMeta';
import { PUBLIC, STUDENT } from '../../../constants/routes';

export const PublicRegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('Alex Student');
  const [email, setEmail] = useState('alex.student@enterpriselms.com');
  const [password, setPassword] = useState('••••••••••••');
  const [agreed, setAgreed] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(STUDENT.DASHBOARD);
  };

  return (
    <>
      <PageMeta
        title="Get Started | Enterprise LMS"
        description="Register for a free Enterprise LMS account and start learning industry skills."
      />

      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-900">
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
              Create Your Learner Account
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Access self-paced modules, interactive quizzes, and verified digital credentials.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

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
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Create Secure Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              <span>
                I agree to the{' '}
                <Link to={PUBLIC.TERMS} className="text-brand-500 font-semibold hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to={PUBLIC.PRIVACY} className="text-brand-500 font-semibold hover:underline">
                  Privacy Policy
                </Link>.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-xs transition-colors"
            >
              Get Started Free
            </button>
          </form>

          {/* Footer link */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to={PUBLIC.LOGIN} className="font-bold text-brand-500 hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default PublicRegisterPage;
