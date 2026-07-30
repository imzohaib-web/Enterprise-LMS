import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';

export const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#090D16] text-gray-100 font-outfit antialiased selection:bg-brand-500 selection:text-white relative overflow-x-hidden">
      {/* Background Ambient Mesh Light Glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[500px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/3 right-1/4 w-[500px] h-[450px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-10 left-1/3 w-[550px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-grid-pattern opacity-60 pointer-events-none z-0" />

      {/* Header */}
      <PublicHeader />

      {/* Dynamic Content */}
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
