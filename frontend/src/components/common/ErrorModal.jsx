import { AlertTriangle, X, RefreshCw } from "lucide-react";
import { useUI } from "../../context/UIContext.jsx";

export default function ErrorModal() {
  const { activeModal, modalPayload, closeModal } = useUI();

  if (activeModal !== "error_modal") return null;

  const title = modalPayload?.title || "Đã Xảy Ra Lỗi";
  const message =
    modalPayload?.message ||
    "Không thể hoàn thành thao tác. Vui lòng kiểm tra lại kết nối hoặc dữ liệu gửi lên.";
  const status = modalPayload?.status;
  const errors = modalPayload?.errors;
  const onRetry = modalPayload?.onRetry;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-surface rounded-xl w-full max-w-120 shadow-2xl border border-line overflow-hidden text-ink animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-red-500/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/10 text-danger flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-ink flex items-center gap-2">
                <span>{title}</span>
                {status && (
                  <span className="text-[11px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400">
                    HTTP {status}
                  </span>
                )}
              </h3>
              <p className="text-[11.5px] text-ink-muted">
                Thông báo phản hồi từ hệ thống
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="w-8 h-8 rounded-md bg-surface-2 hover:bg-surface-3 text-ink-muted hover:text-ink flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3.5">
          <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[13px] text-red-700 dark:text-red-300 leading-relaxed font-medium">
            {message}
          </div>

          {/* Validation errors breakdown (nếu có từ Spring Boot validation) */}
          {errors && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[12px] font-bold text-ink-muted">
                Chi tiết các lỗi:
              </p>
              <div className="max-h-36 overflow-y-auto space-y-1 p-2 rounded-md bg-surface-2 border border-line text-[12px] text-ink">
                {Array.isArray(errors) ? (
                  errors.map((errItem, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-1.5 text-danger"
                    >
                      <span>•</span>
                      <span>
                        {typeof errItem === "string"
                          ? errItem
                          : errItem.message || JSON.stringify(errItem)}
                      </span>
                    </div>
                  ))
                ) : typeof errors === "object" ? (
                  Object.entries(errors).map(([field, msg], idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <strong className="text-ink font-mono">{field}:</strong>
                      <span className="text-danger">{String(msg)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-danger">{String(errors)}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-line bg-surface-2/40 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 rounded-lg bg-surface border border-line hover:bg-surface-2 text-[12.5px] font-bold text-ink transition cursor-pointer"
          >
            Đóng
          </button>

          {typeof onRetry === "function" && (
            <button
              type="button"
              onClick={() => {
                closeModal();
                onRetry();
              }}
              className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Thử Lại</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
