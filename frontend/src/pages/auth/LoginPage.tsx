import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Key, Mail, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const roleDashboardMap: Record<string, string> = {
  PATIENT: '/dashboard',
  DOCTOR: '/doctor/dashboard',
  HOSPITAL_ADMIN: '/hospital/dashboard',
  HOSPITAL_STAFF: '/hospital/dashboard',
  LAB: '/lab/dashboard',
  PHARMACY: '/pharmacy/dashboard',
  BLOOD_BANK: '/blood-bank/dashboard',
  SYSTEM_ADMIN: '/admin/dashboard',
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(email, password);
      const primaryRole = user.roles[0] || 'PATIENT';
      const targetDashboard = roleDashboardMap[primaryRole] || '/dashboard';
      navigate(targetDashboard);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('DemoPassword123!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex p-3 bg-gradient-to-tr from-health-600 to-tealhealth-500 rounded-2xl text-white shadow-md shadow-health-200">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">HEALTH WALLET</h2>
        <p className="text-xs text-slate-500">Phase 1 Authentication & Role Access Portal</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg border-slate-200">
          <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Account Sign In</h3>
            <Badge variant="teal">Phase 1 Auth</Badge>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
              Sign In to Wallet
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Don't have a Phase 1 account? </span>
            <Link to="/register" className="font-semibold text-health-600 hover:text-health-700">
              Register New Account
            </Link>
          </div>
        </Card>

        {/* Demo Quick-Fill Buttons */}
        <div className="mt-6 bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
          <p className="font-semibold text-slate-700 flex items-center space-x-1">
            <UserCheck className="w-4 h-4 text-health-600" />
            <span>Synthetic Demo Accounts Quick-Fill</span>
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button onClick={() => fillDemoAccount('patient@medimind.demo')} className="p-1.5 bg-slate-50 border rounded text-left hover:bg-health-50 hover:text-health-700">
              Patient Demo
            </button>
            <button onClick={() => fillDemoAccount('doctor@medimind.demo')} className="p-1.5 bg-slate-50 border rounded text-left hover:bg-health-50 hover:text-health-700">
              Doctor Demo
            </button>
            <button onClick={() => fillDemoAccount('hospital.admin@medimind.demo')} className="p-1.5 bg-slate-50 border rounded text-left hover:bg-health-50 hover:text-health-700">
              Hospital Admin Demo
            </button>
            <button onClick={() => fillDemoAccount('admin@medimind.demo')} className="p-1.5 bg-slate-50 border rounded text-left hover:bg-health-50 hover:text-health-700">
              System Admin Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
