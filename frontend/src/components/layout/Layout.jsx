import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import EmailVerificationBanner from '../ui/EmailVerificationBanner';
import DevEmailPanel from '../ui/DevEmailPanel';
import { useState } from 'react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          <div className="max-w-7xl mx-auto animate-fade-up">
            <EmailVerificationBanner />
            <Outlet />
          </div>
        </main>
      </div>
      <DevEmailPanel />
    </div>
  );
}
