import { X, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { useUI } from '../../context';

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
        const isError = toast.type === 'error' || toast.message?.toLowerCase().includes('lỗi') || toast.message?.toLowerCase().includes('thất bại');
        const isWarning = toast.type === 'warning' || toast.message?.toLowerCase().includes('gỡ') || toast.message?.toLowerCase().includes('chưa đạt');

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-lg shadow-2xl border text-[13px] font-medium transition-all duration-300 animate-slide-up backdrop-blur-md max-w-sm w-auto ${
              isError
                ? 'bg-rose-950/95 text-rose-100 border-rose-800/60'
                : isWarning
                ? 'bg-amber-950/95 text-amber-100 border-amber-800/60'
                : 'bg-slate-900/95 text-white border-white/10'
            }`}
          >
            {isError ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : isWarning ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            )}

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
