import React, { useState } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import Badge from '../../../components/ui/badge/Badge';
import {
  useInstructorProfile,
  useUpdateInstructorProfile,
} from '../hooks/useInstructorDashboard';

import { userService } from '../../../services/user.service';

export const InstructorProfilePage: React.FC = () => {
  const { data: profile, isLoading, isError, error, refetch } = useInstructorProfile();
  const updateProfileMutation = useUpdateInstructorProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const handleOpenEdit = () => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setDepartment(profile.department || '');
      setQualification(profile.qualification || '');
      setSpecialization(profile.specialization || '');
      setBio(profile.bio || '');
      setAvatar(profile.avatar || '');
    }
    setAvatarError('');
    setIsEditing(true);
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError('Only JPG, PNG, WEBP, and GIF images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image file size must be less than 5MB.');
      return;
    }

    setAvatarError('');
    setUploadingAvatar(true);

    try {
      const res = await userService.uploadAvatar(file);
      const uploadedUrl = res.data?.data?.avatarUrl || res.data?.data?.user?.avatar;
      if (uploadedUrl) {
        setAvatar(uploadedUrl);
      }
    } catch (err: any) {
      setAvatarError(err.response?.data?.message || 'Failed to upload avatar image.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(
      {
        name,
        email,
        phone,
        department,
        qualification,
        specialization,
        bio,
        avatar,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  return (
    <>
      <PageMeta
        title="Instructor Profile | Enterprise LMS"
        description="View and update official instructor credentials and profile information"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Instructor Profile & Credentials
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Synchronized directly with MongoDB user authentication and role management.
            </p>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={handleOpenEdit}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition cursor-pointer shadow-sm"
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
            <p className="text-sm text-gray-500">Fetching instructor credentials from MongoDB...</p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center space-y-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              Failed to load profile: {(error as any)?.message || 'Server error'}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            >
              Retry Loading
            </button>
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Card: Avatar & Summary */}
            <div className="lg:col-span-1 space-y-6">
              <ComponentCard title="Instructor Bio" desc="Official platform identity">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={profile.avatar || '/images/user/owner.jpg'}
                      alt={profile.name}
                      className="w-28 h-28 rounded-full object-cover border-4 border-brand-500 shadow-md mx-auto"
                    />
                    <Badge color="success">
                      Verified Instructor
                    </Badge>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
                    <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-0.5">
                      {profile.department}
                    </p>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed px-2">
                    {profile.bio}
                  </p>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{profile.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phone:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{profile.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Member Since:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{profile.joinedDate}</span>
                    </div>
                  </div>
                </div>
              </ComponentCard>

              {/* Teaching Stats Card */}
              <ComponentCard title="Teaching Statistics" desc="MongoDB aggregated metrics">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-black text-brand-600 dark:text-brand-400">
                      {profile.stats?.totalCourses || 0}
                    </div>
                    <div className="text-[10px] font-semibold uppercase text-gray-400 mt-1">Authored Courses</div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {profile.stats?.totalStudents || 0}
                    </div>
                    <div className="text-[10px] font-semibold uppercase text-gray-400 mt-1">Total Students</div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {profile.stats?.totalAssessments || 0}
                    </div>
                    <div className="text-[10px] font-semibold uppercase text-gray-400 mt-1">Quizzes Created</div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-black text-amber-500">
                      {profile.stats?.avgRating || 4.9} ★
                    </div>
                    <div className="text-[10px] font-semibold uppercase text-gray-400 mt-1">Avg Student Score</div>
                  </div>
                </div>
              </ComponentCard>
            </div>

            {/* Right Card: Details & Edit Form */}
            <div className="lg:col-span-2">
              <ComponentCard title="Academic & Professional Qualifications" desc="Instructor background details">
                {!isEditing ? (
                  <div className="space-y-5 py-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <label className="block text-xs font-semibold text-gray-400 uppercase">Department</label>
                        <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                          {profile.department}
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <label className="block text-xs font-semibold text-gray-400 uppercase">Highest Qualification</label>
                        <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                          {profile.qualification}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <label className="block text-xs font-semibold text-gray-400 uppercase">Specialization & Expertise</label>
                      <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                        {profile.specialization}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <label className="block text-xs font-semibold text-gray-400 uppercase">Professional Biography</label>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                        {profile.bio}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
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

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Qualification</label>
                        <input
                          type="text"
                          value={qualification}
                          onChange={(e) => setQualification(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization</label>
                        <input
                          type="text"
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar Image Upload / URL</label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          disabled={uploadingAvatar}
                          onChange={handleAvatarFileChange}
                          className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 disabled:opacity-50"
                        />
                        <span className="text-xs text-gray-400">or URL:</span>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={avatar}
                          onChange={(e) => setAvatar(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                        />
                      </div>
                      {uploadingAvatar && (
                        <p className="text-xs text-brand-600 dark:text-brand-400 mt-1">Uploading image to server...</p>
                      )}
                      {avatarError && (
                        <p className="text-xs text-rose-500 mt-1">{avatarError}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Biography</label>
                      <textarea
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="px-4 py-2 text-xs font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50"
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
                      </button>
                    </div>
                  </form>
                )}
              </ComponentCard>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default InstructorProfilePage;
