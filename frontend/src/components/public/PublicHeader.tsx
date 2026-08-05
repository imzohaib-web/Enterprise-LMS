import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Menu, X, ArrowRight } from 'lucide-react';
import { PUBLIC } from '../../constants/routes';

export const PublicHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === PUBLIC.HOME && location.pathname === PUBLIC.HOME && !location.hash) return true;
    if (path !== PUBLIC.HOME && location.pathname.startsWith(path)) return true;
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
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'ds-public-header-scrolled py-0'
          : 'bg-transparent border-b border-transparent py-1'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* SkillForge Brand Logo (Handcrafted & Clean) */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-brand-600 border border-white/15 text-white flex items-center justify-center shadow-sm group-hover:border-white/30 transition-all">
              <GraduationCap className="w-5 h-5 text-white group-hover:scale-105 transition-transform" />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-lg tracking-tight leading-none group-hover:text-brand-300 transition-colors">
                SkillForge
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold text-brand-300 bg-brand-500/15 border border-brand-500/25 rounded-md uppercase tracking-wider">
                LMS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-white/[0.08]">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all rounded-md ${
                    active
                      ? 'text-white font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="relative z-10">{link.name}</span>
                  {active && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-white/[0.08] border border-white/[0.12] rounded-md shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions: Login & Register */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to={PUBLIC.LOGIN}
              className="px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-all rounded-lg hover:bg-white/[0.04]"
            >
              Login
            </Link>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to={PUBLIC.REGISTER}
                className="ds-public-btn-primary group inline-flex items-center gap-1.5 px-4.5 py-2 text-xs sm:text-sm font-semibold text-white rounded-lg transition-all"
              >
                <span>Register</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white focus:outline-none rounded-xl bg-white/[0.04] border border-white/10 active:scale-95 transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer (Premium Refined Blur) */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden border-b border-white/10 bg-gray-950/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-4 shadow-2xl"
        >
          <div className="flex flex-col space-y-1.5">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-white/[0.08] text-white border border-white/[0.12]'
                      : 'text-gray-300 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <Link
              to={PUBLIC.LOGIN}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-sm font-medium text-gray-200 border border-white/10 rounded-xl bg-white/[0.03] hover:bg-white/[0.07]"
            >
              Login
            </Link>
            <Link
              to={PUBLIC.REGISTER}
              onClick={() => setMobileMenuOpen(false)}
              className="ds-public-btn-primary w-full text-center py-2 text-sm font-semibold text-white rounded-xl shadow-md"
            >
              Register
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default PublicHeader;
