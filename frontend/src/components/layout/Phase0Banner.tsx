import React from 'react';
import { Info } from 'lucide-react';

export const Phase0Banner: React.FC = () => {
  return (
    <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between shadow-inner">
      <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <div>
          <span className="font-semibold">PHASE 0 ARCHITECTURAL FOUNDATION & DEMO MODE:</span>{' '}
          This page represents a visual placeholder/foundation shell. Medical functionality, records, authentication, and live integrations are scheduled for Phase 1+. Synthetic demo data only.
        </div>
      </div>
    </div>
  );
};
