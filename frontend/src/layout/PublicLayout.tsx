import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import WhatsAppWidget from '../components/public/WhatsAppWidget';

export const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0B0E17] text-gray-100 font-outfit antialiased selection:bg-brand-500 selection:text-white relative overflow-x-hidden">
      {/* Subtle Architectural Mesh Glow & Grid Lines Overlay */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[400px] bg-gradient-to-b from-brand-500/8 via-indigo-600/4 to-transparent rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/4 rounded-full blur-[180px] pointer-events-none z-0" />

      {/* Ultra-subtle Vector Grid Pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-25 pointer-events-none z-0" />

      {/* Header */}
      <PublicHeader />

      {/* Dynamic Content */}
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      {/* Fixed WhatsApp Support Button */}
      <WhatsAppWidget />

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
