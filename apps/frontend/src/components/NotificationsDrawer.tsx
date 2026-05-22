import { useState } from 'react';
import { X, Bell, CheckCheck, Trash2, Loader2 } from 'lucide-react';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  type Notification,
} from '../hooks/useNotifications';

const TYPE_LABELS: Record<string, string> = {
  FRIEND_REQUEST: '👋 Friend Request',
  FRIEND_ACCEPTED: '🤝 Friend Accepted',
  TRIP_SHARED: '✈️ Trip Shared',
  ADMIN_ACTION: '🔔 Admin Notice',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationItem({ notif }: { notif: Notification }) {
  const markRead = useMarkAsRead();
  const deleteNotif = useDeleteNotification();

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border-b border-[#f1f5f9] transition-colors ${
        notif.is_read ? 'bg-white' : 'bg-[#fffbf0]'
      }`}
    >
      {/* Unread dot */}
      <div className="mt-1.5 flex-shrink-0">
        {!notif.is_read ? (
          <span className="w-2 h-2 rounded-full bg-[#E8604C] block" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-transparent block" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#94a3b8] mb-0.5">
          {TYPE_LABELS[notif.type] ?? notif.type}
        </p>
        <p className="text-sm text-[#1e293b] leading-snug">{notif.message}</p>
        <p className="text-xs text-[#94a3b8] mt-1">{timeAgo(notif.created_at)}</p>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {!notif.is_read && (
          <button
            id={`mark-read-${notif.id}`}
            onClick={() => markRead.mutate(notif.id)}
            disabled={markRead.isPending}
            className="p-1 rounded hover:bg-[#f1f5f9] text-[#64748B] hover:text-[#E8604C] transition-colors"
            title="Mark as read"
          >
            <CheckCheck className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          id={`delete-notif-${notif.id}`}
          onClick={() => deleteNotif.mutate(notif.id)}
          disabled={deleteNotif.isPending}
          className="p-1 rounded hover:bg-[#fee2e2] text-[#94a3b8] hover:text-[#ef4444] transition-colors"
          title="Delete notification"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

interface Props {
  onClose: () => void;
}

export default function NotificationsDrawer({ onClose }: Props) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useNotifications(page, 20);
  const markAll = useMarkAllAsRead();

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        id="notifications-drawer"
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col"
        role="dialog"
        aria-label="Notifications"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#E8604C]" />
            <h2 className="text-base font-semibold text-[#1e293b]">Notifications</h2>
            {data && data.total > 0 && (
              <span className="text-xs text-[#94a3b8]">({data.total})</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              id="mark-all-read-btn"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="text-xs text-[#E8604C] hover:text-[#c44a3a] font-medium disabled:opacity-50 transition-colors"
            >
              {markAll.isPending ? 'Marking…' : 'Mark all read'}
            </button>
            <button
              id="close-notifications-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#64748B] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#E8604C]" />
            </div>
          )}

          {isError && (
            <div className="px-5 py-8 text-center text-sm text-[#ef4444]">
              Failed to load notifications. Please try again.
            </div>
          )}

          {!isLoading && !isError && data && data.items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-5">
              <Bell className="w-10 h-10 text-[#e2e8f0] mb-3" />
              <p className="text-sm text-[#94a3b8] font-medium">All caught up!</p>
              <p className="text-xs text-[#cbd5e1] mt-1">No notifications yet.</p>
            </div>
          )}

          {!isLoading && !isError && data && data.items.map((notif) => (
            <NotificationItem key={notif.id} notif={notif} />
          ))}
        </div>

        {/* Pagination footer */}
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#f1f5f9] bg-[#f8fafc]">
            <button
              id="notif-prev-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white border border-[#e2e8f0] text-[#64748B] hover:bg-[#f1f5f9] disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-[#94a3b8]">
              Page {page} of {totalPages}
            </span>
            <button
              id="notif-next-btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white border border-[#e2e8f0] text-[#64748B] hover:bg-[#f1f5f9] disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}
