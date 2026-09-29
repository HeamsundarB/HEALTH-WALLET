import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Calendar, Clock, CheckCircle2, XCircle, FileText, User, AlertCircle, X, Send } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  fetchDoctorAppointmentsApi,
  confirmAppointmentApi,
  rejectAppointmentApi,
  createConsultationApi,
  Appointment,
} from '../../services/appointmentsApi';

export const DoctorAppointmentsPage: React.FC = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Tab State: 'REQUESTED' | 'CONFIRMED' | 'ALL'
  const [activeTab, setActiveTab] = useState<'REQUESTED' | 'CONFIRMED' | 'ALL'>('REQUESTED');

  // Consultation Modal State
  const [selectedApptForConsult, setSelectedApptForConsult] = useState<Appointment | null>(null);
  const [symptoms, setSymptoms] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [treatmentPlan, setTreatmentPlan] = useState<string>('');
  const [submittingConsult, setSubmittingConsult] = useState<boolean>(false);

  const loadAppointments = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDoctorAppointmentsApi(token);
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assigned appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [token]);

  const handleConfirm = async (id: number) => {
    if (!token) return;
    setError(null);
    setSuccessMsg(null);
    try {
      await confirmAppointmentApi(token, id);
      setSuccessMsg('Appointment confirmed successfully. Notification sent to patient.');
      await loadAppointments();
    } catch (err: any) {
      setError(err.message || 'Failed to confirm appointment');
    }
  };

  const handleReject = async (id: number) => {
    if (!token) return;
    setError(null);
    setSuccessMsg(null);
    try {
      await rejectAppointmentApi(token, id);
      setSuccessMsg('Appointment declined.');
      await loadAppointments();
    } catch (err: any) {
      setError(err.message || 'Failed to decline appointment');
    }
  };

  const handleSaveConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedApptForConsult || !diagnosis.trim()) return;
    setSubmittingConsult(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await createConsultationApi(token, selectedApptForConsult.id, {
        symptoms: symptoms.trim() || undefined,
        diagnosis: diagnosis.trim(),
        notes: notes.trim() || undefined,
        treatment_plan: treatmentPlan.trim() || undefined,
      });
      setSuccessMsg('Consultation recorded! Health Record created & Patient notified.');
      setSelectedApptForConsult(null);
      setSymptoms('');
      setDiagnosis('');
      setNotes('');
      setTreatmentPlan('');
      await loadAppointments();
    } catch (err: any) {
      setError(err.message || 'Failed to record consultation');
    } finally {
      setSubmittingConsult(false);
    }
  };

  const filteredAppts = appointments.filter((a) => {
    if (activeTab === 'REQUESTED') return a.status === 'REQUESTED';
    if (activeTab === 'CONFIRMED') return a.status === 'CONFIRMED';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="success">Confirmed</Badge>;
      case 'REQUESTED':
        return <Badge variant="warning">Pending Approval</Badge>;
      case 'COMPLETED':
        return <Badge variant="teal">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="neutral">Cancelled by Patient</Badge>;
      case 'REJECTED':
        return <Badge variant="error">Declined</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-tealhealth-700 via-tealhealth-600 to-health-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-teal-100 border border-white/20 mb-2">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor Clinical Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Appointment & Consultation Manager</h1>
            <p className="text-xs text-teal-100 mt-1">
              Review patient appointment requests, manage your clinical schedule, and record consultation notes.
            </p>
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

      {/* Main List */}
      <Card title="Assigned Patient Appointments" subtitle="Manage incoming booking requests and conduct consultations">
        {/* Tab Filters */}
        <div className="flex space-x-2 border-b border-slate-200 pb-3 mb-4">
          <button
            onClick={() => setActiveTab('REQUESTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'REQUESTED'
                ? 'bg-tealhealth-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending Requests ({appointments.filter((a) => a.status === 'REQUESTED').length})
          </button>
          <button
            onClick={() => setActiveTab('CONFIRMED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'CONFIRMED'
                ? 'bg-tealhealth-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Confirmed Schedule ({appointments.filter((a) => a.status === 'CONFIRMED').length})
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'ALL'
                ? 'bg-tealhealth-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Appointments ({appointments.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-tealhealth-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Loading assigned appointments...</p>
          </div>
        ) : filteredAppts.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No Appointments Found</h3>
            <p className="text-xs text-slate-500">There are no appointments matching the selected filter tab.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppts.map((appt) => {
              const isPending = appt.status === 'REQUESTED';
              const isConfirmed = appt.status === 'CONFIRMED';
              const isCompleted = appt.status === 'COMPLETED';

              return (
                <div
                  key={appt.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:border-tealhealth-300 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-tealhealth-50 border border-tealhealth-200 text-tealhealth-700 flex items-center justify-center font-bold text-sm">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{appt.patient_name}</h3>
                        <p className="text-xs text-slate-500">Patient ID #{appt.patient_user_id}</p>
                      </div>
                    </div>
                    <div>{getStatusBadge(appt.status)}</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Date: <strong className="text-slate-800">{appt.appointment_date}</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Time: <strong className="text-slate-800">{appt.appointment_time}</strong></span>
                    </div>
                  </div>

                  {appt.reason && (
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-500 text-[11px] block">PATIENT REASON / SYMPTOMS</span>
                      <p className="mt-0.5 text-slate-700">{appt.reason}</p>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400 font-mono">Appt ID #{appt.id}</span>
                    <div className="flex items-center space-x-2">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleReject(appt.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition flex items-center space-x-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                          <button
                            onClick={() => handleConfirm(appt.id)}
                            className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm Booking</span>
                          </button>
                        </>
                      )}

                      {isConfirmed && (
                        <button
                          onClick={() => {
                            setSelectedApptForConsult(appt);
                            setDiagnosis('');
                            setSymptoms(appt.reason || '');
                            setNotes('');
                            setTreatmentPlan('');
                          }}
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-tealhealth-600 hover:bg-tealhealth-700 rounded-lg shadow-xs transition flex items-center space-x-1"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Conduct Consultation & Add Notes</span>
                        </button>
                      )}

                      {isCompleted && appt.consultation_id && (
                        <Link
                          to={`/consultations/${appt.consultation_id}`}
                          className="px-3.5 py-1.5 text-xs font-semibold text-tealhealth-700 bg-tealhealth-50 hover:bg-tealhealth-100 rounded-lg transition flex items-center space-x-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Consultation Record</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Consultation Modal */}
      {selectedApptForConsult && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-tealhealth-100 text-tealhealth-800 flex items-center justify-center font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Clinical Consultation Entry</h3>
                  <p className="text-xs text-slate-500">Patient: {selectedApptForConsult.patient_name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApptForConsult(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConsultation} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Symptoms</label>
                <input
                  type="text"
                  placeholder="e.g. High blood pressure, mild dizziness, chest discomfort"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Essential Hypertension (Stage 1)"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Physician Clinical Notes</label>
                <textarea
                  rows={3}
                  placeholder="Detailed clinical findings, physical assessment results, vital signs..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Treatment Plan & Follow-up Advice</label>
                <textarea
                  rows={3}
                  placeholder="Prescribed advice, dietary recommendations, follow-up visit in 2 weeks..."
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-[11px] text-emerald-800 space-y-1">
                <span className="font-semibold block">Automatic Health Wallet Integrations:</span>
                <p>1. Appointment status updated to <strong>COMPLETED</strong>.</p>
                <p>2. Permanent <strong>Health Record</strong> generated in Patient Timeline.</p>
                <p>3. In-App Notification sent to patient.</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedApptForConsult(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingConsult || !diagnosis.trim()}
                  className="px-5 py-2 text-xs text-white bg-tealhealth-600 hover:bg-tealhealth-700 rounded-lg font-semibold shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submittingConsult ? 'Saving Record...' : 'Complete & Generate Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
