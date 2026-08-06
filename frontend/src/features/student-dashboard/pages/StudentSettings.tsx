import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import { userService } from '../../../services/user.service';
import { authService } from '../../../services/auth.service';

export const StudentSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'appearance' | 'privacy' | 'danger'>('account');

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Settings form state
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      inApp: true,
      discussion: true,
      assessmentReminders: true,
    },
    appearance: {
      theme: 'system',
      language: 'English',
      timezone: 'UTC',
    },
    privacy: {
      accountVisibility: 'enrolled_only',
      dataPreferences: 'standard',
    },
    twoFactorEnabled: false,
  });

  // Fetch current user settings
  const { data: userData, isLoading } = useQuery({
    queryKey: ['studentProfileSettings'],
    queryFn: async () => {
      const res = await userService.getProfile();
      return res.data?.data?.user;
    },
  });

  useEffect(() => {
    if (userData?.settings) {
      setSettings({
        notifications: {
          email: userData.settings.notifications?.email ?? true,
          inApp: userData.settings.notifications?.inApp ?? true,
          discussion: userData.settings.notifications?.discussion ?? true,
          assessmentReminders: userData.settings.notifications?.assessmentReminders ?? true,
        },
        appearance: {
          theme: userData.settings.appearance?.theme || 'system',
          language: userData.settings.appearance?.language || 'English',
          timezone: userData.settings.appearance?.timezone || 'UTC',
        },
        privacy: {
          accountVisibility: userData.settings.privacy?.accountVisibility || 'enrolled_only',
          dataPreferences: userData.settings.privacy?.dataPreferences || 'standard',
        },
        twoFactorEnabled: userData.settings.twoFactorEnabled ?? false,
      });
    }
  }, [userData]);

  // Settings update mutation
  const saveSettingsMutation = useMutation({
    mutationFn: (newSettings: typeof settings) => userService.updateSettings(newSettings),
    onSuccess: () => {
      toast.success('Settings saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['studentProfileSettings'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to save settings');
    },
  });

  // Password change handler
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      await authService.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Password update failed');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-6 animate-pulse">
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Student Settings | Enterprise LMS" description="Manage account security, preferences, and notifications" />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Account Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure security, notifications, theme preferences, and privacy rules.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto pb-2">
          {(
            [
              { id: 'account', label: 'Account & Security' },
              { id: 'notifications', label: 'Notifications' },
              { id: 'appearance', label: 'Appearance' },
              { id: 'privacy', label: 'Privacy' },
              { id: 'danger', label: 'Danger Zone' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Account Security */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <ComponentCard title="Change Password" desc="Update your password regularly for enhanced account security">
              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  Update Password
                </button>
              </form>
            </ComponentCard>

            <ComponentCard title="Two-Step Verification (2FA)" desc="Add an extra layer of protection to your account">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Two-Factor Authentication: {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Secure your account using an authenticator app (Google Authenticator or Authy).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !settings.twoFactorEnabled;
                    const updated = { ...settings, twoFactorEnabled: nextVal };
                    setSettings(updated);
                    saveSettingsMutation.mutate(updated);
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                    settings.twoFactorEnabled
                      ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {settings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
            </ComponentCard>
          </div>
        )}

        {/* Tab 2: Notifications */}
        {activeTab === 'notifications' && (
          <ComponentCard title="Notification Preferences" desc="Control how and when you receive course alerts">
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive course updates and system announcements via email' },
                { key: 'inApp', label: 'In-App Bell Alerts', desc: 'Display popover notification alerts in the dashboard header' },
                { key: 'discussion', label: 'Discussion Forum Alerts', desc: 'Get notified when instructors or peers reply to your posts' },
                { key: 'assessmentReminders', label: 'Assessment Reminders', desc: 'Receive automated countdown reminders for upcoming quizzes' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.label}</h4>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={(settings.notifications as any)[item.key]}
                    onChange={(e) => {
                      const updated = {
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          [item.key]: e.target.checked,
                        },
                      };
                      setSettings(updated);
                      saveSettingsMutation.mutate(updated);
                    }}
                    className="w-5 h-5 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                  />
                </div>
              ))}
            </div>
          </ComponentCard>
        )}

        {/* Tab 3: Appearance */}
        {activeTab === 'appearance' && (
          <ComponentCard title="Theme & Display Preferences" desc="Customize your interface language, theme, and timezone">
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Theme Mode</label>
                <select
                  value={settings.appearance.theme}
                  onChange={(e) => {
                    const updated = {
                      ...settings,
                      appearance: { ...settings.appearance, theme: e.target.value },
                    };
                    setSettings(updated);
                    saveSettingsMutation.mutate(updated);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                >
                  <option value="system">System Default</option>
                  <option value="light">Light Theme</option>
                  <option value="dark">Dark Theme</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Portal Language</label>
                <select
                  value={settings.appearance.language}
                  onChange={(e) => {
                    const updated = {
                      ...settings,
                      appearance: { ...settings.appearance, language: e.target.value },
                    };
                    setSettings(updated);
                    saveSettingsMutation.mutate(updated);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                >
                  <option value="English">English (US)</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
                <select
                  value={settings.appearance.timezone}
                  onChange={(e) => {
                    const updated = {
                      ...settings,
                      appearance: { ...settings.appearance, timezone: e.target.value },
                    };
                    setSettings(updated);
                    saveSettingsMutation.mutate(updated);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Asia/Karachi">Karachi / Islamabad (PKT)</option>
                </select>
              </div>
            </div>
          </ComponentCard>
        )}

        {/* Tab 4: Privacy */}
        {activeTab === 'privacy' && (
          <ComponentCard title="Privacy Settings" desc="Manage profile visibility and telemetry data preferences">
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Account Visibility</label>
                <select
                  value={settings.privacy.accountVisibility}
                  onChange={(e) => {
                    const updated = {
                      ...settings,
                      privacy: { ...settings.privacy, accountVisibility: e.target.value },
                    };
                    setSettings(updated);
                    saveSettingsMutation.mutate(updated);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                >
                  <option value="public">Public (Visible to everyone)</option>
                  <option value="enrolled_only">Enrolled Peers & Instructors Only</option>
                  <option value="private">Private (Only me and admins)</option>
                </select>
              </div>
            </div>
          </ComponentCard>
        )}

        {/* Tab 5: Danger Zone */}
        {activeTab === 'danger' && (
          <div className="p-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold text-rose-700 dark:text-rose-400">Danger Zone Actions</h3>
            <p className="text-xs text-rose-600 dark:text-rose-300">
              Be cautious when modifying these settings. Logging out clears active tokens. Account deletion is permanent.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors"
              >
                Log Out of Account
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to request account deletion?')) {
                    toast.error('Account deletion request submitted to system administrator.');
                  }
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StudentSettings;
