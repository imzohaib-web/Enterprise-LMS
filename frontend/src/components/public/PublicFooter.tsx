import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Globe, Share2, Code, Video, ArrowRight, ShieldCheck } from 'lucide-react';
import { PUBLIC } from '../../constants/routes';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="relative bg-[#06080E] text-gray-400 border-t border-white/[0.08] overflow-hidden">
      {/* Subtle background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-brand-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 via-indigo-600 to-emerald-400 text-white font-mono font-black text-xs flex items-center justify-center shadow-md">
                SF
              </div>
              <span className="font-bold text-white text-lg tracking-tight">
                SkillForge <span className="text-emerald-400 font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">LMS</span>
              </span>
            </Link>
            
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed font-normal">
              Production-grade EdTech SaaS platform empowering software engineers, cloud architects, and tech incubators with interactive labs, automated grading, and cryptographically verified credentials.
            </p>
            
            {/* Tech Newsletter Subscription Form */}
            <div className="pt-2 space-y-2">
              <h5 className="text-xs font-mono text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                Subscribe to Tech Digest
              </h5>
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 max-w-sm">
                <input
                  type="email"
                  placeholder="Enter work email..."
                  className="w-full px-3.5 py-2 text-xs bg-white/[0.04] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 backdrop-blur-md font-mono"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 text-xs font-semibold text-gray-950 bg-white hover:bg-gray-100 rounded-lg whitespace-nowrap transition-all shadow-sm flex items-center gap-1 shrink-0"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Social Icons Row */}
            <div className="pt-2 flex items-center gap-2.5">
              <a href="#website" onClick={(e) => e.preventDefault()} className="p-2 rounded-lg bg-white/[0.04] border border-white/10 hover:border-white/25 text-gray-400 hover:text-white transition-colors" aria-label="Website">
                <Globe className="w-3.5 h-3.5" />
              </a>
              <a href="#share" onClick={(e) => e.preventDefault()} className="p-2 rounded-lg bg-white/[0.04] border border-white/10 hover:border-white/25 text-gray-400 hover:text-white transition-colors" aria-label="Share">
                <Share2 className="w-3.5 h-3.5" />
              </a>
              <a href="#code" onClick={(e) => e.preventDefault()} className="p-2 rounded-lg bg-white/[0.04] border border-white/10 hover:border-white/25 text-gray-400 hover:text-white transition-colors" aria-label="Code Repository">
                <Code className="w-3.5 h-3.5" />
              </a>
              <a href="#media" onClick={(e) => e.preventDefault()} className="p-2 rounded-lg bg-white/[0.04] border border-white/10 hover:border-white/25 text-gray-400 hover:text-white transition-colors" aria-label="Media Channel">
                <Video className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Col 1: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to={PUBLIC.COURSES} className="hover:text-white transition-colors">
                  Course Catalog
                </Link>
              </li>
              <li>
                <a href="#paths" className="hover:text-white transition-colors">
                  Career Roadmaps
                </a>
              </li>
              <li>
                <Link to={PUBLIC.VERIFY} className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verify Credential</span>
                </Link>
              </li>
              <li>
                <Link to={PUBLIC.COURSES} className="hover:text-white transition-colors">
                  Interactive Labs
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Top Tracks */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">Top Tracks</h4>
            <ul className="space-y-2 text-xs">
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
                  Machine Learning & AI Ops
                </Link>
              </li>
              <li>
                <Link to={PUBLIC.COURSES} className="hover:text-white transition-colors">
                  Cloud Native DevOps
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">Support & Legal</h4>
            <ul className="space-y-2 text-xs">
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

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-14 pt-6 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-mono text-gray-500">
          <p>© {new Date().getFullYear()} SkillForge Enterprise LMS. All rights reserved.</p>
          <div className="flex items-center gap-5">
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
