import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Stethoscope,
  Building2,
  FlaskConical,
  Pill,
  Droplet,
  ShieldAlert,
  User,
  FileText,
  FileSpreadsheet,
  Calendar,
  MessageSquare,
  Settings,
  KeyRound,
  ShieldCheck,
  X,
  Bell,
  Activity,
  UserCheck,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const roles = user?.roles || [];

  const roleNavItems = [
    { title: 'Patient Dashboard', href: '/dashboard', icon: LayoutDashboard, role: 'PATIENT' },
    { title: 'Doctor Dashboard', href: '/doctor/dashboard', icon: Stethoscope, role: 'DOCTOR' },
    { title: 'Hospital Dashboard', href: '/hospital/dashboard', icon: Building2, role: 'HOSPITAL_ADMIN' },
    { title: 'Lab Dashboard', href: '/lab/dashboard', icon: FlaskConical, role: 'LAB' },
    { title: 'Pharmacy Dashboard', href: '/pharmacy/dashboard', icon: Pill, role: 'PHARMACY' },
    { title: 'Blood Bank Dashboard', href: '/blood-bank/dashboard', icon: Droplet, role: 'BLOOD_BANK' },
    { title: 'Admin Dashboard', href: '/admin/dashboard', icon: ShieldAlert, role: 'SYSTEM_ADMIN' },
  ];

  // Ecosystem & Appointments Navigation Items
  const isDoctor = roles.includes('DOCTOR');
  const isHospitalAdmin = roles.includes('HOSPITAL_ADMIN') || roles.includes('HOSPITAL_STAFF');
  const isSystemAdmin = roles.includes('SYSTEM_ADMIN');

  const ecosystemNavItems = [
    { title: 'Doctor Directory', href: '/doctors', icon: Stethoscope },
    { title: 'Hospital Directory', href: '/hospitals', icon: Building2 },
    ...(isDoctor
      ? [
          { title: 'Doctor Appointments', href: '/doctor/appointments', icon: Calendar },
          { title: 'Physician Profile Settings', href: '/doctor/profile/manage', icon: UserCheck },
        ]
      : []),
    ...(isHospitalAdmin ? [{ title: 'Hospital Operations', href: '/hospital/profile/manage', icon: ClipboardList }] : []),
    ...(isSystemAdmin ? [{ title: 'Provider Verifications', href: '/admin/provider-verification', icon: ShieldCheck }] : []),
  ];

  const genericNavItems = [
    { title: 'Profile Shell', href: '/profile', icon: User },
    { title: 'Medical Records', href: '/records', icon: FileText },
    { title: 'Consent & Access', href: '/consents', icon: KeyRound },
    { title: 'Notifications', href: '/notifications', icon: Bell },
    { title: 'Secure Chat', href: '/chat', icon: MessageSquare },
    { title: 'Access Activity', href: '/access-activity', icon: Activity },
    { title: 'Appointments', href: '/appointments', icon: Calendar },
    { title: 'Medications', href: '/medications', icon: Pill },
    { title: 'Prescriptions', href: '/prescriptions', icon: FileText },
    { title: 'Reports', href: '/reports', icon: FileSpreadsheet },
    { title: 'Messages', href: '/messages', icon: MessageSquare },
    { title: 'Settings', href: '/settings', icon: Settings },
  ];

  const visibleRoleItems = roleNavItems.filter(
    (item) => isSystemAdmin || roles.includes(item.role) || (item.role === 'HOSPITAL_ADMIN' && roles.includes('HOSPITAL_STAFF'))
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-health-600" />
            <span className="font-bold text-slate-800 text-sm">HEALTH WALLET</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 custom-scrollbar">
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Role Dashboard Access
            </div>
            <div className="space-y-1">
              {visibleRoleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-health-50 text-health-700 border-l-4 border-health-600 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.title}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Ecosystem & Appointments
            </div>
            <div className="space-y-1">
              {ecosystemNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-tealhealth-50 text-tealhealth-700 border-l-4 border-tealhealth-600 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 text-tealhealth-600" />
                    <span>{item.title}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Patient Services & Timeline
            </div>
            <div className="space-y-1">
              {genericNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-health-50 text-health-700 border-l-4 border-health-600 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.title}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="p-3 bg-white border border-slate-200/80 rounded-lg text-[11px] text-slate-500">
            <p className="font-semibold text-slate-700 mb-1">HEALTH WALLET v0.7.0</p>
            <p>Phase 7 Appointments & Consultations</p>
            <p className="mt-1 text-[10px] text-health-600 font-medium">Team MEDIMIND</p>
          </div>
        </div>
      </aside>
    </>
  );
};
