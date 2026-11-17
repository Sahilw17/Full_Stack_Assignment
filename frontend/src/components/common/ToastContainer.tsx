import React from 'react';
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { useDeals } from '../../context/DealContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useDeals();

  if (toasts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getBorder = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/40 bg-slate-950/95';
      case 'warning':
        return 'border-amber-500/40 bg-slate-950/95';
      case 'error':
        return 'border-rose-500/40 bg-slate-950/95';
      default:
        return 'border-cyan-500/40 bg-slate-950/95';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto border rounded-xl p-3.5 shadow-2xl backdrop-blur flex items-start justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200 ${getBorder(toast.type)}`}
        >
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5">{getIcon(toast.type)}</div>
            <div>
              <h5 className="text-xs font-bold text-white">{toast.title}</h5>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
            </div>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
