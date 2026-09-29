import React from 'react';
import { FlaskConical, Activity, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

export const LabDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-purple-100 border border-white/20 mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Phase 1 Authentication & Role Foundation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Diagnostic Lab Dashboard Shell</h1>
            <p className="text-xs text-purple-100 mt-1">
              Welcome, {user?.full_name || 'Lab Technician'} ({user?.email})
            </p>
          </div>
          <Badge variant="neutral">LAB ROLE</Badge>
        </div>
      </div>

      <Card title="Lab RBAC Shell Notice" subtitle="Phase 1 Access Boundary">
        <div className="flex items-center space-x-3 text-xs text-slate-600">
          <ShieldCheck className="w-6 h-6 text-purple-600 shrink-0" />
          <div>
            <p className="font-semibold text-slate-800">Verified LAB Role Access Boundary</p>
            <p className="text-slate-500">Route `/lab/dashboard` protected via frontend & backend JWT guards. No diagnostic report processing in Phase 1.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
