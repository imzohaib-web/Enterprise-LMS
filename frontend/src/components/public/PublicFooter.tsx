import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Globe, Share2, Code, Video, ArrowRight } from 'lucide-react';
import { PUBLIC } from '../../constants/routes';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="relative bg-[#060911] text-gray-400 border-t border-white/10 overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[250px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-black text-lg flex items-center justify-center shadow-[0_0_15px_rgba(70,95,255,0.4)] group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="font-extrabold text-white text-xl tracking-tight">
                Enterprise LMS
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-gray-400 max-w-sm leading-relaxed">
              Empowering developers, career switchers, and tech incubators with production-grade learning paths, interactive quizzes, and verified credentials.
            </p>
            
            {/* Newsletter form */}
            <div className="pt-2 space-y-2">
              <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-400" />
                Subscribe to Tech Updates
              </h5>
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 max-w-sm">
                <input
                  type="email"
                  placeholder="Enter work email..."
                  className="w-full px-4 py-2.5 text-xs bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 backdrop-blur-md"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 rounded-xl whitespace-nowrap transition-all shadow-xs flex items-center gap-1 hover:opacity-90"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Social Icons Row */}
            <div className="pt-3 flex items-center gap-3">
              <a href="#website" onClick={(e) => e.preventDefault()} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-brand-500/40 text-gray-400 hover:text-white transition-colors" aria-label="Website">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#share" onClick={(e) => e.preventDefault()} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-brand-500/40 text-gray-400 hover:text-white transition-colors" aria-label="Share">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#code" onClick={(e) => e.preventDefault()} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-brand-500/40 text-gray-400 hover:text-white transition-colors" aria-label="Code Repository">
                <Code className="w-4 h-4" />
              </a>
              <a href="#media" onClick={(e) => e.preventDefault()} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-brand-500/40 text-gray-400 hover:text-white transition-colors" aria-label="Media Channel">
                <Video className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 1: Platform */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to={PUBLIC.ABOUT} className="hover:text-white transition-colors">
                  About Incubator
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

          {/* Col 2: Top Tracks */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Top Tracks</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link to={PUBLIC.COURSES} className="hover:text-white transition-colors">
                  React 19 Architecture
                </Link>
              </li>
              <li>
                <Link to={PUBLIC.COURSES} className="hover:text-white transition-colors">
                  Node.js Microservices
                </Link>
              </li>
              <li>
                <Link to={PUBLIC.COURSES} className="hover:text-white transition-colors">
                  Machine Learning & AI
                </Link>
              </li>
              <li>
                <Link to={PUBLIC.COURSES} className="hover:text-white transition-colors">
                  DevOps & Kubernetes
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Support & Legal</h4>
            <ul className="space-y-2.5 text-xs">
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
                  Instructor Sign In
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Enterprise LMS Inc. Inspired by Coursera, Ezitech & Sheryians.</p>
          <div className="flex items-center gap-6">
            <Link to={PUBLIC.PRIVACY} className="hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <Link to={PUBLIC.TERMS} className="hover:text-gray-300 transition-colors">
              Terms
            </Link>
            <Link to={PUBLIC.CONTACT} className="hover:text-gray-300 transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
