import React, { useState, useEffect } from 'react';
import { Stethoscope, ShieldCheck, CheckCircle, Clock, Save, AlertCircle, Building2, User, Award, Globe } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { fetchOwnDoctorProfileApi, updateOwnDoctorProfileApi, DoctorProfile } from '../../services/providerApi';

export const DoctorProfileManagePage: React.FC = () => {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [specialization, setSpecialization] = useState<string>('');
  const [qualification, setQualification] = useState<string>('');
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [languages, setLanguages] = useState<string>('');
  const [consultationType, setConsultationType] = useState<string>('IN_PERSON');
  const [availabilityInfo, setAvailabilityInfo] = useState<string>('');
  const [bio, setBio] = useState<string>('');

  const loadProfile = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOwnDoctorProfileApi(token);
      setProfile(data);
      setSpecialization(data.specialization || '');
      setQualification(data.qualification || '');
      setExperienceYears(data.experience_years || 0);
      setLanguages(data.languages || '');
      setConsultationType(data.consultation_type || 'IN_PERSON');
      setAvailabilityInfo(data.availability_info || '');
      setBio(data.bio || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [token]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await updateOwnDoctorProfileApi(token, {
        specialization,
        qualification,
        experience_years: Number(experienceYears),
        languages,
        consultation_type: consultationType,
        availability_info: availabilityInfo,
        bio,
      });
      setProfile(updated);
      setSuccessMsg('Doctor profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
        <div className="animate-spin w-6 h-6 border-2 border-tealhealth-600 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-xs text-slate-500">Loading physician profile...</p>
      </div>
    );
  }

  const isVerified = profile?.credential?.verification_status === 'VERIFIED';

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-tealhealth-700 via-tealhealth-600 to-health-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-teal-100 border border-white/20 mb-2">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor Portal Settings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Physician Profile Management</h1>
            <p className="text-xs text-teal-100 mt-1">
              Manage your public clinical details, consultation preferences, and schedule information.
            </p>
          </div>
          {isVerified ? (
            <Badge variant="success">
              <CheckCircle className="w-3.5 h-3.5 mr-1 inline" />
              Verified Physician
            </Badge>
          ) : (
            <Badge variant="warning">Verification Pending</Badge>
          )}
        </div>
      </div>

      {/* Verification Status Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <ShieldCheck className={`w-8 h-8 ${isVerified ? 'text-emerald-600' : 'text-amber-500'} shrink-0 mt-0.5`} />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-800">Medical Registration & ID</h3>
              <span className="font-mono text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {profile?.credential?.professional_id || 'DOC-UNASSIGNED'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Credential Status: <strong className={isVerified ? 'text-emerald-700' : 'text-amber-700'}>{profile?.credential?.verification_status || 'PENDING'}</strong>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Summary: {profile?.credential?.qualification_summary || 'Standard physician registration submitted.'}
            </p>
          </div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 min-w-[200px]">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Security Rule</span>
          Professional Registration ID and Verification status can only be updated by System Administrators.
        </div>
      </div>

      {/* Messages */}
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

      {/* Profile Form */}
      <Card title="Editable Clinical Profile Details" subtitle="Update your specialization, consultation mode, and availability">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name (Read-Only)</label>
              <input
                type="text"
                disabled
                value={profile?.full_name || user?.full_name || ''}
                className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-lg text-slate-600 cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (Read-Only)</label>
              <input
                type="text"
                disabled
                value={profile?.email || user?.email || ''}
                className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-lg text-slate-600 cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Cardiology, Orthopedics"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification Degree</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. MBBS, MD (Cardiology)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                min="0"
                max="70"
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Mode</label>
              <select
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500 bg-white"
              >
                <option value="IN_PERSON">In-Person Only</option>
                <option value="ONLINE">Online Video Consult Only</option>
                <option value="BOTH">Both (In-Person & Teleconsultation)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Languages Spoken</label>
              <input
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="e.g. English, Hindi, Marathi"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Availability Schedule Info</label>
              <input
                type="text"
                value={availabilityInfo}
                onChange={(e) => setAvailabilityInfo(e.target.value)}
                placeholder="e.g. Mon-Fri 09:00 AM - 04:00 PM, Sat 10:00 AM - 01:00 PM"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500 font-mono text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Biography & Clinical Summary</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief professional description, clinical focus areas, and research achievements..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs text-white bg-tealhealth-600 hover:bg-tealhealth-700 rounded-lg font-semibold shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </Card>

      {/* Affiliated Hospitals Card */}
      <Card title="Affiliated Hospitals & Medical Centers" subtitle="Hospitals where your physician record is currently assigned">
        {profile?.affiliated_hospitals && profile.affiliated_hospitals.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.affiliated_hospitals.map((hospName, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700"
              >
                <Building2 className="w-4 h-4 text-tealhealth-600" />
                <span>{hospName}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No hospital affiliations assigned yet. Hospital Administrators can add you using your Professional ID ({profile?.credential?.professional_id}).</p>
        )}
      </Card>
    </div>
  );
};
