import React from 'react';
import { ShieldAlert, Activity, ShieldCheck, Key, Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-health-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-slate-200 border border-white/20 mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Phase 1 Authentication & Role Foundation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">System Administrator Dashboard Shell</h1>
            <p className="text-xs text-slate-300 mt-1">
              Welcome, {user?.full_name || 'System Admin'} ({user?.email})
            </p>
          </div>
          <Badge variant="teal">SYSTEM_ADMIN ROLE</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card title="Global Role Access Boundary" subtitle="SYSTEM_ADMIN Super-User Scope">
          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <ShieldCheck className="w-6 h-6 text-health-600 shrink-0" />
            <div>
              <p className="font-semibold text-slate-800">Global Admin Permission Active</p>
              <p className="text-slate-500">Route `/admin/dashboard` restricted exclusively to `SYSTEM_ADMIN` role. Grants global view access across role endpoints.</p>
            </div>
          </div>
        </Card>

        <Card title="Phase 1 Scope Enforcement" subtitle="No Patient Data Access">
          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-slate-800">No Patient Medical Data Access</p>
              <p className="text-slate-500">System Admin role manages authentication and system infrastructure only. Zero medical data access in Phase 1.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
