import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 bg-slate-100 rounded-full text-slate-500 mb-4">
        <AlertCircle className="w-12 h-12 text-health-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-1">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        The requested route does not exist in the Health Wallet Phase 0 application structure.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};
