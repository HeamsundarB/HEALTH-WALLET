import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, CheckCircle, Save, Plus, UserPlus, AlertCircle, MapPin, Phone, Mail, Clock, Layers, Stethoscope } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  fetchOwnHospitalProfileApi,
  updateOwnHospitalProfileApi,
  addHospitalDepartmentApi,
  assignDoctorToHospitalApi,
  HospitalProfile,
} from '../../services/providerApi';

export const HospitalProfileManagePage: React.FC = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [addingDept, setAddingDept] = useState<boolean>(false);
  const [assigningDoc, setAssigningDoc] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Editable Hospital Fields
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [locationCity, setLocationCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [workingHours, setWorkingHours] = useState<string>('');
  const [servicesSummary, setServicesSummary] = useState<string>('');

  // New Department Form
  const [newDeptName, setNewDeptName] = useState<string>('');
  const [newDeptDesc, setNewDeptDesc] = useState<string>('');

  // Doctor Assignment Form
  const [doctorProfId, setDoctorProfId] = useState<string>('');
  const [deptForDoc, setDeptForDoc] = useState<string>('');

  const loadProfile = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOwnHospitalProfileApi(token);
      setProfile(data);
      setName(data.name || '');
      setAddress(data.address || '');
      setLocationCity(data.location_city || '');
      setState(data.state || '');
      setContactEmail(data.contact_email || '');
      setContactPhone(data.contact_phone || '');
      setWorkingHours(data.working_hours || '');
      setServicesSummary(data.services_summary || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load hospital profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [token]);

  const handleSaveHospitalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await updateOwnHospitalProfileApi(token, {
        name,
        address,
        location_city: locationCity,
        state,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        working_hours: workingHours,
        services_summary: servicesSummary,
      });
      setProfile(updated);
      setSuccessMsg('Hospital details updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update hospital details');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newDeptName.trim()) return;
    setAddingDept(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await addHospitalDepartmentApi(token, {
        name: newDeptName.trim(),
        description: newDeptDesc.trim() || undefined,
      });
      setNewDeptName('');
      setNewDeptDesc('');
      setSuccessMsg('New department added successfully!');
      await loadProfile();
    } catch (err: any) {
      setError(err.message || 'Failed to add department');
    } finally {
      setAddingDept(false);
    }
  };

  const handleAssignDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !doctorProfId.trim()) return;
    setAssigningDoc(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await assignDoctorToHospitalApi(token, {
        doctor_professional_id: doctorProfId.trim(),
        department_name: deptForDoc.trim() || undefined,
      });
      setDoctorProfId('');
      setDeptForDoc('');
      setSuccessMsg(res.message || 'Doctor affiliated successfully with hospital!');
      await loadProfile();
    } catch (err: any) {
      setError(err.message || 'Failed to assign doctor');
    } finally {
      setAssigningDoc(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
        <div className="animate-spin w-6 h-6 border-2 border-tealhealth-600 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-xs text-slate-500">Loading hospital administration profile...</p>
      </div>
    );
  }

  const isVerified = profile?.verification_status === 'VERIFIED';

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-tealhealth-700 via-tealhealth-600 to-health-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-teal-100 border border-white/20 mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Hospital Administrator Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Hospital Profile & Operations Manager</h1>
            <p className="text-xs text-teal-100 mt-1">
              Manage hospital details, specialty departments, and doctor affiliations.
            </p>
          </div>
          {isVerified ? (
            <Badge variant="success">
              <CheckCircle className="w-3.5 h-3.5 mr-1 inline" />
              Verified Facility
            </Badge>
          ) : (
            <Badge variant="warning">Verification Pending</Badge>
          )}
        </div>
      </div>

      {/* Verification & Registration Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <ShieldCheck className={`w-8 h-8 ${isVerified ? 'text-emerald-600' : 'text-amber-500'} shrink-0 mt-0.5`} />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-800">Hospital Official Registration</h3>
              <span className="font-mono text-xs text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {profile?.registration_number}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Status: <strong className={isVerified ? 'text-emerald-700' : 'text-amber-700'}>{profile?.verification_status}</strong>
            </p>
          </div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Affiliations Overview:</span> {profile?.affiliated_doctors_count || 0} Physicians & {profile?.departments.length || 0} Specialty Departments
        </div>
      </div>

      {/* Toast Banners */}
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

      {/* Main Form: Hospital Information */}
      <Card title="Hospital Facility Details" subtitle="Update public contact info, address, working hours, and services">
        <form onSubmit={handleSaveHospitalInfo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital / Medical Center Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City Location</label>
              <input
                type="text"
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State / Province</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone Number</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Working / Operating Hours</label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="e.g. 24x7 Emergency Services, OPD: Mon-Sat 08:00 AM - 08:00 PM"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500 font-mono text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Services & Clinical Overview Summary</label>
              <textarea
                rows={3}
                value={servicesSummary}
                onChange={(e) => setServicesSummary(e.target.value)}
                placeholder="Key clinical specialties, ICU capacity, trauma care facilities, etc."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs text-white bg-tealhealth-600 hover:bg-tealhealth-700 rounded-lg font-semibold shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating Details...' : 'Save Hospital Details'}</span>
            </button>
          </div>
        </form>
      </Card>

      {/* Section 2: Department Management & Doctor Affiliation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Management */}
        <Card title="Add Specialty Department" subtitle="Create clinical departments (e.g., Cardiology, ICU)">
          <form onSubmit={handleAddDepartment} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Cardiology"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Cardiac ICUs, Cath Labs & Interventional Procedures"
                value={newDeptDesc}
                onChange={(e) => setNewDeptDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500"
              />
            </div>

            <button
              type="submit"
              disabled={addingDept || !newDeptName.trim()}
              className="w-full py-2 px-3 text-xs text-white bg-slate-800 hover:bg-slate-900 rounded-lg font-semibold transition flex items-center justify-center space-x-1 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{addingDept ? 'Adding...' : 'Add Department'}</span>
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Current Departments ({profile?.departments.length})</span>
            {profile?.departments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No departments created yet.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {profile?.departments.map((dept) => (
                  <div key={dept.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="font-semibold text-slate-800 text-xs flex items-center justify-between">
                      <span>{dept.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">ID #{dept.id}</span>
                    </div>
                    {dept.description && <p className="text-[11px] text-slate-500 mt-0.5">{dept.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Doctor Affiliation Form */}
        <Card title="Affiliate Doctor to Hospital" subtitle="Link a registered physician using their Professional ID">
          <form onSubmit={handleAssignDoctor} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Professional ID *</label>
              <div className="relative">
                <Stethoscope className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. DOC-1001"
                  value={doctorProfId}
                  onChange={(e) => setDoctorProfId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-semibold text-slate-800 uppercase focus:ring-2 focus:ring-tealhealth-500"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Enter the exact registration code (e.g. DOC-1001) provided by the doctor.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assign to Department (Optional)</label>
              <select
                value={deptForDoc}
                onChange={(e) => setDeptForDoc(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 bg-white"
              >
                <option value="">General Facility (Unassigned)</option>
                {profile?.departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={assigningDoc || !doctorProfId.trim()}
              className="w-full py-2 px-3 text-xs text-white bg-tealhealth-600 hover:bg-tealhealth-700 rounded-lg font-semibold transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{assigningDoc ? 'Affiliating Doctor...' : 'Affiliate Physician'}</span>
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-700 block mb-1">Affiliation Rule:</span>
            <p className="text-[11px] text-slate-500">
              Affiliated doctors will show your hospital in their directory profiles and gain hospital contextual access to consents.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
