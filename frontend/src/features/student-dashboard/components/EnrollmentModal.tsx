import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../features/auth/authSlice';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  onSubmit: (data: { phone: string; learningGoals: string; agreedTerms: boolean }) => void;
  isLoading: boolean;
}

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  isOpen,
  onClose,
  courseTitle,
  onSubmit,
  isLoading,
}) => {
  const user = useSelector(selectCurrentUser);

  const [phone, setPhone] = useState('');
  const [learningGoals, setLearningGoals] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPhone(user?.phone || '');
      setLearningGoals('');
      setAgreedTerms(false);
      setError('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Phone number is required for course communications.');
      return;
    }
    if (!learningGoals.trim()) {
      setError('Please share your primary learning goal for this course.');
      return;
    }
    if (!agreedTerms) {
      setError('You must agree to the Terms of Service and Honor Code to enroll.');
      return;
    }
    setError('');
    onSubmit({ phone: phone.trim(), learningGoals: learningGoals.trim(), agreedTerms });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Course Enrollment Form
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
              Course: <span className="font-bold text-indigo-600 dark:text-indigo-400">{courseTitle}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold p-1"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Auto-populated Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Full Name <span className="text-xs text-gray-400 font-normal">(Auto-populated from Profile)</span>
            </label>
            <input
              type="text"
              disabled
              value={user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Student' : ''}
              className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Auto-populated Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Email Address <span className="text-xs text-gray-400 font-normal">(Auto-populated)</span>
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Required Phone Number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Contact Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Required Learning Goal */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Primary Learning Goal / Motivation <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Master React & Node.js for upcoming enterprise architecture project..."
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Required Terms Checkbox */}
          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="agreedTerms"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="agreedTerms" className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
              I agree to the <span className="font-bold text-indigo-600 dark:text-indigo-400">Enterprise LMS Honor Code & Terms of Service</span>.
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md disabled:opacity-60 cursor-pointer flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                  <span>Confirming Enrollment...</span>
                </>
              ) : (
                <span>Confirm & Complete Enrollment &rarr;</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnrollmentModal;
