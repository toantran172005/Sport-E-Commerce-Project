import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, X } from 'lucide-react';
import { useUI } from '../../context/UIContext.jsx';

/**
 * Hộp thoại hỏi khách vãng lai có muốn đăng nhập không (mở bằng useRequireLogin).
 * Chỉ chuyển sang /login khi người dùng bấm "Đăng nhập"; "Để sau"/đóng/Esc giữ nguyên trang hiện tại.
 */
export default function LoginRequiredModal() {
  const { activeModal, modalPayload, closeModal } = useUI();
  const navigate = useNavigate();
  const isOpen = activeModal === 'login_required_modal';

  const message = modalPayload?.message || 'Vui lòng đăng nhập để tiếp tục.';
  const redirect = modalPayload?.redirect || '/';
  const onCancel = modalPayload?.onCancel;

  const handleCancel = () => {
    closeModal();
    if (onCancel) onCancel();
  };

  const handleLogin = () => {
    closeModal();
    navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        if (onCancel) onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closeModal, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      onClick={handleCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-surface rounded-xl w-full max-w-[420px] shadow-2xl border border-line overflow-hidden text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <LogIn className="w-5 h-5" />
            </div>
            <h3 className="text-[15px] font-bold text-ink">Yêu cầu đăng nhập</h3>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Đóng"
            className="w-8 h-8 rounded-md bg-surface-2 hover:bg-surface-3 text-ink-muted hover:text-ink flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-1.5">
          <p className="text-[13.5px] text-ink leading-relaxed font-medium">{message}</p>
          <p className="text-[12px] text-ink-muted">Bạn có muốn chuyển đến trang đăng nhập không?</p>
        </div>

        <div className="px-5 pb-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleCancel}
            className="h-9 px-4 rounded-md border border-line text-[12.5px] font-bold text-ink hover:bg-surface-2 transition cursor-pointer"
          >
            Để sau
          </button>
          <button
            type="button"
            onClick={handleLogin}
            autoFocus
            className="h-9 px-4 rounded-md bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold transition cursor-pointer"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
