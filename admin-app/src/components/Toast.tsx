import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[300] flex flex-col space-y-2 pointer-events-none w-88 max-w-[92vw]">
      {toasts.map((toast) => {
        let borderClass = 'border-slate-200';
        let bgClass = 'bg-white';
        let icon = <Info className="w-5 h-5 text-sky-600 shrink-0" />;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-200';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-200';
          icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-200';
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-lg border ${borderClass} ${bgClass} flex items-start space-x-3 transition-all duration-200`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              {toast.title && <h5 className="text-xs font-bold text-slate-900">{toast.title}</h5>}
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
