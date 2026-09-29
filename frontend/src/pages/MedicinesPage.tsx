import React from 'react';
import { Pill } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';

export const MedicinesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Medicines & Prescriptions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Foundation Shell • Future Phase Target Module
          </p>
        </div>
        <Badge variant="neutral">Future Phase</Badge>
      </div>

      <EmptyState
        title="Medicines & Refills Module"
        description="Medication tracking, dosage reminders, and e-prescriptions will be implemented in subsequent project phases."
        icon={<Pill className="w-8 h-8 text-emerald-600" />}
      />
    </div>
  );
};
