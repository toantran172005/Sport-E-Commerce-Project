import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  MapPin,
  Copy,
  ArrowLeft,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { orderService } from '../../services/orderService.js';
import { formatCurrency } from '../../utils/formatters.js';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { openModal, showToast, addToCart } = useStore();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    orderService
      .getOrderById(id)
      .then((data) => {
        if (isMounted) {
          setOrder(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCopy = (text, label) => {
    navigator.clipboard?.writeText(text);
    showToast(`Đã sao chép ${label}: ${text}`);
  };

  const handleReorder = () => {
    if (order?.items && order.items.length > 0) {
      order.items.forEach((item) => {
        addToCart(
          {
            id: item.variantId || item.id,
            name: item.name || item.productName,
            basePrice: item.price,
            salePrice: null,
            images: [],
          },
          item.quantity || 1
        );
      });
      showToast('Đã thêm lại các sản phẩm vào giỏ hàng');
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg border border-line p-12 text-center shadow-2xs">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-[13px] text-ink-muted">Đang tải thông tin đơn hàng #{id}...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-surface rounded-lg border border-line p-12 text-center space-y-4 shadow-2xs">
        <h3 className="text-[16px] font-bold text-ink">Không tìm thấy đơn hàng #{id}</h3>
        <p className="text-[13px] text-ink-muted">
          Đơn hàng này không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-white text-[13px] font-bold shadow-xs hover:bg-accent-hover transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách đơn hàng</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-1">
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-muted hover:text-accent transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách đơn hàng</span>
        </Link>

        <span className="text-[12.5px] font-mono text-ink-subtle">
          Mã tham chiếu: #{order.id}
        </span>
      </div>

      {/* Main Order Card */}
      <div className="bg-surface rounded-lg border border-line overflow-hidden shadow-2xs">
        {/* Header */}
        <div className="p-6 border-b border-line flex flex-wrap items-center justify-between gap-4 bg-page/40">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[18px] font-extrabold text-ink font-mono">
                {order.code}
              </h2>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-accent-soft text-accent">
                {order.status}
              </span>
            </div>
            <p className="text-[12px] text-ink-subtle mt-1">
              Thời gian đặt hàng: {order.createdAt}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {order.status === 'PENDING' && (
              <button
                type="button"
                onClick={() => openModal('cancel_order_modal', { orderId: order.id })}
                className="px-3.5 py-2 rounded-md border border-line text-danger hover:bg-danger-soft text-[12.5px] font-bold transition"
              >
                Hủy đơn hàng
              </button>
            )}

            <button
              type="button"
              onClick={handleReorder}
              className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold shadow-xs transition"
            >
              Mua lại đơn này
            </button>
          </div>
        </div>

        {/* 2 Info Columns: Receiver & Shipment */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line border-b border-line">
          {/* Receiver Info */}
          <div className="p-6 space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase text-ink-subtle tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              <span>ĐỊA CHỈ NHẬN HÀNG</span>
            </div>
            <p className="text-[14px] font-bold text-ink">
              {order.receiverName || order.userAddress?.receiverName || 'Khách hàng'} ·{' '}
              <span className="text-ink-muted font-medium">
                {order.receiverPhone || order.userAddress?.phone || '0912 345 678'}
              </span>
            </p>
            <p className="text-[12.5px] text-ink-muted leading-relaxed">
              {order.shippingAddress ||
                order.address ||
                (order.userAddress
                  ? `${order.userAddress.streetAddress}, ${order.userAddress.ward}, ${order.userAddress.district}, ${order.userAddress.province}`
                  : '42 Nguyễn Thị Minh Khai, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh')}
            </p>
          </div>

          {/* Shipment & Payment */}
          <div className="p-6 space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase text-ink-subtle tracking-wider">
              <Truck className="w-3.5 h-3.5 text-accent" />
              <span>VẬN CHUYỂN & THANH TOÁN</span>
            </div>
            <div className="text-[13px] text-ink flex items-center justify-between">
              <span>Đơn vị giao:</span>
              <strong className="text-accent">
                {order.shippingProviderShort || order.shippingProvider?.name || 'Giao Hàng Nhanh (GHN)'}
              </strong>
            </div>
            {order.trackingCode && (
              <div className="text-[13px] text-ink flex items-center justify-between">
                <span>Mã vận đơn:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(order.trackingCode, 'Mã vận đơn')}
                  className="font-mono text-accent font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>{order.trackingCode}</span>
                  <Copy className="w-3 h-3 text-ink-subtle" />
                </button>
              </div>
            )}
            <div className="text-[13px] text-ink flex items-center justify-between">
              <span>Thanh toán:</span>
              <span className="font-bold text-ink">
                {order.paymentMethod === 'VNPAY' ? 'VNPay QR Sandbox' : 'COD (Thanh toán khi nhận)'}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="p-6 space-y-4">
          <h3 className="text-[13px] font-extrabold uppercase text-ink tracking-wider">
            SẢN PHẨM TRONG ĐƠN ({order.items?.length || 0})
          </h3>

          <div className="space-y-3 divide-y divide-line">
            {order.items?.map((item, idx) => (
              <div key={item.id || idx} className="pt-3 first:pt-0 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-md bg-surface-2 border border-line overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image || item.productImage || item.imageUrl ? (
                      <img
                        src={item.image || item.productImage || item.imageUrl}
                        alt={item.name || item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-ink-subtle" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-[13.5px] font-bold text-ink line-clamp-1">
                      {item.name || item.productName || 'Sản phẩm thể thao'}
                    </h4>
                    <p className="text-[12px] text-ink-muted mt-0.5">
                      Phân loại: {item.variant || item.variantName || 'Tiêu chuẩn'} · Số lượng: x{item.quantity || 1}
                    </p>
                    <p className="text-[12.5px] font-bold text-accent sm:hidden mt-1">
                      {formatCurrency(item.price || 0)}
                    </p>
                  </div>
                </div>

                <div className="text-right hidden sm:block shrink-0">
                  <p className="text-[14px] font-extrabold text-ink">
                    {formatCurrency((item.price || 0) * (item.quantity || 1))}
                  </p>
                  <p className="text-[11.5px] text-ink-subtle">
                    {formatCurrency(item.price || 0)} / món
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div className="mt-6 pt-4 border-t border-line space-y-2 text-[13px]">
            <div className="flex justify-between text-ink-muted">
              <span>Tạm tính tiền hàng:</span>
              <span className="font-bold text-ink">
                {formatCurrency(order.subtotal || order.subTotal || (order.total || 0) - 30000)}
              </span>
            </div>

            <div className="flex justify-between text-ink-muted">
              <span>Phí giao hàng:</span>
              <span className="font-bold text-ink">
                {formatCurrency(order.shippingFee || 30000)}
              </span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-success font-bold">
                <span>Voucher giảm giá:</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-3 border-t border-line">
              <span className="text-[14px] font-extrabold text-ink">
                Tổng số tiền thanh toán:
              </span>
              <span className="text-[20px] font-black text-accent">
                {formatCurrency(order.total || order.totalAmount || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
