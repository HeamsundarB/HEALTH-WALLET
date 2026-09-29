import React from 'react';
import { Calendar } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';

export const AppointmentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Doctor Appointments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Foundation Shell • Phase 3 Target Module
          </p>
        </div>
        <Badge variant="neutral">Phase 3 Planned</Badge>
      </div>

      <EmptyState
        title="Appointments Module (Phase 3)"
        description="Scheduling visits with healthcare providers, online tele-consultations, and clinic booking management will be introduced in future phases."
        icon={<Calendar className="w-8 h-8 text-blue-600" />}
      />
    </div>
  );
};
