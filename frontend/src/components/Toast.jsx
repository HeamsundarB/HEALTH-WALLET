import React from 'react';
import { useHealthWallet } from '../context/HealthWalletContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const Toast = () => {
  const { toast, setToast } = useHealthWallet();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
  };

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-950',
    warning: 'bg-amber-50 border-amber-200 text-amber-950',
    info: 'bg-sky-50 border-sky-200 text-sky-950',
    error: 'bg-rose-50 border-rose-200 text-rose-950'
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-bounce-short">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md ${bgColors[toast.type] || bgColors.info}`}>
        {icons[toast.type] || icons.info}
        <p className="text-sm font-medium pr-2 leading-relaxed">{toast.message}</p>
        <button 
          onClick={() => setToast(null)}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
