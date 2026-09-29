import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Clock, AlertCircle, Building2, Stethoscope, FileText, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  fetchPendingVerificationsApi,
  reviewProviderVerificationApi,
  ProviderVerificationItem,
} from '../../services/providerApi';

export const ProviderVerificationPage: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<ProviderVerificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Remarks state for rejection / approval notes
  const [remarksMap, setRemarksMap] = useState<{ [key: string]: string }>({});
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);

  const loadPendingVerifications = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPendingVerificationsApi(token);
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pending provider verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingVerifications();
  }, [token]);

  const handleReview = async (item: ProviderVerificationItem, action: 'APPROVE' | 'REJECT') => {
    if (!token) return;
    const key = `${item.provider_type}-${item.id}`;
    setSubmittingKey(key);
    setError(null);
    setSuccessMsg(null);
    const remarks = remarksMap[key] || '';

    try {
      const res = await reviewProviderVerificationApi(token, {
        provider_type: item.provider_type,
        provider_id: item.id,
        action,
        remarks: remarks.trim() || undefined,
      });
      setSuccessMsg(res.message || `Provider ${action === 'APPROVE' ? 'verified' : 'rejected'} successfully.`);
      await loadPendingVerifications();
    } catch (err: any) {
      setError(err.message || 'Failed to complete review');
    } finally {
      setSubmittingKey(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-tealhealth-700 via-tealhealth-600 to-health-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-teal-100 border border-white/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>System Administrator Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Healthcare Provider Verification Review</h1>
            <p className="text-xs text-teal-100 mt-1">
              Verify credentials and issue platform authorization for pending physicians and hospital registrations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white border border-white/20">
              {items.length} Pending Approvals
            </span>
          </div>
        </div>
      </div>

      {/* Notice Banners */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-800 flex items-center justify-between">
          <span className="font-semibold">{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 font-bold">Dismiss</button>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 font-bold">Dismiss</button>
        </div>
      )}

      {/* List Card */}
      <Card title="Pending Provider Credential Submissions" subtitle="Review registration numbers, qualification records, and issue verification approval">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-tealhealth-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Loading pending verification requests...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">All Provider Verifications Complete</h3>
            <p className="text-xs text-slate-500">There are currently no pending doctor or hospital verification requests in the system queue.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const key = `${item.provider_type}-${item.id}`;
              const isSubmitting = submittingKey === key;
              const isDoctor = item.provider_type === 'DOCTOR';

              return (
                <div
                  key={key}
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:border-tealhealth-300 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${isDoctor ? 'bg-tealhealth-100 text-tealhealth-800' : 'bg-slate-100 text-slate-800'}`}>
                        {isDoctor ? <Stethoscope className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-slate-800">{item.name}</h3>
                          <Badge variant={isDoctor ? 'teal' : 'neutral'}>
                            {item.provider_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          Identifier / Reg ID: <span className="font-bold text-slate-700">{item.identifier}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      Submitted: {new Date(item.submitted_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs text-slate-700 space-y-1">
                    <span className="font-semibold text-slate-500 text-[11px] block">SUBMITTED CREDENTIAL DETAILS</span>
                    <p className="leading-relaxed">{item.details}</p>
                  </div>

                  {/* Action row with remarks and buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <input
                      type="text"
                      placeholder="Verification remarks / audit note (optional)..."
                      value={remarksMap[key] || ''}
                      onChange={(e) =>
                        setRemarksMap({ ...remarksMap, [key]: e.target.value })
                      }
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500"
                    />

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleReview(item, 'REJECT')}
                        disabled={isSubmitting}
                        className="px-3.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition flex items-center space-x-1 disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleReview(item, 'APPROVE')}
                        disabled={isSubmitting}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition flex items-center space-x-1 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'Processing...' : 'Verify & Approve'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
