import { X, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useUI } from '../../context';

const STYLES = {
  success: {
    box: 'bg-emerald-950/95 text-emerald-50 border-emerald-700/60',
    icon: CheckCircle2,
    iconClass: 'text-emerald-400',
  },
  error: {
    box: 'bg-rose-950/95 text-rose-50 border-rose-700/70',
    icon: XCircle,
    iconClass: 'text-rose-400',
  },
  warning: {
    box: 'bg-amber-950/95 text-amber-50 border-amber-700/60',
    icon: AlertTriangle,
    iconClass: 'text-amber-400',
  },
  info: {
    box: 'bg-slate-900/95 text-white border-white/10',
    icon: Info,
    iconClass: 'text-sky-400',
  },
};

export default function Toast({ message }) {
  const { toasts = [], removeToast } = useUI();

  const activeToasts = toasts.length > 0
    ? toasts
    : message
    ? [{ id: 'legacy_toast', message, type: 'info' }]
    : [];

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col-reverse gap-2.5 items-end pointer-events-none max-w-sm w-full">
      {activeToasts.map((toast) => {
        const style = STYLES[toast.type] || STYLES.info;
        const Icon = style.icon;

        return (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-lg shadow-2xl border text-[13px] font-medium transition-all duration-300 animate-slide-up backdrop-blur-md max-w-sm w-auto ${style.box}`}
          >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${style.iconClass}`} />

            <div className="flex-1 leading-snug">
              <span>{toast.message}</span>
            </div>

            <button
              type="button"
              onClick={() => removeToast && removeToast(toast.id)}
              className="text-white/60 hover:text-white p-0.5 -mr-1 -mt-0.5 transition cursor-pointer"
              title="Đóng thông báo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
