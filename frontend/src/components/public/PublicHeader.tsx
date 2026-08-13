import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Menu, X, ArrowRight } from 'lucide-react';
import { PUBLIC } from '../../constants/routes';

export const PublicHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === PUBLIC.HOME && location.pathname === PUBLIC.HOME && !location.hash) return true;
    if (path !== PUBLIC.HOME && location.pathname.startsWith(path) && path !== `${PUBLIC.HOME}#paths`) return true;
    if (path === `${PUBLIC.HOME}#paths` && location.hash === '#paths') return true;
    return false;
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: PUBLIC.HOME },
    { name: 'Courses', path: PUBLIC.COURSES },
    { name: 'Learning Paths', path: `${PUBLIC.HOME}#paths` },
    { name: 'Verify Certificate', path: PUBLIC.VERIFY },
    { name: 'About', path: PUBLIC.ABOUT },
    { name: 'Contact', path: PUBLIC.CONTACT },
  ];

  return (
    <motion.header
      initial={{ y: -15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0B0E17]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.5)] py-3'
          : 'bg-transparent border-b border-white/[0.04] py-4.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Distinctive Brand Identity */}
          <Link to={PUBLIC.HOME} className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.04] border border-white/15 group-hover:border-brand-500/50 transition-colors shadow-sm">
              <GraduationCap className="w-4.5 h-4.5 text-white group-hover:text-brand-400 transition-colors" />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-tight leading-none">
                SkillForge
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase tracking-wide">
                LMS
              </span>
            </div>
          </Link>

          {/* Minimalist Navigation Bar */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.02] border border-white/[0.08] px-3 py-1 rounded-full backdrop-blur-xl">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    active ? 'text-white font-semibold' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {link.name}
                  {active && (
                    <motion.div
                      layoutId="headerActiveIndicator"
                      className="absolute inset-0 bg-white/[0.08] border border-white/10 rounded-full z-[-1]"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Restrained Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to={PUBLIC.LOGIN}
              className="px-3.5 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to={PUBLIC.REGISTER}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-white/[0.06] hover:bg-white/10 border border-white/15 hover:border-white/30 rounded-lg backdrop-blur-xl transition-all shadow-sm group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white focus:outline-none rounded-lg bg-white/[0.04] border border-white/10"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="lg:hidden border-b border-white/10 bg-[#0B0E17]/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-4 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-white/[0.08] text-white border border-white/10'
                      : 'text-gray-300 hover:bg-white/[0.04]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <Link
                to={PUBLIC.LOGIN}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold text-gray-300 border border-white/10 rounded-lg bg-white/[0.04]"
              >
                Sign In
              </Link>
              <Link
                to={PUBLIC.REGISTER}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-bold text-white bg-brand-600 rounded-lg shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default PublicHeader;
