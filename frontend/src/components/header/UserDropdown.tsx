import { useState } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser, logoutThunk } from "../../features/auth/authSlice";
import { AUTH } from "../../constants/routes";
import type { AppDispatch } from "../../app/store";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleSignOut = async () => {
    closeDropdown();
    await dispatch(logoutThunk());
    navigate(AUTH.SIGN_IN);
  };

  const displayName = user ? `${user.firstName} ${user.lastName}` : "Guest User";
  const email = user?.email ?? "guest@example.com";
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "U";

  const profilePath = user?.role === 'admin'
    ? '/admin/profile'
    : user?.role === 'instructor'
    ? '/instructor/profile'
    : '/student/profile';

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2.5 text-gray-700 dropdown-toggle dark:text-gray-400 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        {user?.avatar ? (
          <img src={user.avatar} alt={displayName} className="rounded-full h-9 w-9 object-cover ring-2 ring-indigo-500/20" />
        ) : (
          <span className="rounded-full h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
            {initials}
          </span>
        )}

        <span className="block font-semibold text-xs text-gray-800 dark:text-white leading-tight text-left">
          {displayName}
          <span className="block text-[10px] text-gray-400 font-normal capitalize">{user?.role ?? "Guest"}</span>
        </span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 w-4 h-4 ml-1 ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 18 20"
          fill="none"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-3 flex w-[240px] flex-col rounded-2xl border border-gray-100 bg-white p-3 shadow-xl dark:border-gray-800 dark:bg-gray-900 z-50"
      >
        <div className="pb-3 mb-2 border-b border-gray-100 dark:border-gray-800 px-1">
          <span className="block font-semibold text-sm text-gray-900 dark:text-white truncate">
            {displayName}
          </span>
          <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
            {email}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pb-2 border-b border-gray-100 dark:border-gray-800">
          <li>
            <DropdownItem
              to={profilePath}
              onItemClick={closeDropdown}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              to="/student/dashboard"
              onItemClick={closeDropdown}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
              Student Dashboard
            </DropdownItem>
          </li>
          {(user?.role === 'instructor' || user?.role === 'admin') && (
            <li>
              <DropdownItem
                to="/instructor/dashboard"
                onItemClick={closeDropdown}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-lg hover:bg-indigo-100/60 transition"
              >
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Instructor Dashboard
              </DropdownItem>
            </li>
          )}
          {user?.role === 'admin' && (
            <li>
              <DropdownItem
                to="/admin/dashboard"
                onItemClick={closeDropdown}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/30 rounded-lg hover:bg-purple-100/60 transition"
              >
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Admin Dashboard
              </DropdownItem>
            </li>
          )}
          <li>
            <DropdownItem
              to={user?.role === 'admin' ? '/admin/settings' : user?.role === 'instructor' ? '/instructor/settings' : '/student/settings'}
              onItemClick={closeDropdown}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Settings
            </DropdownItem>
          </li>
        </ul>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2 mt-2 text-xs font-medium text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left w-full"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
