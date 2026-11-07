import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Package, Home } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const { orders } = useStore();

  const orderId = searchParams.get('orderId');
  const orderCode = searchParams.get('orderCode') || '#ORD-2026001';
  const method = searchParams.get('method') || 'BANK_TRANSFER';

  const order =
    orders.find(
      (o) => String(o.id) === String(orderId) || o.orderCode === orderCode
    ) || orders[0];
  const isOnline = method === 'BANK_TRANSFER';

  return (
    <div className="max-w-[1360px] w-full mx-auto px-4 md:px-6 py-12 flex items-center justify-center text-ink">
      <div className="bg-surface rounded-lg border border-line w-full max-w-[520px] p-8 text-center shadow-xs">
        {/* Green Check Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-xl md:text-2xl font-extrabold text-ink">
          {isOnline ? 'Thanh Toán Thành Công!' : 'Đặt Hàng Thành Công!'}
        </h1>
        <p className="text-[13px] text-ink-muted mt-1.5 leading-relaxed">
          {isOnline
            ? 'Giao dịch qua cổng VNPay đã được xác nhận. Đơn hàng đang được chuẩn bị đóng gói.'
            : 'Đơn hàng COD của bạn đã được ghi nhận. Bạn sẽ thanh toán khi nhận hàng.'}
        </p>

        {/* Order ID Box */}
        <div className="mt-5 py-3.5 px-4 rounded-md bg-page border border-line">
          <p className="text-[11px] font-bold uppercase text-ink-muted tracking-wider">
            MÃ ĐƠN HÀNG CỦA BẠN
          </p>
          <p className="text-2xl font-extrabold text-accent mt-1 font-mono">
            {order?.orderCode || orderCode}
          </p>
        </div>

        {/* Transaction Info Table */}
        <div className="mt-4 p-4 rounded-md border border-line text-[12.5px] space-y-2.5 text-left bg-surface-2/40">
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Tổng thanh toán:</span>
            <span className="font-extrabold text-ink">
              {formatCurrency(order?.totalAmount || 1265000)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Hình thức thanh toán:</span>
            <span className="font-bold text-ink">
              {isOnline
                ? 'VNPay QR (Đã thanh toán)'
                : 'Thanh toán tiền mặt khi nhận hàng (COD)'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Thời gian tạo:</span>
            <span className="text-ink">
              {formatDateTime(order?.createdAt || new Date().toISOString())}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Link
            to={`/account/orders/${order?.id || 1}`}
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
