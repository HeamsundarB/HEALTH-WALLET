import React from 'react';
import { Pill, Activity, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

export const PharmacyDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-tealhealth-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-emerald-100 border border-white/20 mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Phase 1 Authentication & Role Foundation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Pharmacy Portal Dashboard Shell</h1>
            <p className="text-xs text-emerald-100 mt-1">
              Welcome, {user?.full_name || 'Pharmacist'} ({user?.email})
            </p>
          </div>
          <Badge variant="success">PHARMACY ROLE</Badge>
        </div>
      </div>

      <Card title="Pharmacy RBAC Shell Notice" subtitle="Phase 1 Access Boundary">
        <div className="flex items-center space-x-3 text-xs text-slate-600">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <p className="font-semibold text-slate-800">Verified PHARMACY Role Access Boundary</p>
            <p className="text-slate-500">Route `/pharmacy/dashboard` protected via frontend & backend JWT guards. No prescription or medication inventory logic in Phase 1.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
