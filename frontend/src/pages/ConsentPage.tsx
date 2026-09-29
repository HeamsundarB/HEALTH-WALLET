import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Consent,
  ConsentStatus,
  ConsentScope,
  fetchPatientConsentsApi,
  fetchRequesterConsentsApi,
  createConsentRequestApi,
  approveConsentApi,
  rejectConsentApi,
  revokeConsentApi,
  fetchConsentProtectedRecordsApi,
} from '../services/consentsApi';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';

import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Building2,
  Info,
  Plus,
  Send,
  Eye,
  FileText,
  X,
  Lock,
} from 'lucide-react';

const SCOPE_OPTIONS: { label: string; value: ConsentScope }[] = [
  { label: 'All Health Records', value: 'ALL_HEALTH_RECORDS' },
  { label: 'Consultations Only', value: 'CONSULTATIONS' },
  { label: 'Diagnoses Only', value: 'DIAGNOSES' },
  { label: 'Treatments Only', value: 'TREATMENTS' },
  { label: 'Lab Tests Only', value: 'LAB_TESTS' },
  { label: 'Imaging & Scans', value: 'IMAGING' },
  { label: 'Prescriptions', value: 'PRESCRIPTIONS' },
];

export const ConsentPage: React.FC = () => {
  const { user, token } = useAuth();
  const isPatient = user?.roles.includes('PATIENT');
  const isHealthcare = user?.roles.some((r) =>
    ['DOCTOR', 'HOSPITAL_ADMIN', 'HOSPITAL_STAFF', 'LAB', 'PHARMACY', 'BLOOD_BANK'].includes(r)
  );

  const [consents, setConsents] = useState<Consent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Patient Filter Tab
  const [patientTab, setPatientTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'HISTORY'>('ALL');

  // Healthcare Request Form State
  const [targetHwId, setTargetHwId] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('Routine Consultation & Diagnosis');
  const [scope, setScope] = useState<ConsentScope>('ALL_HEALTH_RECORDS');
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  // Healthcare Record Viewer Modal State
  const [viewingPatientHwId, setViewingPatientHwId] = useState<string | null>(null);
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [isRecordsLoading, setIsRecordsLoading] = useState<boolean>(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  const loadConsents = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      if (isPatient) {
        const data = await fetchPatientConsentsApi(token);
        setConsents(data);
      } else if (isHealthcare) {
        const data = await fetchRequesterConsentsApi(token);
        setConsents(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load consent data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConsents();
  }, [token, isPatient, isHealthcare]);

  // Patient Actions
  const handleApprove = async (consentId: number) => {
    if (!token) return;
    try {
      await approveConsentApi(token, consentId);
      await loadConsents();
    } catch (err: any) {
      alert(err.message || 'Failed to approve consent');
    }
  };

  const handleReject = async (consentId: number) => {
    if (!token) return;
    try {
      await rejectConsentApi(token, consentId);
      await loadConsents();
    } catch (err: any) {
      alert(err.message || 'Failed to reject consent');
    }
  };

  const handleRevoke = async (consentId: number) => {
    if (!token) return;
    if (window.confirm('Are you sure you want to revoke this consent access? The healthcare provider will immediately lose access.')) {
      try {
        await revokeConsentApi(token, consentId);
        await loadConsents();
      } catch (err: any) {
        alert(err.message || 'Failed to revoke consent');
      }
    }
  };

  // Healthcare Request Submission
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!targetHwId.trim()) {
      setRequestError('Target Synthetic Health Wallet ID is required');
      return;
    }

    setIsRequesting(true);
    setRequestError(null);
    setRequestSuccess(null);

    try {
      await createConsentRequestApi(token, {
        patient_health_wallet_id: targetHwId.trim(),
        purpose: purpose.trim(),
        scope,
      });
      setRequestSuccess(`Access request successfully sent to Health Wallet ID: ${targetHwId}`);
      setTargetHwId('');
      await loadConsents();
    } catch (err: any) {
      setRequestError(err.message || 'Failed to create access request');
    } finally {
      setIsRequesting(false);
    }
  };

  // Healthcare View Records via Approved Consent
  const handleViewRecords = async (hwId: string) => {
    if (!token) return;
    setViewingPatientHwId(hwId);
    setIsRecordsLoading(true);
    setRecordsError(null);
    setPatientRecords([]);

    try {
      const records = await fetchConsentProtectedRecordsApi(token, hwId);
      setPatientRecords(records);
    } catch (err: any) {
      setRecordsError(err.message || 'Access Denied: No active APPROVED consent for this patient.');
    } finally {
      setIsRecordsLoading(false);
    }
  };

  const getStatusBadge = (status: ConsentStatus) => {
    switch (status) {
      case 'REQUESTED':
        return <Badge variant="warning" size="sm">REQUESTED</Badge>;
      case 'APPROVED':
        return <Badge variant="teal" size="sm">APPROVED (ACTIVE)</Badge>;
      case 'REJECTED':
        return <Badge variant="error" size="sm">REJECTED</Badge>;
      case 'REVOKED':
        return <Badge variant="neutral" size="sm">REVOKED</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const filteredConsents = consents.filter((c) => {
    if (patientTab === 'PENDING') return c.status === 'REQUESTED';
    if (patientTab === 'APPROVED') return c.status === 'APPROVED';
    if (patientTab === 'HISTORY') return c.status === 'REJECTED' || c.status === 'REVOKED';
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-health-50 px-2.5 py-1 rounded-full text-xs font-semibold text-health-700 border border-health-200 mb-2">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Phase 4 • Patient Consent & Access Control Foundation</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Consent & Access Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isPatient
              ? 'Control who can access your synthetic Health Wallet records.'
              : 'Request patient consent and view authorized records with active approval.'}
          </p>
        </div>
        <div className="flex items-center space-x-2 self-start md:self-center">
          <Badge variant="teal" size="md">
            {isPatient ? 'PATIENT CONSENT OWNER' : 'HEALTHCARE REQUESTER'}
          </Badge>
        </div>
      </div>

      {/* Synthetic Disclaimer */}
      <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-xl text-xs text-amber-900 flex items-start space-x-2 shadow-xs">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">SYNTHETIC PROTOTYPE NOTICE:</span> Consent workflows are synthetic prototype demonstrations. No external hospital network, government discovery, or ABHA network integration.
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading Consent & Access Data..." />
      ) : error ? (
        <ErrorState title="Unable to load consents" message={error} onRetry={loadConsents} />
      ) : (
        <>
          {/* PATIENT VIEW */}
          {isPatient && (
            <div className="space-y-6">
              {/* Filter Tabs */}
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-medium">
                <button
                  onClick={() => setPatientTab('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    patientTab === 'ALL'
                      ? 'bg-health-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Requests ({consents.length})
                </button>
                <button
                  onClick={() => setPatientTab('PENDING')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    patientTab === 'PENDING'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Pending Requests ({consents.filter((c) => c.status === 'REQUESTED').length})
                </button>
                <button
                  onClick={() => setPatientTab('APPROVED')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    patientTab === 'APPROVED'
                      ? 'bg-tealhealth-700 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Active Consents ({consents.filter((c) => c.status === 'APPROVED').length})
                </button>
                <button
                  onClick={() => setPatientTab('HISTORY')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    patientTab === 'HISTORY'
                      ? 'bg-slate-700 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  History ({consents.filter((c) => c.status === 'REJECTED' || c.status === 'REVOKED').length})
                </button>
              </div>

              {/* Consents List */}
              {filteredConsents.length === 0 ? (
                <Card title="No Consents Found" subtitle="No access requests match your selected tab.">
                  <p className="text-xs text-slate-500 text-center py-6">
                    When healthcare providers request access to your Health Wallet, they will appear here for your review and approval.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredConsents.map((consent) => (
                    <div
                      key={consent.id}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-health-300 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(consent.status)}
                            <Badge variant="neutral" size="sm">Role: {consent.requester_role}</Badge>
                            <span className="text-[10px] text-slate-400 font-mono">ID #{consent.id}</span>
                          </div>
                          <h3 className="text-base font-bold text-slate-800 tracking-tight">
                            {consent.requester_name}
                          </h3>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 self-start sm:self-center">
                          {consent.status === 'REQUESTED' && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleApprove(consent.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(consent.id)}
                                className="text-rose-600 border-rose-200 hover:bg-rose-50"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}

                          {consent.status === 'APPROVED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevoke(consent.id)}
                              className="text-amber-700 border-amber-300 hover:bg-amber-50"
                            >
                              <ShieldX className="w-3.5 h-3.5 mr-1" />
                              Revoke Access
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Request Details */}
                      <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-slate-500 font-medium">Purpose of Access:</p>
                          <p className="text-slate-800 font-semibold mt-0.5">{consent.purpose}</p>
                        </div>

                        <div>
                          <p className="text-slate-500 font-medium">Access Scope:</p>
                          <p className="text-health-700 font-mono font-bold mt-0.5">{consent.scope}</p>
                        </div>
                      </div>

                      {/* Timeline Audit Trail */}
                      <div className="mt-3 pt-2 border-t border-slate-50 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-slate-400" />
                          Requested: {new Date(consent.requested_at).toLocaleString()}
                        </span>
                        {consent.responded_at && (
                          <span className="flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                            Responded: {new Date(consent.responded_at).toLocaleString()}
                          </span>
                        )}
                        {consent.revoked_at && (
                          <span className="flex items-center">
                            <ShieldX className="w-3 h-3 mr-1 text-amber-500" />
                            Revoked: {new Date(consent.revoked_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* HEALTHCARE ROLE VIEW */}
          {isHealthcare && (
            <div className="space-y-6">
              {/* Request Form Card */}
              <Card title="Request Patient Access" subtitle="Submit synthetic consent request using Patient Health Wallet ID">
                {requestError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg mb-4">
                    {requestError}
                  </div>
                )}

                {requestSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg mb-4 flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                    {requestSuccess}
                  </div>
                )}

                <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-slate-700 font-semibold mb-1">
                        Patient Health Wallet ID <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. HW-2026-6551-1365"
                        value={targetHwId}
                        onChange={(e) => setTargetHwId(e.target.value)}
                        required
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-slate-700 font-semibold mb-1">
                        Purpose of Access <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Clinical Evaluation & Diagnosis"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        required
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-slate-700 font-semibold mb-1">
                        Access Scope <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={scope}
                        onChange={(e) => setScope(e.target.value as ConsentScope)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-health-500 focus:border-health-500 text-slate-800 font-medium"
                      >
                        {SCOPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" variant="primary" isLoading={isRequesting}>
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Submit Access Request
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Sent Requests Table */}
              <Card title={`Sent Access Requests (${consents.length})`} subtitle="Track status of requested patient access permissions">
                {consents.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">
                    No access requests submitted yet. Use the form above to request patient health record consent.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 uppercase font-semibold text-[10px] tracking-wider">
                          <th className="py-3 px-4">Patient Wallet ID</th>
                          <th className="py-3 px-4">Patient Name</th>
                          <th className="py-3 px-4">Purpose</th>
                          <th className="py-3 px-4">Scope</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {consents.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-health-700">
                              {c.patient_health_wallet_id || 'HW-SYNTHETIC'}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-800">{c.patient_name}</td>
                            <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{c.purpose}</td>
                            <td className="py-3 px-4 font-mono">{c.scope}</td>
                            <td className="py-3 px-4">{getStatusBadge(c.status)}</td>
                            <td className="py-3 px-4 text-right">
                              {c.status === 'APPROVED' ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewRecords(c.patient_health_wallet_id || '')}
                                  className="text-health-700 hover:bg-health-50"
                                >
                                  <Eye className="w-3.5 h-3.5 mr-1" />
                                  View Records
                                </Button>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">No access</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {/* Record Viewer Modal */}
              {viewingPatientHwId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-800">
                            Authorized Patient Records
                          </h2>
                          <p className="text-xs font-mono text-health-700">
                            Health Wallet ID: {viewingPatientHwId}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setViewingPatientHwId(null)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {isRecordsLoading ? (
                      <LoadingState message="Verifying active APPROVED consent & fetching records..." />
                    ) : recordsError ? (
                      <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs text-rose-700 space-y-1">
                        <p className="font-bold flex items-center">
                          <Lock className="w-4 h-4 mr-1 text-rose-600" />
                          Access Denied
                        </p>
                        <p>{recordsError}</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1 text-xs">
                        <p className="text-[11px] text-slate-500 font-medium">
                          Access Granted via Active APPROVED Consent ({patientRecords.length} records available).
                        </p>
                        {patientRecords.map((r: any) => (
                          <div key={r.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <Badge variant="teal" size="sm">{r.record_type}</Badge>
                              <span className="font-mono text-slate-400 text-[10px]">{r.record_date}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm">{r.title}</h4>
                            <p className="text-slate-600">{r.description}</p>
                            <p className="text-[10px] text-slate-400">
                              Provider: {r.provider_name || 'N/A'} • Facility: {r.facility_name || 'N/A'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end pt-2 border-t border-slate-100">
                      <Button variant="outline" onClick={() => setViewingPatientHwId(null)}>
                        Close Viewer
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
