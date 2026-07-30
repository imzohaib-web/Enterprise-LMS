import React, { useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  GridIcon,
  TaskIcon,
  PieChartIcon,
  ShootingStarIcon,
  ChatIcon,
  MailIcon,
  UserCircleIcon,
  PlugInIcon,
  ListIcon,
  BoxIconLine,
  GroupIcon,
  DocsIcon,
  HorizontaLDots,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { STUDENT, INSTRUCTOR, ADMIN } from "../constants/routes";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

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

const instructorNavItems: NavItem[] = [
  { name: "Dashboard", icon: <GridIcon />, path: INSTRUCTOR.DASHBOARD },
  { name: "Courses", icon: <ListIcon />, path: INSTRUCTOR.COURSES },
  { name: "Students", icon: <GroupIcon />, path: INSTRUCTOR.STUDENTS },
  { name: "Assessments", icon: <TaskIcon />, path: INSTRUCTOR.ASSESSMENTS },
  { name: "Certificates", icon: <ShootingStarIcon />, path: INSTRUCTOR.CERTIFICATES },
  { name: "Discussions", icon: <ChatIcon />, path: INSTRUCTOR.DISCUSSIONS },
  { name: "Notifications", icon: <MailIcon />, path: INSTRUCTOR.NOTIFICATIONS },
  { name: "Profile", icon: <UserCircleIcon />, path: INSTRUCTOR.PROFILE },
];

const adminNavItems: NavItem[] = [
  { name: "Dashboard", icon: <GridIcon />, path: ADMIN.DASHBOARD },
  { name: "Users", icon: <GroupIcon />, path: ADMIN.USERS },
  { name: "Courses", icon: <ListIcon />, path: ADMIN.COURSES },
  { name: "Reports", icon: <DocsIcon />, path: ADMIN.REPORTS },
  { name: "Analytics", icon: <PieChartIcon />, path: ADMIN.ANALYTICS },
  { name: "Notifications", icon: <MailIcon />, path: ADMIN.NOTIFICATIONS },
  { name: "Profile", icon: <UserCircleIcon />, path: ADMIN.PROFILE },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const renderNavList = (items: NavItem[]) => (
    <ul className="flex flex-col gap-2">
      {items.map((nav) => (
        <li key={`${nav.path}-${nav.name}`}>
          <Link
            to={nav.path}
            className={`menu-item group ${
              isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
            }`}
          >
            <span
              className={`menu-item-icon-size ${
                isActive(nav.path)
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
              }`}
            >
              {nav.icon}
            </span>
            {(isExpanded || isHovered || isMobileOpen) && (
              <span className="menu-item-text">{nav.name}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* LMS Logo Section */}
      <div
        className={`py-6 flex items-center ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start gap-3"
        }`}
      >
        <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-500 text-white font-black text-lg shadow-sm">
            LMS
          </div>
          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                Enterprise LMS
              </span>
              <span className="text-2xs text-gray-400 font-medium">
                Learning Platform
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Groups */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar pb-10">
        <nav className="mb-6 space-y-6">
          {/* Student Section */}
          <div>
            <h2
              className={`mb-3 text-xs font-semibold uppercase tracking-wider flex items-center leading-[20px] text-gray-400 ${
                !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
              }`}
            >
              {isExpanded || isHovered || isMobileOpen ? (
                "Student"
              ) : (
                <HorizontaLDots className="size-5" />
              )}
            </h2>
            {renderNavList(studentNavItems)}
          </div>

          {/* Instructor Section */}
          <div>
            <h2
              className={`mb-3 text-xs font-semibold uppercase tracking-wider flex items-center leading-[20px] text-gray-400 ${
                !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
              }`}
            >
              {isExpanded || isHovered || isMobileOpen ? (
                "Instructor"
              ) : (
                <HorizontaLDots className="size-5" />
              )}
            </h2>
            {renderNavList(instructorNavItems)}
          </div>

          {/* Admin Section */}
          <div>
            <h2
              className={`mb-3 text-xs font-semibold uppercase tracking-wider flex items-center leading-[20px] text-gray-400 ${
                !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
              }`}
            >
              {isExpanded || isHovered || isMobileOpen ? (
                "Admin"
              ) : (
                <HorizontaLDots className="size-5" />
              )}
            </h2>
            {renderNavList(adminNavItems)}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
