import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  Eye,
} from 'lucide-react';
import EmptyState from '../../components/common/EmptyState.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { formatCurrency } from '../../utils/formatters.js';

const STATUS_TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ xác nhận' },
  { key: 'CONFIRMED', label: 'Đã xác nhận' },
  { key: 'PROCESSING', label: 'Đang đóng gói' },
  { key: 'SHIPPED', label: 'Đang vận chuyển' },
  { key: 'DELIVERED', label: 'Đã giao hàng' },
  { key: 'CANCELED', label: 'Đã hủy' },
];

export default function OrderListPage() {
  const { orders, addToCart, openModal, showToast } = useStore();
  const [activeTab, setActiveTab] = useState('ALL');
  const navigate = useNavigate();

  const filteredOrders = useMemo(() => {
    if (activeTab === 'ALL') return orders;
    return orders.filter((o) => {
      if (activeTab === 'CANCELED') return o.status === 'CANCELED' || o.status === 'CANCELLED';
      if (activeTab === 'SHIPPED') return o.status === 'SHIPPED' || o.status === 'SHIPPING';
      if (activeTab === 'DELIVERED') return o.status === 'DELIVERED' || o.status === 'COMPLETED';
      return o.status === activeTab;
    });
  }, [orders, activeTab]);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-warning-soft text-warning text-[11px] font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Chờ xác nhận</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent-soft text-accent text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã xác nhận</span>
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-[11px] font-bold">
            <Package className="w-3.5 h-3.5" />
            <span>Đang đóng gói</span>
          </span>
        );
      case 'SHIPPED':
      case 'SHIPPING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold">
            <Truck className="w-3.5 h-3.5" />
            <span>Đang vận chuyển</span>
          </span>
        );
      case 'DELIVERED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success-soft text-success text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã giao thành công</span>
          </span>
        );
      case 'CANCELED':
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-danger-soft text-danger text-[11px] font-bold">
            <XCircle className="w-3.5 h-3.5" />
            <span>Đã hủy</span>
          </span>
        );
      case 'RETURN_REQUESTED':
      case 'RETURNED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-[11px] font-bold">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Trả hàng / Hoàn tiền</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-2 text-ink-muted text-[11px] font-bold">
            <span>{status}</span>
          </span>
        );
    }
  };

  const handleReorder = (order) => {
    if (order.items && order.items.length > 0) {
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
      showToast('Đã thêm các sản phẩm vào lại giỏ hàng');
      navigate('/cart');
    }
  };

  return (
    <div className="space-y-4">
      {/* Heading */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-[17px] font-bold text-ink">Đơn Hàng Của Tôi</h2>
          <p className="text-[12.5px] text-ink-muted">
            Theo dõi trạng thái và lịch sử tất cả các đơn mua của bạn
          </p>
        </div>
        <span className="text-[12.5px] font-bold text-ink-subtle">
          {orders.length} đơn hàng
        </span>
      </div>

      {/* Tabs Filter Bar */}
      <div className="bg-surface rounded-lg border border-line p-1.5 flex items-center gap-1 overflow-x-auto scrollbar-none shadow-2xs">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count =
            tab.key === 'ALL'
              ? orders.length
              : orders.filter((o) => {
                  if (tab.key === 'CANCELED') return o.status === 'CANCELED' || o.status === 'CANCELLED';
                  if (tab.key === 'SHIPPED') return o.status === 'SHIPPED' || o.status === 'SHIPPING';
                  if (tab.key === 'DELIVERED') return o.status === 'DELIVERED' || o.status === 'COMPLETED';
                  return o.status === tab.key;
                }).length;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-md text-[12.5px] font-bold shrink-0 flex items-center gap-1.5 transition ${
                isActive
                  ? 'bg-accent text-white shadow-2xs'
                  : 'text-ink-muted hover:text-ink hover:bg-surface-2'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10.5px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/25 text-white' : 'bg-surface-2 text-ink-muted'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-3.5">
          {filteredOrders.map((order) => {
            const rawItems = order.items || order.orderItems || [];
            const firstItem = rawItems[0] || {};
            const totalItemsCount = rawItems.reduce((sum, it) => sum + (it.quantity || 1), 0) || 1;

            return (
              <div
                key={order.id}
                className="bg-surface rounded-lg border border-line overflow-hidden shadow-2xs transition hover:border-accent/40"
              >
                {/* Order Card Header */}
                <div className="px-5 py-3 border-b border-line flex flex-wrap items-center justify-between gap-3 bg-page/50">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-[13.5px] text-accent">
                      {order.code || order.orderCode || `#ORD-${order.id}`}
                    </span>
                    <span className="text-[12px] text-ink-subtle">
                      {order.createdAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {renderStatusBadge(order.status)}
                  </div>
                </div>

                {/* Order Item Preview */}
                <div className="p-5">
                  <div className="flex items-start gap-3.5">
                    <div className="w-16 h-16 rounded-md bg-surface-2 border border-line overflow-hidden shrink-0 flex items-center justify-center">
                      {firstItem.image || firstItem.productImage || firstItem.imageUrl ? (
                        <img
                          src={firstItem.image || firstItem.productImage || firstItem.imageUrl}
                          alt={firstItem.name || firstItem.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-ink-subtle" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14px] font-bold text-ink line-clamp-1">
                        {firstItem.name || firstItem.productName || firstItem.productNameSnapshot || 'Sản phẩm thể thao'}
                      </h4>
                      <p className="text-[12px] text-ink-muted mt-0.5">
                        Phân loại: {firstItem.variant || firstItem.variantName || firstItem.variantSnapshot || 'Tiêu chuẩn'} · Số lượng: x{firstItem.quantity || 1}
                      </p>
                      {rawItems.length > 1 && (
                        <p className="text-[11.5px] text-ink-subtle mt-1">
                          và {rawItems.length - 1} sản phẩm khác trong kiện hàng...
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[14px] font-extrabold text-accent">
                        {formatCurrency(firstItem.price || firstItem.unitPrice || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Card Footer */}
                <div className="px-5 py-3 border-t border-line bg-page/30 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[12.5px] text-ink-muted">
                    <span>Tổng số lượng: </span>
                    <strong className="text-ink">{totalItemsCount} món</strong>
                    <span className="mx-2">·</span>
                    <span>Thành tiền: </span>
                    <strong className="text-[15px] text-accent font-extrabold">
                      {formatCurrency(order.total || order.totalAmount || 0)}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                      <button
                        type="button"
                        onClick={() => openModal('cancel_order_modal', { orderId: order.id, orderCode: order.orderCode || order.code })}
                        className="px-3 py-1.5 rounded-md border border-line text-danger hover:bg-danger-soft text-[12px] font-bold transition"
                      >
                        Hủy đơn
                      </button>
                    )}

                    {(order.status === 'DELIVERED' || order.status === 'COMPLETED') && (
                      <button
                        type="button"
                        onClick={() =>
                          openModal('review_modal', {
                            productId: firstItem.productId || 1,
                            productName: firstItem.name || firstItem.productName,
                          })
                        }
                        className="px-3 py-1.5 rounded-md border border-line text-amber-600 hover:bg-amber-50 text-[12px] font-bold transition"
                      >
                        Đánh giá
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      className="px-3 py-1.5 rounded-md bg-surface border border-line text-ink text-[12px] font-bold hover:bg-surface-2 transition"
                    >
                      Mua lại
                    </button>

                    <Link
                      to={`/account/orders/${order.id}`}
                      className="px-3.5 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-[12px] font-bold flex items-center gap-1 shadow-2xs transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem chi tiết</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-surface rounded-lg border border-line p-8 shadow-2xs">
          <EmptyState
            title="Không có đơn hàng nào"
            description="Bạn chưa có đơn hàng nào ở trạng thái này."
            actionText="Khám phá sản phẩm ngay"
            actionLink="/products"
          />
        </div>
      )}
    </div>
  );
}
