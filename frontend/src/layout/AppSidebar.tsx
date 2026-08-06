import React, { useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useSidebar } from "../context/SidebarContext";
import { STUDENT, INSTRUCTOR, ADMIN, COURSES, LEARNING_PATHS, AUTH } from "../constants/routes";
import { selectCurrentUser, logoutThunk } from "../features/auth/authSlice";
import type { AppDispatch } from "../app/store";

// ── Icons ──────────────────────────────────────────────────────────────────
import {
  GridIcon,
  PageIcon,
  UserCircleIcon,
  PieChartIcon,
  ShootingStarIcon,
  TaskIcon,
  ChatIcon,
  MailIcon,
  ListIcon,
  BoxIconLine,
  GroupIcon,
  DocsIcon,
  PlugInIcon,
  HorizontaLDots,
} from "../icons";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

// ── Core Admin ─────────────────────────────────────────────────────────────
const adminNavItems: NavItem[] = [
  { name: "Admin Dashboard", icon: <GridIcon />, path: ADMIN.DASHBOARD },
  { name: "Users Management", icon: <UserCircleIcon />, path: ADMIN.USERS },
  { name: "Courses Overview", icon: <ListIcon />, path: ADMIN.COURSES },
  { name: "Reports & Analytics", icon: <DocsIcon />, path: ADMIN.REPORTS },
  { name: "Analytics", icon: <PieChartIcon />, path: ADMIN.ANALYTICS },
  { name: "Notifications", icon: <MailIcon />, path: ADMIN.NOTIFICATIONS },
  { name: "Profile", icon: <UserCircleIcon />, path: ADMIN.PROFILE },
];

// ── Content Management ────────────────────────────────────────────────────
const contentNavItems: NavItem[] = [
  { name: "Courses Catalog", icon: <PageIcon />, path: COURSES.LIST },
  { name: "Learning Paths", icon: <ShootingStarIcon />, path: LEARNING_PATHS.LIST },
];

// ── Student Portal ────────────────────────────────────────────────────────
const studentNavItems: NavItem[] = [
  { name: "Dashboard", icon: <GridIcon />, path: STUDENT.DASHBOARD },
  { name: "My Courses", icon: <ListIcon />, path: STUDENT.COURSES },
  { name: "Learning Paths", icon: <BoxIconLine />, path: STUDENT.LEARNING_PATHS },
  { name: "Assessments", icon: <TaskIcon />, path: STUDENT.ASSESSMENTS },
  { name: "Progress", icon: <PieChartIcon />, path: STUDENT.PROGRESS },
  { name: "Certificates", icon: <ShootingStarIcon />, path: STUDENT.CERTIFICATES },
  { name: "Discussions", icon: <ChatIcon />, path: STUDENT.DISCUSSIONS },
  { name: "Notifications", icon: <MailIcon />, path: STUDENT.NOTIFICATIONS },
  { name: "Profile", icon: <UserCircleIcon />, path: STUDENT.PROFILE },
  { name: "Settings", icon: <PlugInIcon />, path: STUDENT.SETTINGS },
];

// ── Instructor Portal ─────────────────────────────────────────────────────
const instructorNavItems: NavItem[] = [
  { name: "Dashboard", icon: <GridIcon />, path: INSTRUCTOR.DASHBOARD },
  { name: "Courses", icon: <ListIcon />, path: INSTRUCTOR.COURSES },
  { name: "Students", icon: <GroupIcon />, path: INSTRUCTOR.STUDENTS },
  { name: "Assessments", icon: <TaskIcon />, path: INSTRUCTOR.ASSESSMENTS },
  { name: "Analytics", icon: <PieChartIcon />, path: INSTRUCTOR.ANALYTICS },
  { name: "Certificates", icon: <ShootingStarIcon />, path: INSTRUCTOR.CERTIFICATES },
  { name: "Discussions", icon: <ChatIcon />, path: INSTRUCTOR.DISCUSSIONS },
  { name: "Notifications", icon: <MailIcon />, path: INSTRUCTOR.NOTIFICATIONS },
  { name: "Profile", icon: <UserCircleIcon />, path: INSTRUCTOR.PROFILE },
  { name: "Settings", icon: <PlugInIcon />, path: INSTRUCTOR.SETTINGS },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector(selectCurrentUser);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate(AUTH.SIGN_IN);
  };

  const renderSectionHeader = (title: string) => (
    <h2
      className={`mb-3 text-xs font-semibold uppercase flex leading-[20px] tracking-wider text-gray-400 dark:text-gray-500 ${
        !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
      }`}
    >
      {isExpanded || isHovered || isMobileOpen ? (
        title
      ) : (
        <HorizontaLDots className="size-5" />
      )}
    </h2>
  );

  const renderNavList = (items: NavItem[]) => (
    <ul className="flex flex-col gap-1.5">
      {items.map((nav) => (
        <li key={`${nav.path}-${nav.name}`}>
          <Link
            to={nav.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              isActive(nav.path)
                ? "bg-brand-50 dark:bg-brand-500/[0.12] text-brand-500 dark:text-brand-400 font-semibold"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
            } ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
          >
            <span className="w-5 h-5 flex items-center justify-center">{nav.icon}</span>
            {(isExpanded || isHovered || isMobileOpen) && (
              <span className="truncate">{nav.name}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-4 left-0 bg-white dark:bg-gray-900 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 dark:border-gray-800 
        ${
          isExpanded || isMobileOpen
            ? "w-[270px]"
            : isHovered
            ? "w-[270px]"
            : "w-[85px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Brand Logo */}
      <div
        className={`py-6 flex items-center ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start px-2"
        }`}
      >
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            LMS
          </div>
          {(isExpanded || isHovered || isMobileOpen) && (
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-base leading-none block">Enterprise LMS</span>
              <span className="text-[11px] text-gray-400 font-medium">Core Platform</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar py-2 pb-10">
        <nav className="space-y-6">
          {/* Admin Section */}
          {(!currentUser || currentUser.role === 'admin') && (
            <div>
              {renderSectionHeader("Core Admin")}
              {renderNavList(adminNavItems)}
            </div>
          )}

          {/* Courses & Learning Paths */}
          <div>
            {renderSectionHeader("Content Management")}
            {renderNavList(contentNavItems)}
          </div>

          {/* Student Section */}
          {(!currentUser || currentUser.role === 'student' || currentUser.role === 'admin') && (
            <div>
              {renderSectionHeader("Student Portal")}
              {renderNavList(studentNavItems)}
            </div>
          )}

          {/* Instructor Section */}
          {(!currentUser || currentUser.role === 'instructor' || currentUser.role === 'admin') && (
            <div>
              {renderSectionHeader("Instructor Portal")}
              {renderNavList(instructorNavItems)}
            </div>
          )}
        </nav>

        {/* User Info / Logout at bottom */}
        {(isExpanded || isHovered || isMobileOpen) && currentUser && (
          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {currentUser.firstName ? currentUser.firstName[0] : 'U'}
                  {currentUser.lastName ? currentUser.lastName[0] : ''}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                    {currentUser.firstName} {currentUser.lastName}
                  </p>
                  <p className="text-[10px] text-indigo-500 capitalize font-medium">{currentUser.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
