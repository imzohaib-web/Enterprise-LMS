import React, { useState, useEffect } from 'react';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useInstructorProfile, useUpdateInstructorProfile } from "../../features/instructor-dashboard/hooks/useInstructorDashboard";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { data: profile } = useInstructorProfile();
  const updateProfileMutation = useUpdateInstructorProfile();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || 'Dr. Sarah Jenkins');
      setDepartment(profile.department || 'Computer Science & Software Engineering');
      setBio(profile.bio || 'Senior LMS Educator and System Architect.');
      setEmail(profile.email || 'instructor@lms.com');
      setPhone(profile.phone || '+1 (555) 234-5678');
      setLinkedin(profile.socialLinks?.linkedin || 'https://linkedin.com');
      setGithub(profile.socialLinks?.github || 'https://github.com');
    }
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(
      {
        name,
        department,
        bio,
        email,
        phone,
        socialLinks: { linkedin, github },
      },
      {
        onSuccess: () => {
          closeModal();
        },
      }
    );
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 shadow-sm">
              <img src={profile?.avatar || "/images/user/owner.jpg"} alt={name} className="w-full h-full object-cover" />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-1 text-xl font-bold text-center text-gray-900 dark:text-white xl:text-left">
                {name}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
                  {department}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Senior Enterprise LMS Instructor
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 lg:w-auto cursor-pointer"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[650px] m-4">
        <div className="no-scrollbar relative w-full max-w-[650px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="pr-10 mb-4">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Instructor Profile
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Update your department, bio, and contact details stored in MongoDB.
            </p>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
              <div>
                <Label>Full Name</Label>
                <Input type="text" value={name} onChange={(e: any) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Department / Role</Label>
                <Input type="text" value={department} onChange={(e: any) => setDepartment(e.target.value)} />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input type="text" value={phone} onChange={(e: any) => setPhone(e.target.value)} />
              </div>
              <div>
                <Label>Professional Bio</Label>
                <Input type="text" value={bio} onChange={(e: any) => setBio(e.target.value)} />
              </div>
              <div>
                <Label>LinkedIn Profile</Label>
                <Input type="text" value={linkedin} onChange={(e: any) => setLinkedin(e.target.value)} />
              </div>
              <div>
                <Label>GitHub Profile</Label>
                <Input type="text" value={github} onChange={(e: any) => setGithub(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-3 justify-end border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
