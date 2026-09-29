import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Diagnostic Reports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Foundation Shell • Phase 2 Target Module
          </p>
        </div>
        <Badge variant="neutral">Phase 2 Planned</Badge>
      </div>

      <EmptyState
        title="Diagnostic Reports Module (Phase 2)"
        description="Lab test results, blood panel reports, radiology documents, and AI extraction services are scheduled for Phase 2."
        icon={<FileSpreadsheet className="w-8 h-8 text-tealhealth-600" />}
      />
    </div>
  );
};
