import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 font-sans">
      <div className="p-4 bg-rose-100 text-rose-600 rounded-full mb-4">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Access Denied (HTTP 403)</h2>
      <p className="text-xs text-slate-500 max-w-md mb-2 leading-relaxed">
        Your current role ({user?.roles?.join(', ') || 'No Role'}) does not have permission to access this dashboard route or resource.
      </p>
      <p className="text-[11px] text-amber-700 bg-amber-50 px-3 py-1 rounded border border-amber-200 mb-6">
        Backend & Frontend Role-Based Access Control (RBAC) Enforced
      </p>

      <Link to="/dashboard">
        <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Return to Patient Dashboard
        </Button>
      </Link>
    </div>
  );
};
