import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  NotificationItem,
  fetchNotificationsApi,
  fetchUnreadCountApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from '../../services/notificationsApi';
import { NotificationPanel } from './NotificationPanel';
import { Bell } from 'lucide-react';

export const NotificationBell: React.FC = () => {
  const { token } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const loadUnreadCount = async () => {
    if (!token) return;
    try {
      const res = await fetchUnreadCountApi(token);
      setUnreadCount(res.unread_count);
    } catch {
      // Silent catch
    }
  };

  const loadNotifications = async () => {
    if (!token) return;
    try {
      const data = await fetchNotificationsApi(token);
      setNotifications(data);
      const unread = data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch {
      // Silent catch
    }
  };

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const togglePanel = () => {
    if (!isOpen) {
      loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkRead = async (id: number) => {
    if (!token) return;
    try {
      await markNotificationAsReadApi(token, id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Silent catch
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      await markAllNotificationsAsReadApi(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Silent catch
    }
  };

  return (
    <div className="relative">
      <button
        onClick={togglePanel}
        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
        title="In-App Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-rose-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />
    </div>
  );
};
