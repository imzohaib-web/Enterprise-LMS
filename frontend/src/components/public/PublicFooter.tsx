import React from 'react';
import { Link } from 'react-router-dom';
import { PUBLIC } from '../../constants/routes';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-500 text-white font-extrabold text-lg">
                LMS
              </div>
              <span className="font-extrabold text-white text-xl tracking-tight">
                Enterprise LMS
              </span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Empowering global professionals and tech incubators with production-grade learning paths, interactive assessments, and enterprise certifications.
            </p>
            {/* Newsletter form */}
            <div className="pt-2">
              <h5 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-2">
                Subscribe to Platform Updates
              </h5>
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 max-w-sm">
                <input
                  type="email"
                  placeholder="Enter work email..."
                  className="w-full px-3.5 py-2 text-sm bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl whitespace-nowrap transition-colors"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Col 1: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={PUBLIC.ABOUT} className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to={PUBLIC.COURSES} className="hover:text-white transition-colors">
                  Course Catalog
                </Link>
              </li>
              <li>
                <Link to={PUBLIC.VERIFY} className="hover:text-white transition-colors">
                  Verify Credentials
                </Link>
              </li>
              <li>
                <Link to={PUBLIC.CONTACT} className="hover:text-white transition-colors">
                  Careers & Hiring
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Popular Courses */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Paths</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to={PUBLIC.COURSES} className="hover:text-white transition-colors">
                  Frontend Architecture
                </Link>
              </li>
              <li>
                <Link to={PUBLIC.COURSES} className="hover:text-white transition-colors">
                  Node.js Backend Systems
                </Link>
              </li>
              <li>
                <Link to={PUBLIC.COURSES} className="hover:text-white transition-colors">
                  Machine Learning & AI
                </Link>
              </li>
              <li>
                <Link to={PUBLIC.COURSES} className="hover:text-white transition-colors">
                  DevOps & Cloud Engineering
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Support & Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={PUBLIC.CONTACT} className="hover:text-white transition-colors">
                  Help Desk & Contact
                </Link>
              </li>
              <li>
                <Link to={PUBLIC.PRIVACY} className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to={PUBLIC.TERMS} className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to={PUBLIC.LOGIN} className="hover:text-white transition-colors">
                  Instructor Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Enterprise LMS Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to={PUBLIC.PRIVACY} className="hover:text-gray-400 transition-colors">
              Privacy
            </Link>
            <Link to={PUBLIC.TERMS} className="hover:text-gray-400 transition-colors">
              Terms
            </Link>
            <Link to={PUBLIC.CONTACT} className="hover:text-gray-400 transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
