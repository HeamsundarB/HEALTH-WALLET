import React, { useState } from 'react';
import { useHealthWallet } from '../context/HealthWalletContext';
import { useLanguage } from '../context/LanguageContext';
import { Play, RotateCcw, ChevronRight, CheckCircle2, ShieldAlert, Sparkles, UserCheck, FileCheck, Stethoscope, Lock, Eye } from 'lucide-react';

export const DemoController = ({ activeTab, setActiveTab }) => {
  const { currentRole, setCurrentRole, resetDemoData, executeBreakGlass, addReport, showToast } = useHealthWallet();
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const demoSteps = [
    {
      id: 1,
      title: t('step1'),
      role: 'patient',
      tab: 'dashboard',
      action: () => {
        setCurrentRole('patient');
        setActiveTab('dashboard');
        showToast("Patient Logged In: Health Wallet ID HW-8842-9910-TN & Simulated Aadhaar Linked.", "info");
      },
      icon: <UserCheck className="w-4 h-4 text-emerald-600" />
    },
    {
      id: 2,
      title: t('step2'),
      role: 'patient',
      tab: 'reports',
      action: () => {
        setCurrentRole('patient');
        setActiveTab('reports');
        // Trigger duplicate report upload
        addReport({
          name: "HbA1c & Fasting Blood Sugar Report",
          date: "2026-02-14",
          source: "Cauvery Hospital Lab Upload",
          type: "Blood Test",
          verificationStatus: "Verified by Hospital"
        });
      },
      icon: <FileCheck className="w-4 h-4 text-sky-600" />
    },
    {
      id: 3,
      title: t('step3'),
      role: 'doctor',
      tab: 'doctor_patients',
      action: () => {
        setCurrentRole('doctor');
        setActiveTab('doctor_patients');
        showToast("Doctor Logged In: Dr. Arunkumar (TNC-MD-88219) accessing authorized patient profile.", "info");
      },
      icon: <Stethoscope className="w-4 h-4 text-purple-600" />
    },
    {
      id: 4,
      title: t('step4'),
      role: 'doctor',
      tab: 'doctor_emergency',
      action: () => {
        setCurrentRole('doctor');
        setActiveTab('doctor_emergency');
        executeBreakGlass({
          doctorName: "Dr. Arunkumar M.",
          hospital: "Kauvery Hospital ER",
          reason: "Emergency Trauma Unit — Acute chest pain evaluation",
          profId: "TNC-MD-88219"
        });
      },
      icon: <ShieldAlert className="w-4 h-4 text-rose-600" />
    },
    {
      id: 5,
      title: t('step5'),
      role: 'patient',
      tab: 'whoviewed',
      action: () => {
        setCurrentRole('patient');
        setActiveTab('whoviewed');
        showToast("Patient View: Inspected 'Who Viewed My Records?' transparency access log.", "info");
      },
      icon: <Eye className="w-4 h-4 text-teal-600" />
    }
  ];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white border-b border-teal-800/40 px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Title */}
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center p-1 bg-teal-500/20 text-teal-300 rounded-lg border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          </span>
          <div>
            <span className="font-bold tracking-wide text-teal-200 uppercase text-[10px] block">
              SIH 2026 Demonstration Controller
            </span>
            <span className="text-slate-300 font-medium">{t('demoWorkflow')}</span>
          </div>
        </div>

        {/* Step Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {demoSteps.map(step => (
            <button
              key={step.id}
              onClick={step.action}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-teal-900/60 border border-slate-700 hover:border-teal-500/50 rounded-lg text-slate-200 hover:text-white transition-all font-medium"
            >
              {step.icon}
              <span>{step.title}</span>
            </button>
          ))}
        </div>

        {/* Reset Button */}
        <button
          onClick={resetDemoData}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 rounded-lg text-rose-200 transition-all font-medium"
          title="Reset back to clean initial demo state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('resetDemo')}</span>
        </button>

      </div>
    </div>
  );
};
