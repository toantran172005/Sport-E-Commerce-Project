import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { orderService } from '../../services/orderService.js';

const CANCEL_REASONS = [
  'Thay đổi ý định mua hàng',
  'Đặt nhầm sản phẩm / số lượng / size',
  'Tìm được giá tốt hơn ở nơi khác',
  'Thời gian giao hàng dự kiến quá lâu',
  'Muốn đổi phương thức thanh toán / địa chỉ',
  'Lý do khác (chi tiết)',
];

export default function CancelOrderModal() {
  const {
    activeModal,
    modalPayload,
    closeModal,
    cancelOrderById,
    showToast,
    showErrorModal,
  } = useStore();
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (activeModal !== 'cancel_order_modal') return null;

  const orderId = modalPayload?.orderId || modalPayload?.orderCode;
  const orderCode = modalPayload?.orderCode || `#ORD-${orderId}`;

  const handleConfirmCancel = async () => {
    const finalReason = selectedReason === 'Lý do khác (chi tiết)' ? (customReason || 'Khách hàng yêu cầu hủy') : selectedReason;
    setIsSubmitting(true);
    try {
      await orderService.cancelOrder(orderId, finalReason);
      cancelOrderById(orderId, finalReason);
      showToast(`Đã hủy đơn hàng ${orderCode}`);
      closeModal();
    } catch (err) {
      showErrorModal(err, { title: 'Hủy Đơn Hàng Thất Bại' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-surface rounded-lg w-full max-w-[500px] shadow-2xl border border-line overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-red-50 dark:bg-red-950/40 text-danger flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">
                Hủy Đơn Hàng {orderCode}
              </h2>
              <p className="text-[12px] text-ink-subtle">
                Sản phẩm sẽ tự động hoàn lại kho hàng
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="w-8 h-8 rounded-md bg-surface-2 dark:bg-surface-2 text-slate-500 hover:text-slate-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-[13px] font-bold text-ink dark:text-slate-200">
            Vui lòng chọn lý do hủy đơn: <span className="text-danger">*</span>
          </p>

          <div className="space-y-2">
            {CANCEL_REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <div
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`px-3.5 py-2.5 rounded-md border flex items-center gap-3 cursor-pointer transition text-[12.5px] ${
                    isSelected
                      ? 'border-accent bg-accent-soft dark:bg-accent/10 font-bold text-accent'
                      : 'border-line bg-surface text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border shrink-0 ${
                      isSelected
                        ? 'border-accent bg-accent'
                        : 'border-line dark:border-slate-600 bg-surface'
                    }`}
                  >
                    {isSelected && <div className="w-1 h-1 rounded-full bg-surface" />}
                  </div>
                  <span>{reason}</span>
                </div>
              );
            })}
          </div>

          {selectedReason === 'Lý do khác (chi tiết)' && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Nhập lý do chi tiết của bạn..."
              rows={2}
              className="w-full p-2.5 rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line text-[12.5px] focus:outline-none focus:border-accent"
            />
          )}

          <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-[11.5px] text-amber-800 dark:text-amber-400">
            <p className="font-bold">Lưu ý về Voucher & Thanh toán:</p>
            <p className="mt-0.5">
              Sau khi hủy, mã giảm giá sẽ được phục hồi và tiền hoàn (nếu đã thanh toán qua VNPay) sẽ được xử lý trong vòng 24h.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-line bg-page dark:bg-surface flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 rounded-md bg-surface border border-line text-slate-700 dark:text-slate-300 text-[12.5px] font-bold hover:bg-slate-50 transition"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmCancel}
            className="px-4 py-2 rounded-md bg-danger hover:bg-red-600 text-white text-[12.5px] font-bold shadow-xs transition disabled:opacity-50"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Hủy Đơn'}
          </button>
        </div>
      </div>
    </div>
  );
}
