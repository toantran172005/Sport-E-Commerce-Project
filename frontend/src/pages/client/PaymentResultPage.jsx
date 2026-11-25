import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Package, Home, Loader2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { orderService } from '../../services/orderService.js';
import { paymentService } from '../../services/paymentService.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const { orders, setAppliedCoupon, refreshCoupons } = useStore();

  // Tham số từ VNPay Sandbox Return URL (nếu có)
  const vnpResponseCode = searchParams.get('vnp_ResponseCode');
  const vnpTxnRef = searchParams.get('vnp_TxnRef');
  const vnpAmount = searchParams.get('vnp_Amount');
  const vnpTransactionNo = searchParams.get('vnp_TransactionNo');
  const isVnPayCallback = Boolean(vnpResponseCode && vnpTxnRef);

  // Tham số nội bộ khi điều hướng từ Checkout / QR Modal
  const queryOrderId = searchParams.get('orderId');
  const queryOrderCode = searchParams.get('orderCode') || vnpTxnRef;
  const queryMethod =
    searchParams.get('method') || (isVnPayCallback ? 'BANK_TRANSFER' : 'COD');

  const [backendOrder, setBackendOrder] = useState(null);
  const [backendPayment, setBackendPayment] = useState(null);
  const [webhookResult, setWebhookResult] = useState(null);
  const [verifying, setVerifying] = useState(isVnPayCallback);
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    if (typeof setAppliedCoupon === 'function') {
      setAppliedCoupon(null);
    }
    if (typeof refreshCoupons === 'function') {
      refreshCoupons();
    }
  }, [setAppliedCoupon, refreshCoupons]);

  // 1. Nếu có tham số trả về từ cổng VNPay Sandbox -> gọi /api/payments/webhook để xác thực chữ ký & cập nhật DB
  useEffect(() => {
    if (!isVnPayCallback) return;

    const vnpParams = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('vnp_')) {
        vnpParams[key] = value;
      }
    }

    setVerifying(true);
    paymentService
      .verifyVnPayReturn(vnpParams)
      .then((res) => {
        const data = res?.data ?? res;
        setWebhookResult(data);
        if (data?.orderId) {
          return Promise.allSettled([
            orderService.getOrderById(data.orderId),
            paymentService.getPaymentByOrderId(data.orderId),
          ]).then(([orderRes, payRes]) => {
            if (orderRes.status === 'fulfilled' && orderRes.value) {
              setBackendOrder(orderRes.value?.data ?? orderRes.value);
            }
            if (payRes.status === 'fulfilled' && payRes.value) {
              setBackendPayment(payRes.value?.data ?? payRes.value);
            }
          });
        }
      })
      .catch((err) => {
        setVerifyError(err.message || 'Không thể xác thực chữ ký giao dịch VNPay');
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [isVnPayCallback, searchParams]);

  // 2. Nếu điều hướng nội bộ có orderId -> lấy thông tin đơn hàng & thanh toán từ Backend
  useEffect(() => {
    if (isVnPayCallback || !queryOrderId) return;

    orderService
      .getOrderById(queryOrderId)
      .then((res) => {
        const data = res?.data ?? res;
        if (data) setBackendOrder(data);
      })
      .catch(() => {});

    paymentService
      .getPaymentByOrderId(queryOrderId)
      .then((res) => {
        const data = res?.data ?? res;
        if (data) setBackendPayment(data);
      })
      .catch(() => {});
  }, [isVnPayCallback, queryOrderId]);

  const effectiveOrderId =
    webhookResult?.orderId || backendOrder?.id || queryOrderId;

  const matchedOrder = orders.find(
    (o) =>
      (effectiveOrderId && String(o.id) === String(effectiveOrderId)) ||
      (queryOrderCode && o.orderCode === queryOrderCode)
  );

  const displayOrderCode =
    webhookResult?.orderCode ||
    backendOrder?.orderCode ||
    matchedOrder?.orderCode ||
    queryOrderCode ||
    `#ORD-${effectiveOrderId || '1'}`;

  const displayTotal =
    backendOrder?.totalAmount ??
    webhookResult?.amount ??
    backendPayment?.amount ??
    (vnpAmount ? Number(vnpAmount) / 100 : null) ??
    matchedOrder?.totalAmount ??
    0;

  const displayCreatedAt =
    backendPayment?.paidAt ||
    webhookResult?.paidAt ||
    backendOrder?.placedAt ||
    matchedOrder?.createdAt ||
    new Date().toISOString();

  const displayOrderId = effectiveOrderId || matchedOrder?.id || '1';
  const displayTransactionCode =
    webhookResult?.transactionCode ||
    backendPayment?.transactionCode ||
    vnpTransactionNo ||
    null;

  const isOnline =
    queryMethod === 'BANK_TRANSFER' ||
    backendPayment?.method === 'BANK_TRANSFER' ||
    matchedOrder?.paymentMethod === 'VNPAY';

  const isFailed =
    Boolean(verifyError) ||
    (isVnPayCallback && vnpResponseCode !== '00') ||
    webhookResult?.status === 'FAILED' ||
    backendPayment?.status === 'FAILED';

  if (verifying) {
    return (
      <div className="max-w-[1360px] w-full mx-auto px-4 md:px-6 py-16 flex items-center justify-center text-ink">
        <div className="bg-surface rounded-lg border border-line w-full max-w-[480px] p-8 text-center space-y-3 shadow-xs">
          <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto" />
          <h2 className="text-lg font-extrabold text-ink">
            Đang xác thực giao dịch VNPay...
          </h2>
          <p className="text-[13px] text-ink-muted">
            Hệ thống đang kiểm tra chữ ký bảo mật và cập nhật trạng thái đơn hàng.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] w-full mx-auto px-4 md:px-6 py-12 flex items-center justify-center text-ink">
      <div className="bg-surface rounded-lg border border-line w-full max-w-[520px] p-8 text-center shadow-xs">
        {/* Status Icon */}
        {isFailed ? (
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        )}

        <h1 className="text-xl md:text-2xl font-extrabold text-ink">
          {isFailed
            ? 'Thanh Toán Không Thành Công!'
            : isOnline
              ? 'Thanh Toán Thành Công!'
              : 'Đặt Hàng Thành Công!'}
        </h1>
        <p className="text-[13px] text-ink-muted mt-1.5 leading-relaxed">
          {isFailed
            ? verifyError ||
              `Giao dịch qua cổng VNPay đã bị hủy hoặc không thành công (Mã phản hồi: ${vnpResponseCode || 'FAILED'}).`
            : isOnline
              ? 'Giao dịch qua cổng VNPay đã được xác nhận. Đơn hàng đang được chuẩn bị đóng gói.'
              : 'Đơn hàng COD của bạn đã được ghi nhận. Bạn sẽ thanh toán khi nhận hàng.'}
        </p>

        {/* Order ID Box */}
        <div className="mt-5 py-3.5 px-4 rounded-md bg-page border border-line">
          <p className="text-[11px] font-bold uppercase text-ink-muted tracking-wider">
            MÃ ĐƠN HÀNG CỦA BẠN
          </p>
          <p className="text-2xl font-extrabold text-accent mt-1 font-mono">
            {displayOrderCode}
          </p>
        </div>

        {/* Transaction Info Table */}
        <div className="mt-4 p-4 rounded-md border border-line text-[12.5px] space-y-2.5 text-left bg-surface-2/40">
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Tổng thanh toán:</span>
            <span className="font-extrabold text-ink">
              {formatCurrency(displayTotal)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Hình thức thanh toán:</span>
            <span className="font-bold text-ink">
              {isOnline
                ? isFailed
                  ? 'VNPay (Giao dịch thất bại)'
                  : 'VNPay QR (Đã thanh toán)'
                : 'Thanh toán tiền mặt khi nhận hàng (COD)'}
            </span>
          </div>
          {displayTransactionCode && (
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Mã giao dịch:</span>
              <span className="font-mono font-bold text-accent">
                {displayTransactionCode}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Thời gian:</span>
            <span className="text-ink">{formatDateTime(displayCreatedAt)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Link
            to={`/account/orders/${displayOrderId}`}
            className="py-2.5 rounded-md bg-accent hover:bg-accent/90 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-xs transition"
          >
            <Package className="w-4 h-4" />
            <span>Xem Đơn Hàng</span>
          </Link>
          <Link
            to="/"
            className="py-2.5 rounded-md bg-surface border border-line hover:bg-surface-2 text-ink text-[13px] font-bold flex items-center justify-center gap-2 transition"
          >
            <Home className="w-4 h-4" />
            <span>Về Trang Chủ</span>
          </Link>
        </div>

        <p className="text-[11.5px] text-ink-muted mt-5">
          Hotline hỗ trợ đơn hàng: <strong className="text-accent">1900 6868</strong> (8h00 - 21h00)
        </p>
      </div>
    </div>
  );
}
