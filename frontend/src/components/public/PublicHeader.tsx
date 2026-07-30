import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { ThemeToggleButton } from '../common/ThemeToggleButton';
import { PUBLIC } from '../../constants/routes';

export const PublicHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: PUBLIC.HOME },
    { name: 'Courses', path: PUBLIC.COURSES },
    { name: 'About', path: PUBLIC.ABOUT },
    { name: 'Verify Certificate', path: PUBLIC.VERIFY },
    { name: 'Contact', path: PUBLIC.CONTACT },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#090D16]/85 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/40 py-0'
          : 'bg-transparent border-b border-transparent py-1'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 text-white shadow-[0_0_20px_rgba(70,95,255,0.4)]"
            >
              <GraduationCap className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
              <div className="absolute inset-0 rounded-2xl bg-brand-400 blur-md opacity-40 group-hover:opacity-80 transition-opacity" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-xl tracking-tight leading-none group-hover:text-brand-300 transition-colors">
                Enterprise LMS
              </span>
              <span className="text-[10px] font-bold text-brand-400 tracking-widest uppercase mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Incubator & Academy
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-sm font-semibold transition-all py-1.5 ${
                    active
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.name}
                  {active && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 via-indigo-400 to-purple-400 rounded-full shadow-[0_0_10px_rgba(70,95,255,0.8)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggleButton />
            <Link
              to={PUBLIC.LOGIN}
              className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                to={PUBLIC.REGISTER}
                className="group relative inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl overflow-hidden transition-all shadow-[0_0_20px_rgba(70,95,255,0.35)] hover:shadow-[0_0_35px_rgba(70,95,255,0.7)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 group-hover:scale-105 transition-transform" />
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggleButton />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden border-b border-white/10 bg-[#090D16]/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-4 shadow-2xl"
        >
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                  isActive(link.path)
                    ? 'bg-brand-500/20 text-white border border-brand-500/40'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <Link
              to={PUBLIC.LOGIN}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-semibold text-gray-200 border border-white/10 rounded-xl bg-white/5"
            >
              Sign In
            </Link>
            <Link
              to={PUBLIC.REGISTER}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 rounded-xl"
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default PublicHeader;
