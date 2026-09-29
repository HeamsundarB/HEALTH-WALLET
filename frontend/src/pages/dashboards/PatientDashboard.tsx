import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchPatientProfileApi, PatientProfileData } from '../../services/patientApi';
import { fetchHealthRecordsApi, HealthRecord } from '../../services/healthRecordsApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useNavigate } from 'react-router-dom';

import {
  Wallet,
  ShieldCheck,
  Activity,
  User,
  Clock,
  ArrowRight,
  FileText,
  FileSpreadsheet,
  Calendar,
  Pill,
  Info,
  CheckCircle2,
  Stethoscope,
  Plus,
  Layers,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PatientProfileData | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const [profileData, recordsData] = await Promise.all([
        fetchPatientProfileApi(token),
        fetchHealthRecordsApi(token),
      ]);
      setProfile(profileData);
      setRecords(recordsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load patient dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  if (isLoading) {
    return <LoadingState message="Loading Health Wallet Profile & Records..." />;
  }

  if (error) {
    return <ErrorState title="Unable to load Patient Wallet" message={error} onRetry={loadData} />;
  }

  // Sorted recent records for timeline overview
  const recentRecords = [...records]
    .sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Patient Welcome Banner */}
      <div className="bg-gradient-to-r from-health-700 via-health-600 to-tealhealth-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <ShieldCheck className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-health-100 border border-white/20">
            <Activity className="w-3.5 h-3.5" />
            <span>MEDIMIND • Phase 3 Health Records & Timeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {profile?.full_name || user?.full_name || 'Patient'}
          </h1>
          <p className="text-health-100 text-sm font-medium">One Patient. One Health Journey.</p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="bg-white/15 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-white/25 flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-tealhealth-200" />
              <span className="text-xs font-mono font-bold text-white tracking-wider">
                {profile?.health_wallet_id || 'HW-2026-PENDING'}
              </span>
            </div>
            <Badge variant="teal" size="sm">PATIENT ROLE</Badge>
          </div>
        </div>
      </div>

      {/* Synthetic Prototype Notice */}
      <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-xl text-xs text-amber-900 flex items-start space-x-2 shadow-xs">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">SYNTHETIC PROTOTYPE ID & RECORDS DISCLAIMER:</span> The Health Wallet ID and health records above are synthetic prototype data generated for demonstration. No Aadhaar, ABHA, or government identity integration.
        </div>
      </div>

      {/* Quick Summary Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Synthetic Health Wallet</p>
            <p className="text-sm font-mono font-bold text-health-700 mt-0.5">
              {profile?.health_wallet_id}
            </p>
          </div>
          <div className="p-3 bg-health-50 text-health-700 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Health Records</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{records.length}</p>
          </div>
          <div className="p-3 bg-tealhealth-50 text-tealhealth-700 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Timeline Status</p>
            <p className="text-sm font-bold text-emerald-700 mt-0.5 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Active & Synced
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Top Overview Grid: Health Wallet Overview & Profile Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Wallet Overview Card */}
        <Card className="lg:col-span-2 border-l-4 border-l-health-600" title="Digital Health Wallet Overview" subtitle="Patient-centric identifier & session status">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80 gap-3">
              <div>
                <p className="text-xs text-slate-500 font-medium">Digital Health Wallet ID</p>
                <p className="text-lg font-mono font-bold text-health-700 mt-0.5">
                  {profile?.health_wallet_id || 'HW-2026-PENDING'}
                </p>
              </div>
              <Badge variant="teal" size="md">Synthetic Prototype ID</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <p className="text-slate-500">Account Status</p>
                <p className="font-bold text-emerald-700 mt-1 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified Active
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <p className="text-slate-500">Registered Email</p>
                <p className="font-semibold text-slate-800 truncate mt-1">{profile?.email}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <p className="text-slate-500">Blood Group</p>
                <p className="font-semibold text-slate-800 mt-1">{profile?.blood_group || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Summary Card */}
        <Card title="Patient Profile Summary" subtitle="Phase 2 Basic Demographics">
          <div className="space-y-3 text-xs">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-health-100 text-health-700 flex items-center justify-center font-bold text-sm shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{profile?.full_name}</p>
                <p className="text-slate-500">{profile?.email}</p>
              </div>
            </div>

            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">State / Region:</span>
                <span className="font-medium text-slate-800">{profile?.state || 'Demo State'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Emergency Phone:</span>
                <span className="font-medium text-slate-800">{profile?.emergency_contact_phone || '+91 00000 00000'}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Health Journey Overview Timeline */}
      <Card
        title="Chronological Health Records Summary"
        subtitle={`Displaying latest ${recentRecords.length} synthetic health records`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-health-600" />
            <span className="text-xs font-bold text-slate-700">Chronological Event Preview</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/records')}
            className="text-xs"
          >
            Manage All Records ({records.length})
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {recentRecords.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            No health records recorded yet.
          </div>
        ) : (
          <div className="space-y-3 divide-y divide-slate-100 text-xs">
            {recentRecords.map((r) => (
              <div key={r.id} className="pt-3 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="teal" size="sm">{r.record_type}</Badge>
                    <span className="font-mono text-slate-400 text-[11px]">{r.record_date}</span>
                  </div>
                  <p className="font-bold text-slate-800 text-sm">{r.title}</p>
                  <p className="text-slate-500 line-clamp-1">{r.description || 'No detailed notes.'}</p>
                </div>
                <Badge variant="neutral" size="sm">{r.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 4. Quick Access Planned Health Module Cards */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
          Phase 3 & Future Health Modules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div onClick={() => navigate('/dashboard/records')} className="cursor-pointer">
            <Card hoverEffect className="border-l-4 border-l-health-600">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-health-100 text-health-700 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <Badge variant="teal" size="sm">Phase 3 Active</Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-800">Health Records</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Active chronological timeline & record repository.
              </p>
            </Card>
          </div>

          <Card hoverEffect className="border-l-4 border-l-slate-300">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <Badge variant="neutral" size="sm">Planned / Future Phase</Badge>
            </div>
            <h4 className="text-sm font-bold text-slate-800">Diagnostic Analytics</h4>
            <p className="text-[11px] text-slate-500 mt-1">Lab test parsing & diagnostic analytics (Future Phase).</p>
          </Card>

          <Card hoverEffect className="border-l-4 border-l-slate-300">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <Badge variant="neutral" size="sm">Planned / Future Phase</Badge>
            </div>
            <h4 className="text-sm font-bold text-slate-800">Appointments</h4>
            <p className="text-[11px] text-slate-500 mt-1">Doctor scheduling & visit booking (Future Phase).</p>
          </Card>

          <Card hoverEffect className="border-l-4 border-l-slate-300">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <Pill className="w-5 h-5" />
              </div>
              <Badge variant="neutral" size="sm">Planned / Future Phase</Badge>
            </div>
            <h4 className="text-sm font-bold text-slate-800">Medicines</h4>
            <p className="text-[11px] text-slate-500 mt-1">Medication tracking & e-prescriptions (Future Phase).</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
