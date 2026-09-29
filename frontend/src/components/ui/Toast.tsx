import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export interface ToastProps {
  id?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  onClose?: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (!duration || !onClose) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-health-600 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
    error: 'border-rose-200 bg-rose-50/90 text-rose-900',
    warning: 'border-amber-200 bg-amber-50/90 text-amber-900',
    info: 'border-health-200 bg-health-50/90 text-health-900',
  };

  return (
    <div className={`flex items-start p-4 rounded-lg border shadow-md max-w-sm w-full transition-all ${borders[type]}`}>
      {icons[type]}
      <div className="ml-3 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {message && <p className="text-xs opacity-90 mt-0.5">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600 p-1">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
