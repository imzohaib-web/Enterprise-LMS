import React, { useCallback, useEffect, useRef, useState } from "react";
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
  ChevronDownIcon,
  HorizontaLDots,
} from "../icons";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
};

// ── Core Platform (Engineer 1) ──────────────────────────────────────────────
const adminNavItems: NavItem[] = [
  {
    name: "Admin Dashboard",
    icon: <GridIcon />,
    path: ADMIN.DASHBOARD,
  },
  {
    name: "Users Management",
    icon: <UserCircleIcon />,
    path: ADMIN.USERS,
  },
  {
    name: "Reports & Analytics",
    icon: <PieChartIcon />,
    path: ADMIN.REPORTS,
  },
];

// ── Content Management (Engineer 1) ─────────────────────────────────────────
const contentNavItems: NavItem[] = [
  {
    name: "Courses",
    icon: <PageIcon />,
    path: COURSES.LIST,
  },
  {
    name: "Learning Paths",
    icon: <ShootingStarIcon />,
    path: LEARNING_PATHS.LIST,
  },
];

// ── Student Portal (Engineer 2) ─────────────────────────────────────────────
const studentNavItems: NavItem[] = [
  {
    name: "Student Dashboard",
    icon: <GridIcon />,
    path: STUDENT.DASHBOARD,
  },
  {
    name: "Assessments",
    icon: <TaskIcon />,
    path: STUDENT.ASSESSMENTS,
  },
  {
    name: "Progress",
    icon: <PieChartIcon />,
    path: STUDENT.PROGRESS,
  },
  {
    name: "Certificates",
    icon: <ShootingStarIcon />,
    path: STUDENT.CERTIFICATES,
  },
  {
    name: "Discussions",
    icon: <ChatIcon />,
    path: STUDENT.DISCUSSIONS,
  },
  {
    name: "Notifications",
    icon: <MailIcon />,
    path: STUDENT.NOTIFICATIONS,
  },
];

// ── Instructor Portal (Engineer 2) ──────────────────────────────────────────
const instructorNavItems: NavItem[] = [
  {
    name: "Instructor Dashboard",
    icon: <GridIcon />,
    path: INSTRUCTOR.DASHBOARD,
  },
  {
    name: "Assessments",
    icon: <TaskIcon />,
    path: INSTRUCTOR.ASSESSMENTS,
  },
  {
    name: "Discussions",
    icon: <ChatIcon />,
    path: INSTRUCTOR.DISCUSSIONS,
  },
  {
    name: "Notifications",
    icon: <MailIcon />,
    path: INSTRUCTOR.NOTIFICATIONS,
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector(selectCurrentUser);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: string;
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  const renderMenuItems = (items: NavItem[], menuType: string) => (
    <ul className="flex flex-col gap-1.5">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => {
                setOpenSubmenu((prev) =>
                  prev?.type === menuType && prev?.index === index
                    ? null
                    : { type: menuType, index }
                );
              }}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center">{nav.icon}</span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text text-sm font-medium">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-4 h-4 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "rotate-180 text-indigo-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive(nav.path)
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center">{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="truncate">{nav.name}</span>
                )}
              </Link>
            )
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-4 left-0 bg-white dark:bg-gray-900 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-100 dark:border-gray-800 
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
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
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
      <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar py-2">
        <nav className="space-y-6">
          {/* Admin Section */}
          {(!currentUser || currentUser.role === 'admin') && (
            <div>
              {renderSectionHeader("Core Admin")}
              {renderMenuItems(adminNavItems, "admin")}
            </div>
          )}

          {/* Courses & Learning Paths */}
          <div>
            {renderSectionHeader("Content Management")}
            {renderMenuItems(contentNavItems, "content")}
          </div>

          {/* Student Section */}
          {(!currentUser || currentUser.role === 'student' || currentUser.role === 'admin') && (
            <div>
              {renderSectionHeader("Student Portal")}
              {renderMenuItems(studentNavItems, "student")}
            </div>
          )}

          {/* Instructor Section */}
          {(!currentUser || currentUser.role === 'instructor' || currentUser.role === 'admin') && (
            <div>
              {renderSectionHeader("Instructor Portal")}
              {renderMenuItems(instructorNavItems, "instructor")}
            </div>
          )}
        </nav>

        {/* User Info / Logout at bottom */}
        {(isExpanded || isHovered || isMobileOpen) && currentUser && (
          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{currentUser.firstName} {currentUser.lastName}</p>
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
