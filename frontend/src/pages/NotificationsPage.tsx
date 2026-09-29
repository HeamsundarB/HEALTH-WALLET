import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  NotificationItem,
  NotificationType,
  fetchNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from '../services/notificationsApi';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';

import {
  Bell,
  CheckCheck,
  Check,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Eye,
  Activity,
  Info,
  Clock,
} from 'lucide-react';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'CONSENT_REQUEST':
      return <KeyRound className="w-5 h-5 text-amber-600" />;
    case 'CONSENT_APPROVED':
      return <ShieldCheck className="w-5 h-5 text-teal-600" />;
    case 'CONSENT_REJECTED':
      return <ShieldAlert className="w-5 h-5 text-rose-600" />;
    case 'CONSENT_REVOKED':
      return <ShieldX className="w-5 h-5 text-slate-600" />;
    case 'RECORD_ACCESS':
      return <Eye className="w-5 h-5 text-blue-600" />;
    case 'ACCOUNT_ACTIVITY':
      return <Activity className="w-5 h-5 text-emerald-600" />;
    default:
      return <Bell className="w-5 h-5 text-slate-600" />;
  }
};

const getNotificationBadge = (type: NotificationType) => {
  switch (type) {
    case 'CONSENT_REQUEST':
      return <Badge variant="warning" size="sm">Consent Request</Badge>;
    case 'CONSENT_APPROVED':
      return <Badge variant="teal" size="sm">Access Approved</Badge>;
    case 'CONSENT_REJECTED':
      return <Badge variant="error" size="sm">Access Rejected</Badge>;
    case 'CONSENT_REVOKED':
      return <Badge variant="neutral" size="sm">Access Revoked</Badge>;
    case 'RECORD_ACCESS':
      return <Badge variant="info" size="sm">Record Access</Badge>;
    case 'ACCOUNT_ACTIVITY':
      return <Badge variant="success" size="sm">Account Event</Badge>;
    default:
      return <Badge variant="neutral" size="sm">{type}</Badge>;
  }
};

export const NotificationsPage: React.FC = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');

  const loadNotifications = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchNotificationsApi(token);
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [token]);

  const handleMarkRead = async (id: number) => {
    if (!token) return;
    try {
      await markNotificationAsReadApi(token, id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      await markAllNotificationsAsReadApi(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err: any) {
      alert(err.message || 'Failed to mark all as read');
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'UNREAD') return !n.is_read;
    if (activeTab === 'READ') return n.is_read;
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-health-50 px-2.5 py-1 rounded-full text-xs font-semibold text-health-700 border border-health-200 mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Phase 5 • Notifications & Access Activity Foundation</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Notifications Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay informed about system activity, consent requests, and protected health record events.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllRead}
            className="shrink-0 flex items-center text-xs text-health-700 border-health-300"
          >
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Synthetic Disclaimer */}
      <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-xl text-xs text-amber-900 flex items-start space-x-2 shadow-xs">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">SYNTHETIC PROTOTYPE NOTICE:</span> Notifications displayed here are in-app prototype alerts generated strictly for student demonstration.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors ${
            activeTab === 'ALL'
              ? 'bg-health-600 text-white font-bold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('UNREAD')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors ${
            activeTab === 'UNREAD'
              ? 'bg-rose-600 text-white font-bold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setActiveTab('READ')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors ${
            activeTab === 'READ'
              ? 'bg-slate-700 text-white font-bold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <LoadingState message="Loading notifications..." />
      ) : error ? (
        <ErrorState title="Unable to load notifications" message={error} onRetry={loadNotifications} />
      ) : filteredNotifications.length === 0 ? (
        <Card title="No Notifications Found" subtitle="No alerts match your selected tab filter.">
          <p className="text-xs text-slate-500 text-center py-8">
            Important events like consent requests, access approvals, and record access will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border p-4 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                !item.is_read
                  ? 'border-health-300 bg-health-50/20 border-l-4 border-l-health-600'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-slate-100 rounded-xl shrink-0 mt-0.5">
                  {getNotificationIcon(item.notification_type)}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2 flex-wrap">
                    {getNotificationBadge(item.notification_type)}
                    {!item.is_read && (
                      <Badge variant="error" size="sm">NEW UNREAD</Badge>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed max-w-2xl">
                    {item.message}
                  </p>
                </div>
              </div>

              {!item.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkRead(item.id)}
                  className="self-end sm:self-center text-xs text-slate-600 hover:text-health-700 hover:bg-slate-100 shrink-0"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Mark as Read
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
