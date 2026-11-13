import { useState, useEffect } from 'react';
import {
  X,
  Package,
  Truck,
  MapPin,
  Clock,
  FileText,
  User,
  Phone,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatters';
import LineNumberBadge from '../common/LineNumberBadge';

const ALLOWED_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELED'],
  CONFIRMED: ['PROCESSING', 'CANCELED'],
  PROCESSING: ['SHIPPED', 'CANCELED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['RETURNED'],
  CANCELED: [],
  CANCELLED: [],
  RETURNED: [],
};

const ALL_STATUS_MAP = {
  PENDING: 'Chờ xử lý (PENDING)',
  CONFIRMED: 'Đã xác nhận (CONFIRMED)',
  PROCESSING: 'Đang đóng gói (PROCESSING)',
  SHIPPED: 'Đang giao hàng (SHIPPED)',
  DELIVERED: 'Đã giao thành công (DELIVERED)',
  RETURNED: 'Hoàn trả hàng (RETURNED)',
  CANCELED: 'Đã hủy đơn (CANCELED)',
  CANCELLED: 'Đã hủy đơn (CANCELLED)',
};

export default function AdminOrderModal() {
  const {
    activeModal,
    modalPayload,
    closeModal,
    orders,
    updateOrderStatus,
    showToast,
    showErrorModal,
  } = useStore();

  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [adminNote, setAdminNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orderId = modalPayload?.orderId || modalPayload?.order?.id;
  const order = orders.find((o) => o.id === orderId || o.code === orderId || o.orderCode === orderId) || modalPayload?.order;

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status || 'PENDING');
      setAdminNote('');
    }
  }, [order]);

  if (activeModal !== 'admin_order_modal') return null;

  if (!order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-surface rounded-lg p-6 max-w-md w-full text-center border border-line text-ink">
          <p className="text-[14px] text-ink-muted">Không tìm thấy thông tin đơn hàng này.</p>
          <button
            type="button"
            onClick={closeModal}
            className="mt-4 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-[13px] font-bold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = order?.status || 'PENDING';
  const allowedNextStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];
  const isTerminal = allowedNextStatuses.length === 0;

  const handleUpdateStatus = async () => {
    if (isTerminal || selectedStatus === currentStatus) {
      closeModal();
      return;
    }

    setIsSubmitting(true);
    try {
      await updateOrderStatus(
        order.id,
        selectedStatus,
        adminNote || `Cập nhật trạng thái sang ${selectedStatus}`,
        selectedStatus === 'CANCELED' ? (adminNote || 'Hủy bởi Quản trị viên') : ''
      );
      showToast(`Đã cập nhật trạng thái đơn ${order.code || order.orderCode} sang ${selectedStatus}!`, 'success');
      closeModal();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái đơn hàng:', err);
      showErrorModal(err, { title: 'Cập Nhật Trạng Thái Thất Bại' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const receiverName = order.userAddress?.receiverName || order.adminCustomerName || order.recipientName || 'Khách hàng';
  const receiverPhone = order.userAddress?.phone || order.adminCustomerSub || order.phoneNumber || '—';
  const receiverAddress =
    order.userAddress?.streetAddress
      ? `${order.userAddress.streetAddress}, ${order.userAddress.ward}, ${order.userAddress.district}, ${order.userAddress.province}`
      : order.shippingAddressSnapshot || order.address || 'Địa chỉ nhận hàng';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-surface rounded-lg w-full max-w-[720px] shadow-2xl border border-line overflow-hidden my-8 text-ink">
        {/* Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-surface-2/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-accent-soft text-accent flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-ink">
                Chi Tiết &amp; Điều Phối Đơn Hàng {order.code || order.orderCode}
              </h2>
              <p className="text-[12px] text-ink-muted">
                Ngày đặt: {order.createdAt}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="w-8 h-8 rounded-md bg-surface border border-line hover:bg-danger-soft text-ink-muted hover:text-danger flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Customer & Shipping Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-surface-2/40 border border-line space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase text-ink-muted">
                <User className="w-3.5 h-3.5 text-accent" />
                <span>THÔNG TIN NGƯỜI NHẬN</span>
              </div>
              <p className="text-[13.5px] font-bold text-ink flex items-center gap-2">
                <span>{receiverName}</span>
                <span className="text-[12px] font-normal text-ink-muted flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {receiverPhone}
                </span>
              </p>
              <p className="text-[12px] text-ink-muted flex items-start gap-1.5 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-ink-subtle mt-0.5" />
                <span>{receiverAddress}</span>
              </p>
            </div>

            <div className="p-4 rounded-lg bg-surface-2/40 border border-line space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase text-ink-muted">
                <Truck className="w-3.5 h-3.5 text-accent" />
                <span>THANH TOÁN &amp; GIAO HÀNG</span>
              </div>
              <div className="text-[12.5px] text-ink flex items-center justify-between">
                <span>Phương thức:</span>
                <strong className="text-accent">
                  {order.paymentMethod === 'BANK_TRANSFER' || order.paymentMethod === 'VNPAY'
                    ? 'VNPay QR'
                    : 'Thanh toán COD'}
                </strong>
              </div>
              <div className="text-[12.5px] text-ink flex items-center justify-between">
                <span>Trạng thái TT:</span>
                {(() => {
                  const payStatus = order.payment?.status || order.paymentStatus || 'PENDING';
                  if (payStatus === 'REFUND') {
                    return (
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        🔄 Đã hoàn tiền (REFUND)
                      </span>
                    );
                  }
                  if (payStatus === 'PAID') {
                    return (
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        ✓ Đã thanh toán (PAID)
                      </span>
                    );
                  }
                  if (payStatus === 'CANCELLED') {
                    return (
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        ✕ Đã hủy (CANCELLED)
                      </span>
                    );
                  }
                  return (
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
                      ⏳ Chờ thanh toán
                    </span>
                  );
                })()}
              </div>
              <div className="text-[12.5px] text-ink flex items-center justify-between">
                <span>Vận chuyển:</span>
                <span className="font-bold text-ink">
                  {order.shippingProviderShort || 'GHN'} Express — {order.trackingCode || 'Chưa có mã'}
                </span>
              </div>
            </div>
          </div>

          {/* Items list with LineNumberBadge */}
          <div>
            <p className="text-[12px] font-extrabold uppercase text-ink mb-2 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-accent" />
              <span>SẢN PHẨM TRONG ĐƠN ({order.items?.length || order.orderItems?.length || 0}):</span>
            </p>
            <div className="space-y-2 border border-line rounded-lg divide-y divide-line overflow-hidden">
              {(order.items || order.orderItems || []).map((item, idx) => {
                const itemImg = item.image || item.productImage || item.imageUrl;
                const itemName = item.adminName || item.productName || item.name;
                const itemVariant = item.adminVariant || item.variantName || item.variant;
                return (
                  <div key={idx} className="p-3 bg-surface flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <LineNumberBadge n={idx + 1} />
                      <div className="w-11 h-11 rounded-md bg-surface-2 border border-line overflow-hidden shrink-0 flex items-center justify-center">
                        {itemImg ? (
                          <img src={itemImg} alt={itemName} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-ink-subtle" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-ink line-clamp-1">
                          {itemName}
                        </h4>
                        <p className="text-[11.5px] text-ink-muted">
                          Phân loại: {itemVariant || 'Tiêu chuẩn'} • SL: x{item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="text-[13px] font-bold text-ink shrink-0">
                      {formatCurrency(item.subtotal || item.price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Totals */}
          <div className="bg-surface-2/40 p-3.5 rounded-lg border border-line space-y-1.5 text-[12.5px]">
            <div className="flex justify-between text-ink-muted">
              <span>Tạm tính hàng hoá:</span>
              <span>{formatCurrency(order.subtotal || order.subTotal || (order.total || order.totalAmount) - 30000)}</span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>Phí vận chuyển:</span>
              <span>{formatCurrency(order.shippingFee || 30000)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Giảm giá khuyến mãi:</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[14px] font-bold text-ink pt-2 border-t border-line">
              <span>Tổng thanh toán:</span>
              <span className="text-accent">{formatCurrency(order.total || order.totalAmount)}</span>
            </div>
          </div>

          {/* Status Update Form */}
          <div className="p-4 rounded-lg border-2 border-accent/20 bg-accent-soft space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[12.5px] font-bold text-ink flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-accent" />
                <span>Cập Nhật Tiến Độ Đơn Hàng</span>
              </p>
              <span className="text-[11.5px] font-mono text-ink-muted">
                Hiện tại: <strong className="text-accent">{currentStatus}</strong>
              </span>
            </div>

            {isTerminal ? (
              <div className="p-3 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[12px] leading-relaxed">
                ℹ️ Đơn hàng đã ở trạng thái kết thúc (<strong>{ALL_STATUS_MAP[currentStatus] || currentStatus}</strong>). Theo quy trình nghiệp vụ hệ thống, không thể chuyển tiếp trạng thái nào khác.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-bold text-ink-muted mb-1">
                      Trạng thái chuyển tiếp hợp lệ:
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full h-10 px-3 rounded-md bg-page border border-line text-[13px] font-bold text-ink focus:outline-none focus:border-accent"
                    >
                      <option value={currentStatus}>
                        {ALL_STATUS_MAP[currentStatus] || currentStatus} (Hiện tại)
                      </option>
                      {allowedNextStatuses.map((st) => (
                        <option key={st} value={st}>
                          ➜ {ALL_STATUS_MAP[st] || st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-ink-muted mb-1">
                      Ghi chú điều phối (Lưu log lịch sử):
                    </label>
                    <input
                      type="text"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Ví dụ: Đã bàn giao bưu tá GHN..."
                      className="w-full h-10 px-3 rounded-md bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {(selectedStatus === 'CANCELED' || selectedStatus === 'RETURNED') && (
                  <p className="text-[11.5px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 p-2.5 rounded-md border border-amber-500/20">
                    ⚠️ Lưu ý nghiệp vụ: Nếu đơn hàng đã được thanh toán, khi chuyển sang <strong>{selectedStatus}</strong> hệ thống sẽ tự động kích hoạt hoàn tiền (REFUND) cho khách hàng.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-line bg-surface-2/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 rounded-md bg-surface border border-line hover:bg-surface-2 text-[12.5px] font-bold text-ink-muted transition cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={isTerminal || selectedStatus === currentStatus || isSubmitting}
            onClick={handleUpdateStatus}
            className="px-5 py-2 rounded-md bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-[12.5px] font-bold shadow-xs transition cursor-pointer"
          >
            {isSubmitting ? 'Đang cập nhật...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}
