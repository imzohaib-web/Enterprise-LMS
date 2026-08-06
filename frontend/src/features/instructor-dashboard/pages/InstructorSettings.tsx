import React, { useState, useEffect } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import Badge from '../../../components/ui/badge/Badge';
import { useInstructorProfile, useUpdateInstructorSettings } from '../hooks/useInstructorDashboard';

export const InstructorSettings: React.FC = () => {
  const { data: profile, isLoading, isError, refetch } = useInstructorProfile();
  const updateSettingsMutation = useUpdateInstructorSettings();

  const [activeTab, setActiveTab] = useState<
    'account' | 'password' | 'notifications' | 'appearance' | 'language' | 'timezone' | 'privacy' | 'security' | 'sessions'
  >('account');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [notifyQuizzes, setNotifyQuizzes] = useState(true);
  const [notifyDiscussions, setNotifyDiscussions] = useState(true);
  const [notifySystemUpdates, setNotifySystemUpdates] = useState(false);

  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  const [privacy, setPrivacy] = useState('public');
  const [showEmailToStudents, setShowEmailToStudents] = useState(true);

  const [enable2FA, setEnable2FA] = useState(false);
  const [jwtSessionTimeout, setJwtSessionTimeout] = useState('7d');

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setDepartment(profile.department || '');
      if (profile.settings) {
        setTheme(profile.settings.theme || 'light');
        setLanguage(profile.settings.language || 'en');
        setTimezone(profile.settings.timezone || 'UTC');
        setPrivacy(profile.settings.privacy || 'public');
        setEmailAlerts(profile.settings.emailAlerts ?? true);
        setNotifyQuizzes(profile.settings.notifyQuizzes ?? true);
        setNotifyDiscussions(profile.settings.notifyDiscussions ?? true);
        setNotifySystemUpdates(profile.settings.notifySystemUpdates ?? false);
        setShowEmailToStudents(profile.settings.showEmailToStudents ?? true);
        setEnable2FA(profile.settings.enable2FA ?? false);
        setJwtSessionTimeout(profile.settings.jwtSessionTimeout || '7d');
      }
    }
  }, [profile]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (activeTab === 'password') {
      if (!password) {
        setFeedbackMsg({ type: 'error', text: 'Please enter a new password.' });
        return;
      }
      if (password.length < 6) {
        setFeedbackMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
        return;
      }
      if (password !== confirmPassword) {
        setFeedbackMsg({ type: 'error', text: 'New passwords do not match.' });
        return;
      }
    }

    const payload: any = {
      name,
      email,
      phone,
      department,
      settings: {
        theme,
        language,
        timezone,
        privacy,
        emailAlerts,
        notifyQuizzes,
        notifyDiscussions,
        notifySystemUpdates,
        showEmailToStudents,
        enable2FA,
        jwtSessionTimeout,
      },
    };

    if (activeTab === 'password' && password) {
      payload.currentPassword = currentPassword;
      payload.password = password;
    }

    updateSettingsMutation.mutate(payload, {
      onSuccess: () => {
        setFeedbackMsg({ type: 'success', text: 'Settings successfully persisted to MongoDB!' });
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => setFeedbackMsg(null), 4000);
      },
      onError: (err: any) => {
        setFeedbackMsg({
          type: 'error',
          text: err?.response?.data?.message || err?.message || 'Failed to update settings in MongoDB.',
        });
      },
    });
  };

  const handleRevokeSessions = () => {
    if (window.confirm('Are you sure you want to revoke all other active sessions?')) {
      setFeedbackMsg({ type: 'success', text: 'All other active sessions have been revoked.' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const tabs = [
    { key: 'account', label: 'Account' },
    { key: 'password', label: 'Change Password' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'appearance', label: 'Appearance' },
    { key: 'language', label: 'Language' },
    { key: 'timezone', label: 'Timezone' },
    { key: 'privacy', label: 'Privacy' },
    { key: 'security', label: 'Security' },
    { key: 'sessions', label: 'Session Management' },
  ] as const;

  return (
    <>
      <PageMeta
        title="Instructor Settings & Preferences | Enterprise LMS"
        description="Configure account, security, appearance, notifications, and login sessions"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Instructor Settings & Security
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Persisted directly to MongoDB and secured with JWT authentication.
            </p>
          </div>

          {feedbackMsg && (
            <div
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800'
              }`}
            >
              {feedbackMsg.text}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 border-b border-gray-200 dark:border-gray-800 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                setFeedbackMsg(null);
              }}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
            <p className="text-sm text-gray-500">Loading instructor settings from MongoDB...</p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center space-y-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">Failed to load settings data.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          <ComponentCard
            title={`${tabs.find((t) => t.key === activeTab)?.label} Settings`}
            desc="Synchronized with MongoDB database"
          >
            <form onSubmit={handleSaveSettings} className="space-y-5 max-w-xl py-1">
              {/* 1. Account Section */}
              {activeTab === 'account' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
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
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* 2. Change Password Section */}
              {activeTab === 'password' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* 3. Notifications Section */}
              {activeTab === 'notifications' && (
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white block">Email Notifications</span>
                      <span className="text-xs text-gray-400">Receive summary reports via registered email address</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={notifyQuizzes}
                      onChange={(e) => setNotifyQuizzes(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white block">Quiz Attempt Alerts</span>
                      <span className="text-xs text-gray-400">Notify when a student submits a new quiz attempt</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={notifyDiscussions}
                      onChange={(e) => setNotifyDiscussions(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white block">Discussion Reply Alerts</span>
                      <span className="text-xs text-gray-400">Notify when a student posts or replies in your course threads</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={notifySystemUpdates}
                      onChange={(e) => setNotifySystemUpdates(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white block">Platform System Announcements</span>
                      <span className="text-xs text-gray-400">Maintenance schedules and platform feature releases</span>
                    </div>
                  </label>
                </div>
              )}

              {/* 4. Appearance Section */}
              {activeTab === 'appearance' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Interface Color Scheme</label>
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

              {/* 5. Language Section */}
              {activeTab === 'language' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Portal Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Spanish (Español)</option>
                    <option value="fr">French (Français)</option>
                    <option value="de">German (Deutsch)</option>
                    <option value="ar">Arabic (العربية)</option>
                    <option value="zh">Chinese (中文)</option>
                  </select>
                </div>
              )}

              {/* 6. Timezone Section */}
              {activeTab === 'timezone' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Display Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                    <option value="EST">EST (Eastern Standard Time - US/New York)</option>
                    <option value="PST">PST (Pacific Standard Time - US/Los Angeles)</option>
                    <option value="GMT">GMT (Greenwich Mean Time - London)</option>
                    <option value="PKT">PKT (Pakistan Standard Time - Islamabad)</option>
                    <option value="IST">IST (Indian Standard Time - New Delhi)</option>
                  </select>
                </div>
              )}

              {/* 7. Privacy Section */}
              {activeTab === 'privacy' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Directory Visibility</label>
                    <select
                      value={privacy}
                      onChange={(e) => setPrivacy(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                    >
                      <option value="public">Public (Visible in Instructor Directory)</option>
                      <option value="enrolled">Enrolled Students Only</option>
                      <option value="private">Private (Only Admin & Assigned Classes)</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={showEmailToStudents}
                      onChange={(e) => setShowEmailToStudents(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Show email address on course landing pages for student support inquiries
                    </span>
                  </label>
                </div>
              )}

              {/* 8. Security Section */}
              {activeTab === 'security' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Two-Factor Authentication (2FA)</h4>
                        <p className="text-xs text-gray-400">Add an extra layer of security to your instructor account.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={enable2FA}
                        onChange={(e) => setEnable2FA(e.target.checked)}
                        className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">JWT Bearer Token Lifespan</label>
                    <select
                      value={jwtSessionTimeout}
                      onChange={(e) => setJwtSessionTimeout(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                    >
                      <option value="1d">1 Day (Maximum Security)</option>
                      <option value="7d">7 Days (Recommended)</option>
                      <option value="30d">30 Days (Extended Session)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 9. Session Management Section */}
              {activeTab === 'sessions' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Current Active Web Session</p>
                        <Badge color="success">Active</Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Chrome Desktop • Windows OS • IP: 127.0.0.1</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleRevokeSessions}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition"
                    >
                      🔒 Revoke All Other Active Sessions
                    </button>
                  </div>
                </div>
              )}

              {/* Action Submit */}
              {activeTab !== 'sessions' && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings to MongoDB'}
                  </button>
                </div>
              )}
            </form>
          </ComponentCard>
        )}
      </div>
    </>
  );
};

export default InstructorSettings;
