import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { selectCurrentUser } from '../../features/auth/authSlice';

import { userService } from '../../services/user.service';

const AdminProfile: React.FC = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'permissions' | 'logs'>('profile');
  const [firstName, setFirstName] = useState(currentUser?.firstName || 'System');
  const [lastName, setLastName] = useState(currentUser?.lastName || 'Admin');
  const [email, setEmail] = useState(currentUser?.email || 'admin@enterprise.lms');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.updateProfile({ firstName, lastName, email });
      toast.success('Admin profile updated successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordResetRequest = async () => {
    try {
      const api = (await import('../../services/api')).default;
      await api.post('/auth/request-password-reset', { email });
      toast.success('Password reset instructions have been sent to your email');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to request password reset');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <PageBreadcrumb pageTitle="Admin Profile & Settings" />

      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-indigo-500/20">
            {firstName[0]}{lastName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {firstName} {lastName}
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
                Super Administrator
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{email} • System Operations & Governance</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => toast.success('2FA Authentication is active for this admin account')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 transition"
          >
            ✓ 2FA Security Enabled
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 gap-6">
        {[
          { id: 'profile', label: 'Account Details' },
          { id: 'security', label: 'Security & Password' },
          { id: 'permissions', label: 'Admin Permissions' },
          { id: 'logs', label: 'Activity Logs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-sm font-semibold border-b-2 transition ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm space-y-4 max-w-2xl">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Personal Identity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'security' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm space-y-4 max-w-2xl">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Security & Password Credentials</h3>
          <p className="text-xs text-gray-500">Ensure your administrator account uses a strong password and multi-factor authentication.</p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={handlePasswordResetRequest}
              className="px-4 py-2 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 transition"
            >
              Request Password Reset
            </button>
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm space-y-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">System Administrative Privileges</h3>
          <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
            <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">✓ Full Database & System Access</li>
            <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">✓ User Account Deactivation & Role Management</li>
            <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">✓ System Analytics & CSV/PDF Report Exporters</li>
          </ul>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm text-xs text-gray-500">
          Recent admin actions are logged and audited in accordance with enterprise compliance policies.
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
