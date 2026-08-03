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
              to="/admin/users"
              onItemClick={closeDropdown}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Manage Profile
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
