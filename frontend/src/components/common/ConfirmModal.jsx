import { useEffect } from 'react';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';
import { useUI } from '../../context/UIContext.jsx';

export default function ConfirmModal() {
  const { activeModal, modalPayload, closeModal } = useUI();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeModal === 'confirm_modal') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, closeModal]);

  if (activeModal !== 'confirm_modal') return null;

  const {
    title = 'Xác nhận thao tác',
    message = 'Bạn có chắc chắn muốn thực hiện thao tác này?',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy bỏ',
    confirmVariant = 'danger',
    onConfirm,
  } = modalPayload || {};

  const handleConfirm = () => {
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
    closeModal();
  };

  const isDanger = confirmVariant === 'danger';
  const isWarning = confirmVariant === 'warning';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-surface rounded-xl w-full max-w-[420px] shadow-2xl border border-line overflow-hidden text-ink animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-surface-2/40">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                isDanger
                  ? 'bg-rose-500/10 text-rose-600'
                  : isWarning
                  ? 'bg-amber-500/10 text-amber-600'
                  : 'bg-accent/10 text-accent'
              }`}
            >
              {isDanger || isWarning ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <HelpCircle className="w-5 h-5" />
              )}
            </div>
            <h3 className="text-[15px] font-bold text-ink">{title}</h3>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="w-7 h-7 rounded-md bg-surface border border-line hover:bg-surface-2 text-ink-muted flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-[13.5px] text-ink-muted leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-5 py-3.5 border-t border-line bg-surface-2/40 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 rounded-lg bg-surface border border-line hover:bg-surface-2 text-[12.5px] font-bold text-ink-muted transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg text-white text-[12.5px] font-bold shadow-xs transition cursor-pointer ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700'
                : isWarning
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-accent hover:bg-accent-hover'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
