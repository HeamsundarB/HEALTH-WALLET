import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Shield, KeyRound, CheckCircle2, Info } from 'lucide-react';
import { verifyOtpApi } from '../../services/authApi';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const OtpVerifyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { userId?: number; email?: string; simulatedOtpCode?: string } | undefined;

  const [otpCode, setOtpCode] = useState(state?.simulatedOtpCode || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const userId = state?.userId || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await verifyOtpApi(userId, otpCode);
      setSuccess('Simulated OTP verified successfully! Account is ready for login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
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
        <p className="text-xs text-slate-500">Simulated 6-Digit OTP Verification</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg border-slate-200">
          <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Verify OTP</h3>
            <Badge variant="warning">Simulation Only</Badge>
          </div>

          {/* Prototype Banner Notice */}
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">PROTOTYPE SIMULATION NOTICE:</span> No real SMS or email is sent. The 6-digit test code is pre-filled or logged in dev output for testing.
            </div>
          </div>

          {state?.simulatedOtpCode && (
            <div className="mb-4 p-3 bg-health-50 border border-health-200 text-health-900 rounded-lg text-xs font-mono text-center">
              Dev Simulation Test Code: <span className="font-bold text-base text-health-700">{state.simulatedOtpCode}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="6-Digit OTP Code"
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
              leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Verify OTP Code
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <Link to="/login" className="font-semibold text-health-600 hover:text-health-700">
              Return to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
