import React, { useState, useEffect } from 'react';
import { User, Wallet, ShieldCheck, CheckCircle2, Save, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchPatientProfileApi, updatePatientProfileApi, PatientProfileData } from '../services/patientApi';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { Toast } from '../components/ui/Toast';

export const ProfilePage: React.FC = () => {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<PatientProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('PREFER_NOT_TO_SAY');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const loadProfile = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await fetchPatientProfileApi(token);
      setProfile(data);
      setDob(data.dob || '');
      setGender(data.gender || 'PREFER_NOT_TO_SAY');
      setAddress(data.address || '');
      setState(data.state || '');
      setBloodGroup(data.blood_group || 'O+');
      setEmergencyName(data.emergency_contact_name || '');
      setEmergencyPhone(data.emergency_contact_phone || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updatePatientProfileApi(token, {
        dob: dob || undefined,
        gender,
        address,
        state,
        blood_group: bloodGroup,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
      });
      setProfile(updated);
      setToastMessage('Patient profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading Patient Profile..." />;
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patient Profile & Wallet ID</h1>
          <p className="text-xs text-slate-500 mt-1">
            Phase 2 Demographic Foundation & Health Wallet ID Management
          </p>
        </div>
        <Badge variant="teal">Phase 2 Profile Shell</Badge>
      </div>

      {/* Prototype Notice */}
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">SYNTHETIC ID NOTICE:</span> The Health Wallet ID below is a synthetic prototype identifier. It is strictly non-governmental and not connected to ABHA or Aadhaar.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Health Wallet ID Card */}
        <Card className="lg:col-span-1 text-center" title="Health Wallet Identifier" subtitle="Synthetic Prototype Identifier">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-health-100 text-health-700 flex items-center justify-center font-bold text-2xl border-2 border-health-300">
              <User className="w-10 h-10" />
            </div>

            <h3 className="text-base font-bold text-slate-800">{profile?.full_name || user?.full_name}</h3>
            <p className="text-xs text-slate-500">{profile?.email || user?.email}</p>

            <div className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 mt-2">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Digital Health Wallet ID</p>
              <p className="text-base font-mono font-bold text-health-700 mt-1">
                {profile?.health_wallet_id || 'HW-2026-PENDING'}
              </p>
            </div>

            <Badge variant="info">Synthetic Demo Data</Badge>
          </div>
        </Card>

        {/* Right Column: Editable Profile Form */}
        <Card className="lg:col-span-2" title="Patient Demographics Form" subtitle="Editable basic profile fields backed by PostgreSQL">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name (Read-Only)" value={profile?.full_name || ''} readOnly disabled />
              <Input label="Email Address (Read-Only)" value={profile?.email || ''} readOnly disabled />

              <Input
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />

              <Select
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                options={[
                  { label: 'Prefer Not To Say', value: 'PREFER_NOT_TO_SAY' },
                  { label: 'Male', value: 'MALE' },
                  { label: 'Female', value: 'FEMALE' },
                  { label: 'Other', value: 'OTHER' },
                ]}
              />

              <Input
                label="State / Province"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Karnataka"
              />

              <Select
                label="Blood Group (Basic Field)"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                options={[
                  { label: 'O Positive (O+)', value: 'O+' },
                  { label: 'A Positive (A+)', value: 'A+' },
                  { label: 'B Positive (B+)', value: 'B+' },
                  { label: 'AB Positive (AB+)', value: 'AB+' },
                  { label: 'O Negative (O-)', value: 'O-' },
                  { label: 'A Negative (A-)', value: 'A-' },
                  { label: 'B Negative (B-)', value: 'B-' },
                  { label: 'AB Negative (AB-)', value: 'AB-' },
                ]}
              />

              <Input
                label="Emergency Contact Name"
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Name of Emergency Contact"
              />

              <Input
                label="Emergency Contact Phone"
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="+91 00000 00000"
              />
            </div>

            <Input
              label="Address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full Street Address"
            />

            <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={loadProfile}>
                Reset Changes
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                Save Profile
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50">
          <Toast
            title="Profile Updated"
            message={toastMessage}
            type="success"
            onClose={() => setToastMessage(null)}
          />
        </div>
      )}
    </div>
  );
};
