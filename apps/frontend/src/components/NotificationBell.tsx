import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationCount } from '../hooks/useNotifications';
import NotificationsDrawer from './NotificationsDrawer';

export default function NotificationBell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: count = 0 } = useNotificationCount();

  return (
    <>
      <button
        id="notification-bell-btn"
        onClick={() => setDrawerOpen(true)}
        className="w-9 h-9 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#64748B] hover:bg-[#f1f5f9] transition-colors relative"
        aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
      >
        <Bell className="w-[18px] h-[18px]" />
        {count > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-[#E8604C] rounded-full text-white text-[10px] font-bold flex items-center justify-center leading-none"
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {drawerOpen && (
        <NotificationsDrawer onClose={() => setDrawerOpen(false)} />
      )}
    </>
  );
}
