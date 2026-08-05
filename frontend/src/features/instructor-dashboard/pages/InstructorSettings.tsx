import React, { useState, useEffect } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import { useInstructorProfile, useUpdateInstructorSettings } from '../hooks/useInstructorDashboard';

export const InstructorSettings: React.FC = () => {
  const { data: profile } = useInstructorProfile();
  const updateSettingsMutation = useUpdateInstructorSettings();

  const [activeTab, setActiveTab] = useState<
    'account' | 'password' | 'notifications' | 'theme' | 'language' | 'privacy' | 'sessions'
  >('account');

  // Form states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifyQuizzes, setNotifyQuizzes] = useState(true);
  const [notifyDiscussions, setNotifyDiscussions] = useState(true);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  const [privacy, setPrivacy] = useState('public');

  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      if (profile.settings) {
        setTheme(profile.settings.theme || 'light');
        setLanguage(profile.settings.language || 'en');
        setTimezone(profile.settings.timezone || 'UTC');
        setPrivacy(profile.settings.privacy || 'public');
      }
    }
  }, [profile]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'password' && password && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    updateSettingsMutation.mutate(
      {
        email,
        phone,
        password: password || undefined,
        settings: {
          notifications: notifyQuizzes,
          theme,
          language,
          timezone,
          privacy,
        },
      },
      {
        onSuccess: () => {
          setSaveSuccessMessage('Settings updated successfully in MongoDB!');
          setTimeout(() => setSaveSuccessMessage(''), 4000);
        },
      }
    );
  };

  return (
    <>
      <PageMeta title="Account & Preferences Settings | Instructor Portal" description="Manage instructor settings" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Instructor Settings & Preferences
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure account security, notifications, UI theme, language, timezone, and active login sessions.
            </p>
          </div>
          {saveSuccessMessage && (
            <div className="px-4 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800">
              {saveSuccessMessage}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto pb-2">
          {(['account', 'password', 'notifications', 'theme', 'language', 'privacy', 'sessions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Settings Form Body */}
        <ComponentCard title={`${activeTab.toUpperCase()} Configuration`} desc="Saved directly to database user settings">
          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
            {activeTab === 'account' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyQuizzes}
                    onChange={(e) => setNotifyQuizzes(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Notify me when a student submits a quiz attempt
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyDiscussions}
                    onChange={(e) => setNotifyDiscussions(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Discussion post and reply notifications
                  </span>
                </label>
              </div>
            )}

            {activeTab === 'theme' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Interface Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                  <option value="system">System Preference</option>
                </select>
              </div>
            )}

            {activeTab === 'language' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="UTC">UTC Universal</option>
                    <option value="EST">EST (Eastern Standard)</option>
                    <option value="PST">PST (Pacific Standard)</option>
                    <option value="PKT">PKT (Pakistan Standard)</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Visibility</label>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                >
                  <option value="public">Public (Enrolled Students & Directory)</option>
                  <option value="enrolled">Enrolled Students Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Current Web Session</p>
                    <p className="text-xs text-gray-400">Chrome on Windows • Active Now</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">Active</span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                type="submit"
                disabled={updateSettingsMutation.isPending}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings to MongoDB'}
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
};

export default InstructorSettings;
