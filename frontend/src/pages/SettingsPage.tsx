import React from 'react';
import { Settings, Shield, Key, Bell, Database } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Platform Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Foundation Configuration Shell • Demo Mode
          </p>
        </div>
        <Badge variant="teal">Phase 0 Architecture</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Security & Authentication Stubs" subtitle="JWT Token Foundation Preparation">
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <Key className="w-5 h-5 text-health-600 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">JWT OAuth2 Bearer Layer</p>
                <p className="text-[11px] text-slate-500">Architecture prepared in backend/app/core/security.py</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <Shield className="w-5 h-5 text-tealhealth-600 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">Role Based Access Control (RBAC)</p>
                <p className="text-[11px] text-slate-500">Patient / Doctor / Admin role permission schemas prepared</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Database & Storage Config" subtitle="SQLAlchemy PostgreSQL Engine">
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <Database className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">Environment Driven DB URL</p>
                <p className="text-[11px] text-slate-500">Loaded dynamically from DATABASE_URL env variable</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <Bell className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">Audit Logging Foundation</p>
                <p className="text-[11px] text-slate-500">Clean Python logging configured with sanitized headers</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
