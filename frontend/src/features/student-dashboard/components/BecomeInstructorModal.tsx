import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { instructorApplicationService } from '../../../services/instructorApplication.service';
import { logoutThunk } from '../../auth/authSlice';
import type { AppDispatch } from '../../../app/store';

interface BecomeInstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BecomeInstructorModal: React.FC<BecomeInstructorModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experienceYears, setExperienceYears] = useState(2);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [bio, setBio] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['myInstructorApplication'],
    queryFn: () => instructorApplicationService.getMyApplication(),
    enabled: isOpen,
  });

  const myApp = data?.data?.application;

  const handleLogoutAndLogin = async () => {
    onClose();
    await dispatch(logoutThunk());
    navigate('/login');
  };

  const submitMutation = useMutation({
    mutationFn: () =>
      instructorApplicationService.submitApplication({
        qualification,
        specialization,
        experienceYears,
        portfolioUrl: portfolioUrl || undefined,
        bio,
      }),
    onSuccess: () => {
      toast.success('Instructor application submitted for Admin review!');
      queryClient.invalidateQueries({ queryKey: ['myInstructorApplication'] });
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to submit application');
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative space-y-5 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <span>🎓</span> Become an Instructor
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Submit your credentials for Admin review to publish courses.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-lg font-bold p-1 transition"
          >
            &times;
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto" />
            <p className="text-xs text-gray-400">Checking application status...</p>
          </div>
        ) : myApp && myApp.status === 'APPROVED' ? (
          /* Approved Application View */
          <div className="space-y-4 py-4 text-center">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
              🎉
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Instructor Application Approved!</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                Your application to become an instructor has been approved. Please log out and log back in using your existing email and password to activate your Instructor Dashboard.
              </p>
            </div>
            <button
              onClick={handleLogoutAndLogin}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
            >
              Log Out & Log In as Instructor
            </button>
          </div>
        ) : myApp && myApp.status === 'PENDING' ? (
          /* Pending Application View */
          <div className="space-y-4 py-4 text-center">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
              ⏳
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Application Under Admin Review</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Your application submitted on {new Date(myApp.createdAt).toLocaleDateString()} is currently pending evaluation by our platform administrators.
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl text-left text-xs space-y-2 border border-gray-100 dark:border-gray-800">
              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Specialization:</span> {myApp.specialization}</p>
              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Qualification:</span> {myApp.qualification}</p>
              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Experience:</span> {myApp.experienceYears} years</p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-white text-xs font-bold rounded-xl transition"
            >
              Close Window
            </button>
          </div>
        ) : myApp && myApp.status === 'REJECTED' ? (
          /* Rejected View */
          <div className="space-y-4 py-2">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
                <span>⚠️</span> Application Rejected
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Reason: {myApp.rejectionReason || 'Application did not meet current requirements.'}
              </p>
            </div>
            <p className="text-xs text-gray-500">You may update your details below and re-submit for review:</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitMutation.mutate();
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Qualification</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M.Sc Computer Science / Senior Tech Lead"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Specialization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fullstack React & Node.js Architecture"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Portfolio / LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Professional Bio & Teaching Intent</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your background and the software engineering subjects you intend to teach..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-60"
              >
                {submitMutation.isPending ? 'Submitting Application...' : 'Re-Submit Instructor Application'}
              </button>
            </form>
          </div>
        ) : (
          /* Application Form View */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitMutation.mutate();
            }}
            className="space-y-3.5"
          >
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Highest Qualification / Designation</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Software Architect / B.S. Software Engineering"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Primary Specialization</label>
              <input
                type="text"
                required
                placeholder="e.g. Enterprise Microservices, System Design, React"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Experience (Years)</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Portfolio / LinkedIn URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Bio & Teaching Plan</label>
              <textarea
                rows={3}
                required
                placeholder="Tell us about your technical expertise and what courses you plan to create..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-60"
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
