import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Calendar, Clock, Stethoscope, Building2, CheckCircle, ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { searchDoctorsApi, DoctorProfile } from '../../services/providerApi';
import { createAppointmentApi } from '../../services/appointmentsApi';

export const BookAppointmentPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDocId = searchParams.get('doctorId');

  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(preselectedDocId || '');
  const [appointmentDate, setAppointmentDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow's date default
  );
  const [appointmentTime, setAppointmentTime] = useState<string>('10:30 AM');
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    if (!token) return;
    searchDoctorsApi(token, {})
      .then((data) => {
        setDoctors(data);
        if (!selectedDoctorId && data.length > 0) {
          setSelectedDoctorId(data[0].id.toString());
        }
      })
      .catch((err) => setError(err.message || 'Failed to fetch doctor list'))
      .finally(() => setLoadingDocs(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedDoctorId) return;
    setSubmitting(true);
    setError(null);

    try {
      await createAppointmentApi(token, {
        doctor_profile_id: parseInt(selectedDoctorId),
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        reason: reason.trim() || undefined,
      });
      navigate('/appointments');
    } catch (err: any) {
      setError(err.message || 'Failed to schedule appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDoctorObj = doctors.find((d) => d.id.toString() === selectedDoctorId);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-health-700 via-tealhealth-600 to-health-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/appointments" className="inline-flex items-center space-x-1 text-teal-100 hover:text-white text-xs mb-2 transition">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Appointments</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">Schedule Physician Visit</h1>
            <p className="text-xs text-teal-100 mt-1">
              Select a verified doctor, choose your preferred time slot, and confirm your booking request.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 font-bold">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-2">
          <Card title="Appointment Booking Form" subtitle="Fill in visit details to request a consultation slot">
            {loadingDocs ? (
              <div className="text-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-health-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-xs text-slate-500">Loading physician directory...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Physician *</label>
                  <select
                    required
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-health-500 bg-white font-medium text-slate-800"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.full_name} — {d.specialization} ({d.qualification})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date *</label>
                    <input
                      type="date"
                      required
                      value={appointmentDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-health-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Time Slot *</label>
                    <select
                      required
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-health-500 bg-white text-slate-800"
                    >
                      <option value="09:00 AM">09:00 AM (Morning Slot)</option>
                      <option value="10:30 AM">10:30 AM (Morning Slot)</option>
                      <option value="11:45 AM">11:45 AM (Late Morning)</option>
                      <option value="02:00 PM">02:00 PM (Afternoon Slot)</option>
                      <option value="04:30 PM">04:30 PM (Evening Slot)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Visit / Symptoms (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe your symptoms or reason for seeking consultation..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-health-500 text-slate-800"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                  <Link
                    to="/appointments"
                    className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting || !selectedDoctorId}
                    className="px-5 py-2 text-xs text-white bg-health-600 hover:bg-health-700 rounded-lg font-semibold shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Submitting Request...' : 'Send Booking Request'}</span>
                  </button>
                </div>
              </form>
            )}
          </Card>
        </div>

        {/* Doctor Summary Sidebar Card */}
        <div>
          <Card title="Selected Physician Profile" subtitle="Doctor details & consultation summary">
            {selectedDoctorObj ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-health-100 text-health-800 font-bold flex items-center justify-center text-lg">
                    {selectedDoctorObj.full_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{selectedDoctorObj.full_name}</h4>
                    <p className="text-health-700 font-semibold text-xs">{selectedDoctorObj.specialization}</p>
                  </div>
                </div>

                <div className="space-y-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">QUALIFICATION</span>
                    <span className="font-medium text-slate-800">{selectedDoctorObj.qualification} ({selectedDoctorObj.experience_years} yrs exp)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">CONSULTATION MODE</span>
                    <span className="capitalize font-medium text-slate-800">{selectedDoctorObj.consultation_type.toLowerCase()}</span>
                  </div>
                  {selectedDoctorObj.affiliated_hospitals.length > 0 && (
                    <div>
                      <span className="text-slate-400 font-semibold block text-[11px]">AFFILIATED HOSPITAL</span>
                      <span className="font-medium text-slate-800">{selectedDoctorObj.affiliated_hospitals[0]}</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700 block mb-1">In-App Notification Trigger:</span>
                  Submitting this booking sends an instant notification to Dr. {selectedDoctorObj.full_name} for confirmation.
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Select a doctor to view their profile details.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
