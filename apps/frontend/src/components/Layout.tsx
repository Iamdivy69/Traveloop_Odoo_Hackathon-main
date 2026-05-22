import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { useEffect, useState, useCallback } from 'react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const isLoggedIn = !!user || !!token;
  
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isResizing, setIsResizing] = useState(false);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';

  useEffect(() => {
    if (!isLoggedIn && !isAuthPage) {
      navigate('/login');
    }
  }, [isLoggedIn, isAuthPage, navigate]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = e.clientX;
        if (newWidth >= 200 && newWidth <= 380) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  if (isAuthPage) {
    return (
      <div className="min-h-screen">
        <Outlet />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-[#F8FAFC]"
      style={{ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}
    >
      <Sidebar />
      
      {/* Resizer Handle */}
      <div
        className="hidden md:block fixed top-0 bottom-0 z-50 cursor-col-resize w-[3px] hover:bg-[#E8604C]/30 active:bg-[#E8604C]/60 transition-colors"
        style={{ left: sidebarWidth }}
        onMouseDown={startResizing}
      />

      {/* Drag overlay */}
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-col-resize select-none" />
      )}

      {/* ── Top header bar (desktop) ── */}
      <header className="hidden md:flex fixed top-0 right-0 h-16 items-center justify-end gap-3 px-8 bg-[#F8FAFC]/80 backdrop-blur-md z-30" style={{ left: `${sidebarWidth}px` }}>
        <NotificationBell />
        <button onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#e2e8f0] hover:border-[#E8604C] transition-colors">
          <img src={user?.photo_url || '/images/user-avatar.jpg'} alt="Profile" className="w-full h-full object-cover" />
        </button>
      </header>

      {/* ── Main Content ── */}
      <main className="pt-20 md:pt-20 pb-24 md:pb-8 px-4 sm:px-6 md:px-8 lg:px-12 md:ml-[var(--sidebar-width)] max-w-[1200px] mx-auto md:mx-0 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
