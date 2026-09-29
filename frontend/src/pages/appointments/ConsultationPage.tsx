import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Stethoscope, User, Calendar, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { fetchConsultationByIdApi, Consultation } from '../../services/appointmentsApi';

export const ConsultationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    setError(null);
    fetchConsultationByIdApi(token, parseInt(id))
      .then(setConsultation)
      .catch((err) => setError(err.message || 'Failed to load consultation record'))
      .finally(() => setLoading(false));
  }, [token, id]);

  if (loading) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
        <div className="animate-spin w-6 h-6 border-2 border-tealhealth-600 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-xs text-slate-500">Loading consultation record...</p>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
        <p className="text-xs text-red-700 font-semibold">{error || 'Consultation record not found.'}</p>
        <Link to="/appointments" className="inline-flex items-center space-x-1 text-xs text-red-800 underline font-bold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Appointments</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-tealhealth-700 via-tealhealth-600 to-health-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/appointments" className="inline-flex items-center space-x-1 text-teal-100 hover:text-white text-xs mb-2 transition">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Appointments</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">Clinical Consultation Summary</h1>
            <p className="text-xs text-teal-100 mt-1">
              Official medical diagnosis, clinical notes, and treatment instructions.
            </p>
          </div>
          <Badge variant="success">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" />
            Verified Record
          </Badge>
        </div>
      </div>

      <Card title={`Diagnosis: ${consultation.diagnosis}`} subtitle={`Consultation Date: ${consultation.consultation_date}`}>
        <div className="space-y-5 text-xs text-slate-700">
          {/* Metadata Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-tealhealth-100 text-tealhealth-800 flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Attending Physician</span>
                <span className="font-bold text-slate-800 text-sm">{consultation.doctor_name}</span>
                {consultation.specialization && (
                  <p className="text-tealhealth-700 font-medium text-xs">{consultation.specialization}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-health-100 text-health-800 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Patient Record</span>
                <span className="font-bold text-slate-800 text-sm">{consultation.patient_name}</span>
                <p className="text-slate-500 text-xs">User ID #{consultation.patient_user_id}</p>
              </div>
            </div>
          </div>

          {/* Clinical Details */}
          {consultation.symptoms && (
            <div>
              <span className="font-semibold block text-slate-500 text-[11px] mb-1">PATIENT REPORTED SYMPTOMS</span>
              <p className="bg-amber-50/60 p-3 rounded-lg border border-amber-200/80 text-amber-900 leading-relaxed font-medium">
                {consultation.symptoms}
              </p>
            </div>
          )}

          <div>
            <span className="font-semibold block text-slate-500 text-[11px] mb-1">CLINICAL DIAGNOSIS</span>
            <p className="bg-tealhealth-50/70 p-3 rounded-lg border border-tealhealth-200 text-tealhealth-950 font-bold text-sm">
              {consultation.diagnosis}
            </p>
          </div>

          {consultation.notes && (
            <div>
              <span className="font-semibold block text-slate-500 text-[11px] mb-1">PHYSICIAN CLINICAL NOTES</span>
              <p className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 leading-relaxed text-slate-800">
                {consultation.notes}
              </p>
            </div>
          )}

          {consultation.treatment_plan && (
            <div>
              <span className="font-semibold block text-slate-500 text-[11px] mb-1">TREATMENT PLAN & INSTRUCTIONS</span>
              <p className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200 text-emerald-950 leading-relaxed font-medium">
                {consultation.treatment_plan}
              </p>
            </div>
          )}

          {/* Health Record Link */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Automatically saved to Health Wallet Timeline as a permanent Consultation Record.</span>
            </div>

            <Link
              to="/records"
              className="px-4 py-2 bg-health-600 text-white rounded-lg text-xs font-semibold hover:bg-health-700 transition flex items-center justify-center space-x-1.5 shrink-0"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View in Medical Records</span>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
