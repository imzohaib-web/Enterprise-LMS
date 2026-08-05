import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import WhatsAppWidget from '../components/public/WhatsAppWidget';

export const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0E17] text-gray-100 font-outfit antialiased selection:bg-brand-500 selection:text-white relative overflow-x-hidden">
      {/* Subtle Top Gradient (Hero area only - EdTech Enterprise Standard) */}
      <div className="absolute top-0 inset-x-0 h-[550px] bg-gradient-to-b from-brand-950/25 via-slate-900/10 to-transparent pointer-events-none z-0" />

      {/* Enterprise Subtle Grid Overlay */}
      <div className="fixed inset-0 bg-grid-pattern opacity-35 pointer-events-none z-0" />

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
