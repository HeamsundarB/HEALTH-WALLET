import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Shield, Bell, User, Search, Activity, LogOut } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../notifications/NotificationBell';

export interface NavbarProps {
  onMobileMenuToggle: () => void;
  backendStatus?: 'ok' | 'error' | 'loading';
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle, backendStatus = 'loading' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const primaryRole = user?.roles?.[0] || 'GUEST';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs font-sans">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Mobile menu button & Brand */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-health-600 to-tealhealth-500 flex items-center justify-center text-white shadow-md shadow-health-200">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 tracking-tight text-lg">HEALTH WALLET</span>
                <Badge variant="teal" size="sm">Phase 1 Auth</Badge>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                MEDIMIND • One Patient. One Health Journey.
              </p>
            </div>
          </div>
        </div>

        {/* Global Search Bar Placeholder */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search foundation modules..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-health-500 focus:bg-white transition-all"
              readOnly
            />
          </div>
        </div>

        {/* Right Header Status, Profile & Logout */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50">
            <Activity className={`w-3.5 h-3.5 ${backendStatus === 'ok' ? 'text-emerald-500 animate-pulse' : backendStatus === 'error' ? 'text-rose-500' : 'text-amber-500'}`} />
            <span className="text-slate-600 font-medium">
              API: {backendStatus === 'ok' ? 'Online' : backendStatus === 'error' ? 'Offline' : 'Connecting...'}
            </span>
          </div>

          <NotificationBell />

          <div className="h-6 w-px bg-slate-200"></div>

          <div className="flex items-center space-x-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-health-100 text-health-700 flex items-center justify-center font-semibold text-xs border border-health-200">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-slate-800">{user?.full_name || 'Authenticated User'}</p>
              <p className="text-[10px] text-slate-500">{primaryRole}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
            title="Sign Out Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
