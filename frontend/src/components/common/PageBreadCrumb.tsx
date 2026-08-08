import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageBreadcrumbProps {
  pageTitle: string;
  customCrumbs?: BreadcrumbItem[];
}

const ROUTE_LABELS: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  users: 'User Management',
  courses: 'Course Catalog',
  reports: 'Reports & Analytics',
  analytics: 'Platform Analytics',
  notifications: 'Notifications',
  profile: 'Profile',
  'learning-paths': 'Learning Paths',
  assessments: 'Assessments',
  certificates: 'Certificates',
  discussions: 'Discussions',
  student: 'Student Portal',
  instructor: 'Instructor Portal',
};

const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({ pageTitle, customCrumbs }) => {
  const location = useLocation();

  const generateCrumbs = (): BreadcrumbItem[] => {
    if (customCrumbs && customCrumbs.length > 0) {
      return customCrumbs;
    }

    const segments = location.pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [];
    let currentPath = '';

    segments.forEach((seg, idx) => {
      currentPath += `/${seg}`;
      const isLast = idx === segments.length - 1;
      const label = ROUTE_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
      items.push({
        label: isLast ? pageTitle || label : label,
        path: isLast ? undefined : currentPath,
      });
    });

    return items;
  };

  const crumbs = generateCrumbs();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {pageTitle}
        </h1>
      </div>
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-xs sm:text-sm">
          <li>
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 font-medium transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
          </li>
          {crumbs.map((crumb, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {crumb.path ? (
                <Link
                  to={crumb.path}
                  className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 font-medium transition"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-semibold text-gray-900 dark:text-white">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;

