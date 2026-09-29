import React from 'react';
import { Building2, Activity, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

export const HospitalDashboard: React.FC = () => {
  const { user } = useAuth();
  const currentRole = user?.roles?.find((r) => r === 'HOSPITAL_ADMIN' || r === 'HOSPITAL_STAFF') || 'HOSPITAL_ADMIN';

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-blue-100 border border-white/20 mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Phase 1 Authentication & Role Foundation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Hospital Facility Dashboard Shell</h1>
            <p className="text-xs text-blue-100 mt-1">
              Welcome, {user?.full_name || 'Hospital User'} ({user?.email})
            </p>
          </div>
          <Badge variant="info">{currentRole}</Badge>
        </div>
      </div>

      <Card title="Shared Hospital Role Shell Notice" subtitle="Phase 1 Access Boundary">
        <div className="flex items-center space-x-3 text-xs text-slate-600">
          <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
          <div>
            <p className="font-semibold text-slate-800">Shared Route: `/hospital/dashboard`</p>
            <p className="text-slate-500">Accessible by both `HOSPITAL_ADMIN` & `HOSPITAL_STAFF` roles. Purely an authentication and RBAC foundation shell.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
