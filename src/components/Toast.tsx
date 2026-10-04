import React, { useEffect } from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-[#0f1d18]/90 border-emerald-500/50 text-emerald-200 shadow-glow-emerald',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce-short" />
        };
      case 'info':
        return {
          bg: 'bg-[#0f172a]/90 border-cyan-500/50 text-cyan-200 shadow-glow-cyan',
          icon: <Info className="w-5 h-5 text-cyan-400 shrink-0" />
        };
      case 'warning':
        return {
          bg: 'bg-[#1e1708]/90 border-amber-500/50 text-amber-200 shadow-glow-gold',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        };
      case 'error':
        return {
          bg: 'bg-[#1e0a0a]/90 border-red-500/50 text-red-200',
          icon: <XCircle className="w-5 h-5 text-red-400 shrink-0" />
        };
    }
  };

  const style = getStyle();

  return (
    <div
      className={`pointer-events-auto backdrop-blur-md border rounded-2xl p-3.5 flex items-start justify-between gap-3 shadow-2xl transition-all duration-300 transform translate-y-0 animate-slide-in-right ${style.bg}`}
    >
      <div className="flex items-start gap-2.5">
        {style.icon}
        <div>
          <h4 className="text-xs font-extrabold tracking-wide">{toast.title}</h4>
          <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">{toast.message}</p>
        </div>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
