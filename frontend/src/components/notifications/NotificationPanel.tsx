import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationItem, NotificationType } from '../../services/notificationsApi';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Bell,
  CheckCheck,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Eye,
  Activity,
  ArrowRight,
  X,
  Clock,
} from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'CONSENT_REQUEST':
      return <KeyRound className="w-4 h-4 text-amber-600" />;
    case 'CONSENT_APPROVED':
      return <ShieldCheck className="w-4 h-4 text-teal-600" />;
    case 'CONSENT_REJECTED':
      return <ShieldAlert className="w-4 h-4 text-rose-600" />;
    case 'CONSENT_REVOKED':
      return <ShieldX className="w-4 h-4 text-slate-600" />;
    case 'RECORD_ACCESS':
      return <Eye className="w-4 h-4 text-blue-600" />;
    case 'ACCOUNT_ACTIVITY':
      return <Activity className="w-4 h-4 text-emerald-600" />;
    default:
      return <Bell className="w-4 h-4 text-slate-600" />;
  }
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-health-600" />
          <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="error" size="sm">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-[11px] text-health-700 font-semibold hover:underline flex items-center mr-2"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No in-app notifications.
          </div>
        ) : (
          notifications.slice(0, 6).map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (!item.is_read) onMarkRead(item.id);
              }}
              className={`p-3.5 flex items-start space-x-3 transition-colors cursor-pointer hover:bg-slate-50 ${
                !item.is_read ? 'bg-health-50/40 border-l-4 border-l-health-600' : ''
              }`}
            >
              <div className="p-2 bg-slate-100 rounded-lg shrink-0 mt-0.5">
                {getNotificationIcon(item.notification_type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-800 text-xs">{item.title}</p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">{item.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-400">Synthetic Prototype Data</span>
        <button
          onClick={() => {
            onClose();
            navigate('/notifications');
          }}
          className="text-health-700 font-bold hover:underline flex items-center text-xs"
        >
          View All Notifications
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>
    </div>
  );
};
