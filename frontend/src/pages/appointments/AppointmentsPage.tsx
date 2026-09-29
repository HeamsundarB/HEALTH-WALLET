import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Stethoscope, Building2, CheckCircle, XCircle, AlertCircle, Plus, FileText, Ban } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { fetchPatientAppointmentsApi, cancelAppointmentApi, Appointment } from '../../services/appointmentsApi';

export const AppointmentsPage: React.FC = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const loadAppointments = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPatientAppointmentsApi(token);
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [token]);

  const handleCancel = async (id: number) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to cancel this appointment request?')) return;
    setCancellingId(id);
    setError(null);
    setSuccessMsg(null);
    try {
      await cancelAppointmentApi(token, id);
      setSuccessMsg('Appointment cancelled successfully.');
      await loadAppointments();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="success">Confirmed</Badge>;
      case 'REQUESTED':
        return <Badge variant="warning">Pending Request</Badge>;
      case 'COMPLETED':
        return <Badge variant="teal">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="neutral">Cancelled</Badge>;
      case 'REJECTED':
        return <Badge variant="error">Declined</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-health-700 via-tealhealth-600 to-health-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-teal-100 border border-white/20 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Phase 7 Appointments & Consultations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">My Healthcare Appointments</h1>
            <p className="text-xs text-teal-100 mt-1">
              View upcoming physician visits, track booking statuses, and access clinical consultation notes.
            </p>
          </div>
          <Link
            to="/appointments/book"
            className="px-4 py-2.5 bg-white text-health-800 hover:bg-teal-50 font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </Link>
        </div>
      </div>

      {/* Alert Messages */}
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

      {/* Appointments List */}
      <Card title="Appointment History & Schedule" subtitle="Your active bookings, past consultations, and visit details">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-health-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No Appointments Scheduled</h3>
            <p className="text-xs text-slate-500">You currently have no active or previous appointment bookings.</p>
            <Link
              to="/appointments/book"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-health-600 text-white rounded-lg text-xs font-semibold hover:bg-health-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Book Appointment Now</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => {
              const canCancel = appt.status === 'REQUESTED' || appt.status === 'CONFIRMED';
              const isCompleted = appt.status === 'COMPLETED' && appt.consultation_id;

              return (
                <div
                  key={appt.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:border-health-300 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-health-50 border border-health-200 text-health-700 flex items-center justify-center font-bold text-sm">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{appt.doctor_name}</h3>
                        <p className="text-xs text-health-700 font-medium">{appt.specialization}</p>
                      </div>
                    </div>
                    <div>{getStatusBadge(appt.status)}</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Date: <strong className="text-slate-800">{appt.appointment_date}</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Time: <strong className="text-slate-800">{appt.appointment_time}</strong></span>
                    </div>
                    {appt.hospital_name && (
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Facility: <strong className="text-slate-800">{appt.hospital_name}</strong></span>
                      </div>
                    )}
                  </div>

                  {appt.reason && (
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-500 text-[11px] block">REASON FOR VISIT</span>
                      <p className="mt-0.5 text-slate-700">{appt.reason}</p>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400 font-mono">Appt ID #{appt.id}</span>
                    <div className="flex items-center space-x-2">
                      {isCompleted && (
                        <Link
                          to={`/consultations/${appt.consultation_id}`}
                          className="px-3 py-1.5 text-xs font-semibold text-tealhealth-700 bg-tealhealth-50 hover:bg-tealhealth-100 rounded-lg transition flex items-center space-x-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Consultation Notes</span>
                        </Link>
                      )}
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(appt.id)}
                          disabled={cancellingId === appt.id}
                          className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition flex items-center space-x-1 disabled:opacity-50"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>{cancellingId === appt.id ? 'Cancelling...' : 'Cancel Booking'}</span>
                        </button>
                      )}
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
