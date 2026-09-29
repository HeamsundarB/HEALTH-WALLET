import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { registerApi } from '../../services/authApi';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const roleOptions = [
  { label: 'Patient (Personal Wallet)', value: 'PATIENT' },
  { label: 'Doctor (Physician Portal)', value: 'DOCTOR' },
  { label: 'Hospital Admin (Facility Admin)', value: 'HOSPITAL_ADMIN' },
  { label: 'Hospital Staff (Clinical Staff)', value: 'HOSPITAL_STAFF' },
  { label: 'Lab (Diagnostic Center)', value: 'LAB' },
  { label: 'Pharmacy (Medication Refill)', value: 'PHARMACY' },
  { label: 'Blood Bank (Emergency Inventory)', value: 'BLOOD_BANK' },
  { label: 'System Admin (Platform Admin)', value: 'SYSTEM_ADMIN' },
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await registerApi({
        email,
        password,
        full_name: fullName,
        phone_number: phoneNumber,
        role,
      });

      // Navigate to simulated OTP verification page
      navigate('/verify-otp', {
        state: {
          userId: res.user_id,
          email: email,
          simulatedOtpCode: res.simulated_otp_code,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex p-3 bg-gradient-to-tr from-health-600 to-tealhealth-500 rounded-2xl text-white shadow-md shadow-health-200">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">HEALTH WALLET</h2>
        <p className="text-xs text-slate-500">Synthetic Account Registration Shell</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg border-slate-200">
          <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Create Account</h3>
            <Badge variant="teal">Phase 1 Scope</Badge>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Synthetic User Name"
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@medimind.demo"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="Phone Number (Synthetic)"
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 00000 00000"
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
            />

            <Select
              label="Target Role"
              options={roleOptions}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Simulated OTP
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Already have an account? </span>
            <Link to="/login" className="font-semibold text-health-600 hover:text-health-700">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
