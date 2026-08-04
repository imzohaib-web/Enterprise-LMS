import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export const WhatsAppWidget: React.FC = () => {
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/?text=Hello%20SkillForge%20LMS%20Support', '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
      className="fixed bottom-6 left-6 z-50 flex items-center gap-3 cursor-pointer group"
      onClick={handleWhatsAppClick}
    >
      {/* Circular WhatsApp Pulsing Button */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 6 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)] border border-emerald-400/40"
      >
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
        <MessageCircle className="w-6 h-6 text-white relative z-10 fill-white/20" />
      </motion.div>

      {/* Translucent White Chat Pill */}
      <motion.div
        whileHover={{ x: 3 }}
        className="hidden sm:flex items-center px-4 py-2 bg-white/95 text-slate-900 rounded-2xl shadow-xl backdrop-blur-md border border-white/40 text-xs font-bold group-hover:bg-white transition-all"
      >
        <span>Need Help? <strong className="text-emerald-600 font-extrabold">Chat with us</strong></span>
      </motion.div>
    </motion.div>
  );
};

export default WhatsAppWidget;
