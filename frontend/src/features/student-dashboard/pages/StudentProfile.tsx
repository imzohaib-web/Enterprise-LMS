import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import PageMeta from '../../../components/common/PageMeta';
import { userService } from '../../../services/user.service';
import { courseService } from '../../../services/course.service';
import { getMyCertificates } from '../../../services/certificateService';

export const StudentProfile: React.FC = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // 1. Fetch User Profile
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: async () => {
      const res = await userService.getProfile();
      return res.data?.data?.user;
    },
  });

  // 2. Fetch Learning Stats
  const { data: enrollments = [] } = useQuery({
    queryKey: ['studentEnrollmentsStats'],
    queryFn: async () => {
      const res = await courseService.getMyEnrollments();
      return res.data?.data?.enrollments || [];
    },
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['studentCertificatesStats'],
    queryFn: async () => {
      return await getMyCertificates();
    },
  });

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    department: '',
  });

  React.useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        bio: userData.bio || '',
        department: userData.department || 'Computer Science',
      });
    }
  }, [userData]);

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: typeof formData) => userService.updateProfile(data),
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      setIsEditing(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    },
  });

  // Upload Avatar Mutation
  const avatarMutation = useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: () => {
      toast.success('Avatar updated!');
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Avatar upload failed');
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      avatarMutation.mutate(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if (isUserLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-6 animate-pulse">
        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      </div>
    );
  }

  const completedCourses = enrollments.filter((e: any) => e.status === 'completed' || e.progressPercentage === 100).length;
  const activeCourses = enrollments.length - completedCourses;

  return (
    <>
      <PageMeta title="Student Profile | Enterprise LMS" description="Manage student profile and personal information" />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <img
                src={userData?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt={userData?.firstName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-brand-500/20 shadow-md"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-brand-600 hover:bg-brand-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition-transform transform group-hover:scale-110"
                title="Change Avatar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {userData?.firstName} {userData?.lastName}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 hover:bg-brand-100 transition-colors self-center sm:self-auto"
                >
                  {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                </button>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {userData?.email}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 text-xs text-gray-500">
                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-full font-semibold">
                  ID: {userData?.studentId || 'STU-2026-001'}
                </span>
                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-full font-semibold">
                  Dept: {userData?.department || 'Computer Science'}
                </span>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-full font-semibold capitalize">
                  {userData?.role || 'Student'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl text-center">
            <span className="block text-2xl font-black text-gray-900 dark:text-white">{enrollments.length}</span>
            <span className="text-xs text-gray-500 font-medium">Total Courses</span>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl text-center">
            <span className="block text-2xl font-black text-brand-600 dark:text-brand-400">{activeCourses}</span>
            <span className="text-xs text-gray-500 font-medium">In Progress</span>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl text-center">
            <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedCourses}</span>
            <span className="text-xs text-gray-500 font-medium">Completed</span>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl text-center">
            <span className="block text-2xl font-black text-purple-600 dark:text-purple-400">{certificates.length}</span>
            <span className="text-xs text-gray-500 font-medium">Certificates</span>
          </div>
        </div>

        {/* Profile Details & Form */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Personal Information
          </h2>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-brand-500"
                    placeholder="+1 555-0199"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Student Bio</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-brand-500"
                  placeholder="Share a short bio about your learning goals and background..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm disabled:opacity-60"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 font-semibold">Phone</span>
                  <p className="mt-1 font-medium">{userData?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 font-semibold">Department</span>
                  <p className="mt-1 font-medium">{userData?.department || 'Computer Science'}</p>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 font-semibold">Member Since</span>
                  <p className="mt-1 font-medium">
                    {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'August 2026'}
                  </p>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 font-semibold">Account Status</span>
                  <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full">
                    Active & Verified
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <span className="block text-xs text-gray-500 dark:text-gray-400 font-semibold">Bio</span>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">
                  "{userData?.bio || 'No bio added yet. Click edit profile to add your student summary.'}"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentProfile;
