import React, { useCallback, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useSidebar } from "../context/SidebarContext";
import { STUDENT, INSTRUCTOR, ADMIN, COURSES, LEARNING_PATHS, ASSESSMENTS, CERTIFICATES, DISCUSSIONS, AUTH } from "../constants/routes";
import { selectCurrentUser, logoutThunk } from "../features/auth/authSlice";
import type { AppDispatch } from "../app/store";

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
  GroupIcon,
  DocsIcon,
  PlugInIcon,
  HorizontaLDots,
} from "../icons";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

// ── Enterprise Admin Modules (6 Logical Groups) ──────────────────────────────
const enterpriseAdminGroups: NavGroup[] = [
  {
    title: "Dashboard",
    items: [
      { name: "Overview", icon: <GridIcon />, path: ADMIN.DASHBOARD },
      { name: "Platform Analytics", icon: <PieChartIcon />, path: ADMIN.ANALYTICS },
    ],
  },
  {
    title: "User Management",
    items: [
      { name: "User Directory", icon: <UserCircleIcon />, path: ADMIN.USERS },
      { name: "Student Roster", icon: <GroupIcon />, path: INSTRUCTOR.STUDENTS },
    ],
  },
  {
    title: "Course Management",
    items: [
      { name: "Course Catalog", icon: <ListIcon />, path: COURSES.LIST },
      { name: "Create Course", icon: <PageIcon />, path: COURSES.NEW, badge: "New" },
    ],
  },
  {
    title: "Learning Management",
    items: [
      { name: "Learning Paths", icon: <ShootingStarIcon />, path: LEARNING_PATHS.LIST },
      { name: "Assessments & Quizzes", icon: <TaskIcon />, path: ASSESSMENTS },
      { name: "Certificates", icon: <ShootingStarIcon />, path: CERTIFICATES },
      { name: "Discussions Forum", icon: <ChatIcon />, path: DISCUSSIONS },
    ],
  },
  {
    title: "Reports & Analytics",
    items: [
      { name: "Data Exporter", icon: <DocsIcon />, path: ADMIN.REPORTS },
      { name: "Performance & Stats", icon: <PieChartIcon />, path: INSTRUCTOR.STATISTICS },
    ],
  },
  {
    title: "Platform Management",
    items: [
      { name: "System Settings", icon: <PlugInIcon />, path: ADMIN.SETTINGS },
      { name: "Audit Logs & Security", icon: <TaskIcon />, path: ADMIN.AUDIT_LOGS },
      { name: "System Notifications", icon: <MailIcon />, path: ADMIN.NOTIFICATIONS },
      { name: "Admin Profile", icon: <UserCircleIcon />, path: ADMIN.PROFILE },
    ],
  },
];

// ── Student Portal Navigation ────────────────────────────────────────────────
const studentNavItems: NavItem[] = [
  { name: "Dashboard", icon: <GridIcon />, path: STUDENT.DASHBOARD },
  { name: "My Courses", icon: <ListIcon />, path: STUDENT.COURSES },
  { name: "Learning Paths", icon: <ShootingStarIcon />, path: STUDENT.LEARNING_PATHS },
  { name: "Progress", icon: <PieChartIcon />, path: STUDENT.PROGRESS },
  { name: "Certificates", icon: <ShootingStarIcon />, path: STUDENT.CERTIFICATES },
  { name: "Discussions", icon: <ChatIcon />, path: STUDENT.DISCUSSIONS },
  { name: "Notifications", icon: <MailIcon />, path: STUDENT.NOTIFICATIONS },
  { name: "Profile", icon: <UserCircleIcon />, path: STUDENT.PROFILE },
  { name: "Settings", icon: <PlugInIcon />, path: STUDENT.SETTINGS },
];

