import { useInstructorProfile } from "../../features/instructor-dashboard/hooks/useInstructorDashboard";

export default function UserInfoCard() {
  const { data: profile } = useInstructorProfile();

  const name = profile?.name || 'Dr. Sarah Jenkins';
  const email = profile?.email || 'instructor@lms.com';
  const phone = profile?.phone || '+1 (555) 234-5678';
  const department = profile?.department || 'Computer Science';
  const qualification = profile?.qualification || 'Ph.D. in Computer Science';
  const specialization = profile?.specialization || 'Distributed Systems';
  const bio = profile?.bio || 'Senior LMS Architect & Educator';

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white lg:mb-6">
            Personal & Academic Information
          </h4>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            <div>
              <p className="mb-1 text-xs text-gray-400">Full Name</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{name}</p>
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-400">Email Address</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{email}</p>
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-400">Phone</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{phone}</p>
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-400">Department</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{department}</p>
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-400">Qualification</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{qualification}</p>
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-400">Specialization</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{specialization}</p>
            </div>

            <div className="col-span-full">
              <p className="mb-1 text-xs text-gray-400">Professional Bio</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{bio}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
