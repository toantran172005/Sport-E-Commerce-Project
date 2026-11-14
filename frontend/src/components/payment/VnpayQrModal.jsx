import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, X, Check, Copy, Clock, ExternalLink } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { paymentService } from '../../services/paymentService.js';
import { formatCurrency } from '../../utils/formatters.js';

export default function VnpayQrModal() {
  const {
    activeModal,
    modalPayload,
    closeModal,
    showToast,
    setAppliedCoupon,
    refreshCoupons,
  } = useStore();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(900);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (activeModal !== 'vnpay_qr_modal') return;
    setCountdown(900);
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeModal]);

  if (activeModal !== 'vnpay_qr_modal') return null;

  const amount = modalPayload?.amount || 1265000;
  const orderCode = modalPayload?.orderCode || '#ORD-2026001';
  const orderId = modalPayload?.orderId || 1;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleConfirmPaid = async () => {
    setIsConfirming(true);
    try {
      await paymentService.confirmPayment(orderId);
      if (typeof setAppliedCoupon === 'function') setAppliedCoupon(null);
      if (typeof refreshCoupons === 'function') refreshCoupons();
      closeModal();
      showToast('Xác nhận thanh toán VNPay QR thành công!', 'success');
      navigate(`/payment-result?orderId=${orderId}&orderCode=${orderCode}&method=BANK_TRANSFER`);
    } catch (err) {
      showToast(err.message || 'Không thể xác nhận thanh toán!', 'error');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleOpenVnPayGateway = () => {
    if (!modalPayload?.paymentUrl) return;
    if (typeof setAppliedCoupon === 'function') setAppliedCoupon(null);
    closeModal();
    window.location.href = modalPayload.paymentUrl;
  };

  const handleCopy = (text, label) => {
    navigator.clipboard?.writeText(text);
    showToast(`Đã sao chép ${label}!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-surface rounded-lg w-full max-w-[480px] shadow-2xl border border-line overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Blue Header */}
        <div className="bg-accent px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-surface/20 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold leading-tight">
                Cổng Thanh Toán VNPay QR
              </h3>
              <p className="text-[11px] text-blue-100">
                Quét mã qua ứng dụng Mobile Banking hoặc mở VNPay Sandbox
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="w-7 h-7 rounded-md bg-surface/20 hover:bg-surface/30 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-center">
          {/* Order info strip */}
          <div className="p-3 rounded-md bg-page dark:bg-surface-2/60 border border-line flex items-center justify-between text-left text-[12.5px]">
            <div>
              <p className="text-ink-muted">
                Đơn hàng: <strong className="text-ink font-mono">{orderCode}</strong>
              </p>
              <p className="text-ink-muted">
                Đơn vị nhận: <strong>DELTA SPORT</strong>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-ink-subtle">Số tiền cần thanh toán</p>
              <p className="text-[17px] font-extrabold text-accent">
                {formatCurrency(amount)}
              </p>
            </div>
          </div>

          {/* QR Code graphic */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-48 h-48 rounded-md border-2 border-accent p-3 bg-surface flex flex-col justify-between shadow-xs">
              {/* QR Pattern Placeholder SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect x="0" y="0" width="30" height="30" fill="#0f1730" />
                <rect x="5" y="5" width="20" height="20" fill="white" />
                <rect x="10" y="10" width="10" height="10" fill="#0f1730" />

                <rect x="70" y="0" width="30" height="30" fill="#0f1730" />
                <rect x="75" y="5" width="20" height="20" fill="white" />
                <rect x="80" y="10" width="10" height="10" fill="#0f1730" />

                <rect x="0" y="70" width="30" height="30" fill="#0f1730" />
                <rect x="5" y="75" width="20" height="20" fill="white" />
                <rect x="10" y="80" width="10" height="10" fill="#0f1730" />

                <rect x="35" y="10" width="10" height="10" fill="#2f6bff" />
                <rect x="50" y="15" width="10" height="10" fill="#0f1730" />
                <rect x="35" y="35" width="30" height="30" fill="#2f6bff" rx="4" />
                <rect x="40" y="40" width="20" height="20" fill="white" rx="2" />
                <rect x="45" y="45" width="10" height="10" fill="#2f6bff" />

                <rect x="70" y="40" width="10" height="10" fill="#0f1730" />
                <rect x="75" y="60" width="15" height="10" fill="#0f1730" />
                <rect x="40" y="75" width="15" height="10" fill="#0f1730" />
                <rect x="70" y="80" width="20" height="15" fill="#2f6bff" />
              </svg>
            </div>

            <div className="flex items-center gap-1.5 mt-2 text-[12px] text-amber-600 dark:text-amber-400 font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>Mã QR sẽ hết hiệu lực sau: {timeFormatted}</span>
            </div>
          </div>

          {/* Bank Transfer Details Box */}
          <div className="p-3 rounded-md border border-line text-left text-[12px] space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-ink-muted">Ngân hàng:</span>
              <span className="font-bold">Vietcombank (VCB) / VNPay Sandbox</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-muted">Số tài khoản:</span>
              <button
                type="button"
                onClick={() => handleCopy('1024888899', 'Số tài khoản')}
                className="font-mono font-bold text-accent flex items-center gap-1 hover:underline"
              >
                <span>1024888899</span>
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-muted">Nội dung chuyển khoản:</span>
              <button
                type="button"
                onClick={() => handleCopy(orderCode, 'Nội dung CK')}
                className="font-mono font-bold text-accent flex items-center gap-1 hover:underline"
              >
                <span>{orderCode}</span>
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* External Payment Gateway Link */}
          {modalPayload?.paymentUrl && (
            <button
              type="button"
              onClick={handleOpenVnPayGateway}
              className="w-full h-10 rounded-md bg-accent hover:bg-accent-hover text-white text-[13px] font-bold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Mở Cổng Thanh Toán VNPay Sandbox</span>
            </button>
          )}

          {/* Action Button */}
          <button
            type="button"
            disabled={isConfirming}
            onClick={handleConfirmPaid}
            className="w-full h-10 rounded-md bg-success hover:bg-emerald-600 text-white text-[13px] font-bold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>
              {isConfirming ? 'Đang xác nhận...' : 'Tôi Đã Hoàn Tất Chuyển Khoản'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