// ── Instructor Portal Navigation ─────────────────────────────────────────────
const instructorNavItems: NavItem[] = [
  { name: "Dashboard", icon: <GridIcon />, path: INSTRUCTOR.DASHBOARD },
  { name: "Courses", icon: <ListIcon />, path: INSTRUCTOR.COURSES },
  { name: "Learning Paths", icon: <ShootingStarIcon />, path: INSTRUCTOR.LEARNING_PATHS },
  { name: "Students", icon: <GroupIcon />, path: INSTRUCTOR.STUDENTS },
  { name: "Assessments", icon: <TaskIcon />, path: INSTRUCTOR.ASSESSMENTS },
  { name: "Assignments", icon: <DocsIcon />, path: INSTRUCTOR.ASSIGNMENTS },
  { name: "Analytics & Stats", icon: <PieChartIcon />, path: INSTRUCTOR.ANALYTICS },
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

  const isAdminRole = currentUser?.role === "admin";
  const isInstructorRole = currentUser?.role === "instructor";

  const [viewMode, setViewMode] = useState<"admin" | "student" | "instructor">(
    isAdminRole ? "admin" : isInstructorRole ? "instructor" : "student"
  );

  React.useEffect(() => {
    if (location.pathname.startsWith('/student')) {
      setViewMode('student');
    } else if (location.pathname.startsWith('/instructor')) {
      setViewMode('instructor');
    } else if (location.pathname.startsWith('/admin') && isAdminRole) {
      setViewMode('admin');
    }
  }, [location.pathname, isAdminRole]);

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
      className={`mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex ${
        !isExpanded && !isHovered ? "lg:justify-center" : "justify-start px-2"
      }`}
    >
      {isExpanded || isHovered || isMobileOpen ? (
        title
      ) : (
        <HorizontaLDots className="size-4" />
      )}
    </h2>
  );

  const renderNavList = (items: NavItem[]) => (
    <ul className="flex flex-col gap-1">
      {items.map((nav) => {
        const active = isActive(nav.path);
        return (
          <li key={`${nav.path}-${nav.name}`}>
            <Link
              to={nav.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                active
                  ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
              } ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
            >
              <span className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"}`}>
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate">{nav.name}</span>
                  {nav.badge && (
                    <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {nav.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-3 left-0 bg-white dark:bg-gray-900 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 dark:border-gray-800 
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
      {/* Brand Logo & Title */}
      <div
        className={`py-5 flex items-center border-b border-gray-100 dark:border-gray-800/60 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start px-2"
        }`}
      >
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-500/20">
            LMS
          </div>
          {(isExpanded || isHovered || isMobileOpen) && (
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-base leading-tight block">Enterprise LMS</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
                {isAdminRole ? "Admin Console" : isInstructorRole ? "Instructor Portal" : "Student Portal"}
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Role Workspace Switcher (Visible to Admins & Approved Instructors) */}
      {(isAdminRole || isInstructorRole) && (isExpanded || isHovered || isMobileOpen) && (
        <div className="pt-3 px-1">
          <div className="p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl flex gap-1">
            {isAdminRole && (
              <button
                onClick={() => { setViewMode("admin"); navigate(ADMIN.DASHBOARD); }}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition ${
                  viewMode === "admin"
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                }`}
              >
                Admin
              </button>
            )}
            <button
              onClick={() => { setViewMode("instructor"); navigate(INSTRUCTOR.DASHBOARD); }}
              className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition ${
                viewMode === "instructor"
                  ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
              }`}
            >
              Instructor
            </button>
            <button
              onClick={() => { setViewMode("student"); navigate(STUDENT.DASHBOARD); }}
              className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition ${
                viewMode === "student"
                  ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
              }`}
            >
              Student
            </button>
          </div>
        </div>
      )}

      {/* Navigation Groups */}
      <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar py-4 pb-10">
        <nav className="space-y-5">
          {viewMode === "admin" && isAdminRole ? (
            enterpriseAdminGroups.map((group) => (
              <div key={group.title}>
                {renderSectionHeader(group.title)}
                {renderNavList(group.items)}
              </div>
            ))
          ) : viewMode === "instructor" ? (
            <div>
              {renderSectionHeader("Instructor Workspace")}
              {renderNavList(instructorNavItems)}
            </div>
          ) : (
            <div>
              {renderSectionHeader("Student Workspace")}
              {renderNavList(studentNavItems)}
            </div>
          )}
        </nav>

        {/* User Info / Logout at bottom */}
        {(isExpanded || isHovered || isMobileOpen) && currentUser && (
          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-xs">
                  {currentUser.firstName ? currentUser.firstName[0] : "U"}
                  {currentUser.lastName ? currentUser.lastName[0] : ""}
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

