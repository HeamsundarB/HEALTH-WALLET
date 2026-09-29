import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  NotificationItem,
  fetchNotificationsApi,
} from '../services/notificationsApi';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';

import {
  Activity,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Eye,
  Info,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const AccessActivityPage: React.FC = () => {
  const { token } = useAuth();
  const [activities, setActivities] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivities = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchNotificationsApi(token);
      setActivities(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load access activity log');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [token]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="inline-flex items-center space-x-2 bg-health-50 px-2.5 py-1 rounded-full text-xs font-semibold text-health-700 border border-health-200 mb-2">
          <Activity className="w-3.5 h-3.5" />
          <span>Phase 5 • Access Activity Audit Log</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          Access Activity & Security Log
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Transparent activity log of consent requests, approvals, revocations, and health record viewings.
        </p>
      </div>

      {/* Synthetic Disclaimer */}
      <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-xl text-xs text-amber-900 flex items-start space-x-2 shadow-xs">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">SYNTHETIC PROTOTYPE NOTICE:</span> Activity logs shown here track synthetic prototype access events inside your Health Wallet account.
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading access activity log..." />
      ) : error ? (
        <ErrorState title="Unable to load activity log" message={error} onRetry={loadActivities} />
      ) : activities.length === 0 ? (
        <Card title="No Activity Recorded" subtitle="No security or access events have occurred yet.">
          <p className="text-xs text-slate-500 text-center py-6">
            When healthcare providers request or access your synthetic Health Wallet records, activity entries will be recorded here.
          </p>
        </Card>
      ) : (
        <Card title={`Access Activity Audit Log (${activities.length})`} subtitle="Chronological system event sequence">
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {activities.map((item) => (
              <div key={item.id} className="relative group">
                {/* Node Dot */}
                <div className="absolute -left-6 top-1 w-6 h-6 rounded-full bg-white border-2 border-health-600 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-health-600" />
                </div>

                {/* Content */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 hover:bg-white hover:border-health-300 transition-all text-xs space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-mono text-slate-400 text-[10px] flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                    <Badge variant="teal" size="sm">{item.notification_type}</Badge>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                  <p className="text-slate-600">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
