import React, { useState } from 'react';
import { useHealthWallet } from '../context/HealthWalletContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Wallet, Shield, Globe, Bell, User, ChevronDown, Check, 
  Stethoscope, Building2, FlaskConical, Pill, ShieldCheck, 
  Eye, Menu, X, LogOut 
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { currentRole, setCurrentRole, notifications, markNotificationRead, patientProfile } = useHealthWallet();
  const { language, toggleLanguage, t } = useLanguage();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roles = [
    { id: 'patient', label: t('patient'), icon: <User className="w-4 h-4 text-teal-600" />, desc: 'Karthika R. (HW-8842-9910-TN)' },
    { id: 'doctor', label: t('doctor'), icon: <Stethoscope className="w-4 h-4 text-sky-600" />, desc: 'Dr. Arunkumar (Cardiology)' },
    { id: 'hospital', label: t('hospital'), icon: <Building2 className="w-4 h-4 text-indigo-600" />, desc: 'Kauvery Hospital Chennai' },
    { id: 'lab', label: t('lab'), icon: <FlaskConical className="w-4 h-4 text-purple-600" />, desc: 'Nalam Diagnostics Lab' },
    { id: 'pharmacy', label: t('pharmacy'), icon: <Pill className="w-4 h-4 text-emerald-600" />, desc: 'Sri Amudha Pharmacy' },
    { id: 'admin', label: t('admin'), icon: <ShieldCheck className="w-4 h-4 text-rose-600" />, desc: 'Platform System Security' },
  ];

  const currentRoleObj = roles.find(r => r.id === currentRole) || roles[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">{t('appTitle')}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-100 text-teal-800 rounded-full border border-teal-200">
                  {t('sihTag')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-white text-xs font-semibold text-slate-700 transition-all shadow-sm"
              title="Toggle Language / மொழியை மாற்று"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>{language === 'en' ? 'ENGLISH | தமிழ்' : 'தமிழ் | ENGLISH'}</span>
            </button>

            {/* Quick Access "Who Viewed My Records" Badge for Patients */}
            {currentRole === 'patient' && (
              <button
                onClick={() => setActiveTab('whoviewed')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 text-xs font-bold transition-all"
              >
                <Eye className="w-3.5 h-3.5 text-sky-600" />
                <span>{t('whoViewedMyRecords')}</span>
              </button>
            )}

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-sm transition-all"
              >
                {currentRoleObj.icon}
                <span className="hidden sm:inline">{currentRoleObj.label}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('roleSwitch')}</p>
                  </div>
                  {roles.map(r => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setCurrentRole(r.id);
                        setActiveTab('dashboard');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-start gap-3 px-4 py-2.5 text-left text-xs hover:bg-teal-50/50 transition-colors ${currentRole === r.id ? 'bg-teal-50/80 font-bold' : ''}`}
                    >
                      <div className="mt-0.5">{r.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{r.label}</span>
                          {currentRole === r.id && <Check className="w-3.5 h-3.5 text-teal-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500">{r.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-slate-600 transition-all"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-fade-in">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t('notifications')}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">{unreadCount} unread</span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-xs text-center text-slate-400">No new notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3.5 text-xs hover:bg-slate-50 transition-colors cursor-pointer ${!n.read ? 'bg-teal-50/40' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900">{n.title}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                          </div>
                          <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Patient HW ID Pill */}
            {currentRole === 'patient' && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs font-mono font-bold">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>{patientProfile.hwId}</span>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
