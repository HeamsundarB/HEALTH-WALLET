import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Wallet,
  FileText,
  FileSpreadsheet,
  Calendar,
  Activity,
  CheckCircle,
  Clock,
  ShieldCheck,
  Server,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, Column } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Toast } from '../components/ui/Toast';

interface Phase0Record {
  id: string;
  category: string;
  module: string;
  status: string;
  phase: string;
}

const foundationModules: Phase0Record[] = [
  { id: 'MOD-001', category: 'UI Layout Shell', module: 'Dashboard Scaffolding', status: 'Foundation Ready', phase: 'Phase 0' },
  { id: 'MOD-002', category: 'Medical Records', module: 'Record Storage Architecture', status: 'Planned / Future Phase', phase: 'Phase 1' },
  { id: 'MOD-003', category: 'Lab Diagnostics', module: 'Report Service Architecture', status: 'Planned / Future Phase', phase: 'Phase 2' },
  { id: 'MOD-004', category: 'Appointments', module: 'Scheduling Service Architecture', status: 'Planned / Future Phase', phase: 'Phase 3' },
];

export const DashboardPage: React.FC = () => {
  const { healthData, backendStatus } = useOutletContext<{ healthData: any; backendStatus: string }>();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const tableColumns: Column<Phase0Record>[] = [
    { header: 'Module ID', accessorKey: 'id', className: 'font-mono text-xs' },
    { header: 'Category', accessorKey: 'category', className: 'font-medium text-slate-800' },
    { header: 'Component Name', accessorKey: 'module' },
    {
      header: 'Phase Target',
      cell: (item) => <Badge variant={item.phase === 'Phase 0' ? 'teal' : 'neutral'}>{item.phase}</Badge>,
    },
    {
      header: 'Status',
      cell: (item) => (
        <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md border ${
          item.phase === 'Phase 0' 
            ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
            : 'text-slate-600 bg-slate-50 border-slate-200'
        }`}>
          {item.phase === 'Phase 0' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
          {item.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-health-700 via-health-600 to-tealhealth-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <ShieldCheck className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-health-100 border border-white/20">
            <Activity className="w-3.5 h-3.5" />
            <span>MEDIMIND Prototype • Phase 0 Scope</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">HEALTH WALLET</h1>
          <p className="text-health-100 text-lg font-medium">One Patient. One Health Journey.</p>
          <p className="text-xs text-slate-200 pt-2 leading-relaxed max-w-2xl">
            Welcome to the Phase 0 foundation dashboard. This visual shell demonstrates component scaffolding, frontend routing, FastAPI backend connectivity, and SQLAlchemy database layer preparation.
          </p>
          <div className="pt-4 flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" onClick={() => setIsDemoModalOpen(true)}>
              View Phase 0 Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              onClick={() => setShowToast(true)}
            >
              Test Notification UI
            </Button>
          </div>
        </div>
      </div>

      {/* Backend API Live Status Alert Card */}
      <Card title="Backend API & System Connectivity" subtitle="Live FastAPI /api/v1/health status readout">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${backendStatus === 'ok' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              <Server className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Endpoint: <span className="font-mono text-xs text-health-700">/api/v1/health</span>
              </p>
              <p className="text-xs text-slate-500">
                {backendStatus === 'ok'
                  ? `Service: "${healthData?.service}" | Status: ${healthData?.status}`
                  : 'Backend server not responding or offline during dev load.'}
              </p>
            </div>
          </div>
          <div>
            <Badge variant={backendStatus === 'ok' ? 'success' : 'error'}>
              {backendStatus === 'ok' ? 'System Operational' : 'Offline / Simulated'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* 4 Primary Foundation Visual Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hoverEffect className="border-l-4 border-l-health-600">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-health-50 text-health-600 rounded-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <Badge variant="teal" size="sm">Phase 0 Ready</Badge>
          </div>
          <h3 className="text-base font-bold text-slate-800">Health Wallet</h3>
          <p className="text-xs text-slate-500 mt-1">UI layout and navigation shell foundation.</p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-health-700">
            <span>Foundation Shell</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Card>

        <Card hoverEffect className="border-l-4 border-l-tealhealth-600">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-tealhealth-50 text-tealhealth-600 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <Badge variant="neutral" size="sm">Planned / Future Phase</Badge>
          </div>
          <h3 className="text-base font-bold text-slate-800">Medical Records</h3>
          <p className="text-xs text-slate-500 mt-1">Medical records visual placeholder shell (Planned).</p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Planned / Future Phase</span>
            <Clock className="w-4 h-4" />
          </div>
        </Card>

        <Card hoverEffect className="border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <Badge variant="neutral" size="sm">Planned / Future Phase</Badge>
          </div>
          <h3 className="text-base font-bold text-slate-800">Reports</h3>
          <p className="text-xs text-slate-500 mt-1">Diagnostic reports visual placeholder shell (Planned).</p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Planned / Future Phase</span>
            <Clock className="w-4 h-4" />
          </div>
        </Card>

        <Card hoverEffect className="border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <Badge variant="neutral" size="sm">Planned / Future Phase</Badge>
          </div>
          <h3 className="text-base font-bold text-slate-800">Appointments</h3>
          <p className="text-xs text-slate-500 mt-1">Appointments visual placeholder shell (Planned).</p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Planned / Future Phase</span>
            <Clock className="w-4 h-4" />
          </div>
        </Card>
      </div>

      {/* Phase 0 Architecture Status Table */}
      <Card
        title="Phase 0 Architectural Components Matrix"
        subtitle="Verification of scalable project scaffolding"
        action={
          <Button size="sm" variant="outline" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsDemoModalOpen(true)}>
            View Architecture Info
          </Button>
        }
      >
        <Table columns={tableColumns} data={foundationModules} keyExtractor={(item) => item.id} />
      </Card>

      {/* Modal Demo */}
      <Modal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        title="Phase 0 Architecture Overview"
        subtitle="MEDIMIND Health Wallet Prototype"
        footer={
          <Button size="sm" variant="primary" onClick={() => setIsDemoModalOpen(false)}>
            Close Overview
          </Button>
        }
      >
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <p>
            This Phase 0 foundation verifies that the frontend React framework, backend FastAPI architecture, SQLAlchemy session management, and Docker configuration are correctly wired.
          </p>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
            <p>✓ Router: React Router v6</p>
            <p>✓ Query: TanStack React Query v5</p>
            <p>✓ Backend API: FastAPI /api/v1/health</p>
            <p>✓ DB Engine: SQLAlchemy + PostgreSQL Config</p>
          </div>
        </div>
      </Modal>

      {/* Toast Notification Demo */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50">
          <Toast
            title="Toast Component Active"
            message="Reusable Toast notification component verified in Phase 0."
            type="info"
            onClose={() => setShowToast(false)}
          />
        </div>
      )}
    </div>
  );
};
