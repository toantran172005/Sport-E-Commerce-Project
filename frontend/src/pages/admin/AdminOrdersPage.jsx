import { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import AdminLayout from '../../layouts/AdminLayout';
import { formatCurrency } from '../../utils/formatters';
import { isAwaitingPayment } from '../../utils/orderPayment';

const STATUS_TABS = [
  { id: 'ALL', label: 'Tất cả đơn' },
  { id: 'PENDING', label: 'Chờ duyệt' },
  { id: 'CONFIRMED', label: 'Đã xác nhận' },
  { id: 'PROCESSING', label: 'Đang đóng gói' },
  { id: 'SHIPPED', label: 'Đang giao (SHIPPED)' },
  { id: 'DELIVERED', label: 'Đã giao (DELIVERED)' },
  { id: 'RETURNED', label: 'Hoàn trả (RETURNED)' },
  { id: 'CANCELLED', label: 'Đã hủy (CANCELLED)' },
];

function resolveAdminOrderCustomerName(order) {
  const snapshot = order.shippingAddressSnapshot || order.recipientSnapshot;
  let snapshotName = null;
  if (typeof snapshot === 'string') {
    if (snapshot.includes(' - ')) {
      snapshotName = snapshot.split(' - ')[0]?.trim();
    } else if (snapshot.includes(' • ')) {
      snapshotName = snapshot.split(' • ')[0]?.trim();
    }
  }

  return (
    snapshotName ||
    order.recipientName ||
    order.receiverName ||
    order.customerName ||
    order.adminCustomerName ||
    order.userFullName ||
    order.user?.fullName ||
    'Khách hàng'
  );
}

function resolveAdminOrderShippingAddress(order) {
  const snapshot = order.shippingAddressSnapshot || order.recipientSnapshot;
  let snapshotAddress = null;
  if (typeof snapshot === 'string') {
    if (snapshot.includes(' - ')) {
      const parts = snapshot.split(' - ');
      snapshotAddress = parts.slice(2).join(' - ')?.trim() || parts[parts.length - 1]?.trim();
    } else if (snapshot.includes(' • ')) {
      const parts = snapshot.split(' • ');
      snapshotAddress = parts.slice(2).join(' • ')?.trim() || parts[parts.length - 1]?.trim();
    } else {
      snapshotAddress = snapshot;
    }
  }

  return (
    snapshotAddress ||
    order.shippingAddress ||
    order.userAddress?.fullAddress ||
    order.address ||
    'Địa chỉ nhận hàng'
  );
}

function resolveShippingProviderDisplay(order) {
  const code = (
    order.shippingProviderCode ||
    order.shippingProvider ||
    order.shippingProviderShort ||
    order.shipment?.provider?.code ||
    (order.shipment?.provider?.name?.toLowerCase().includes('tiết kiệm') ? 'GHTK' : '') ||
    (order.shipment?.trackingNumber?.startsWith('GHTK') ? 'GHTK' : '') ||
    (order.shipment?.provider?.name?.toLowerCase().includes('nhanh') ? 'GHN' : '') ||
    ''
  );
  if (code) return code.toUpperCase();
  if (order.shipment?.provider?.name) return order.shipment.provider.name;
  return 'GHTK';
}

export default function AdminOrdersPage() {
  const { orders: storeOrders, adminOrders, fetchAdminOrders, openModal } = useStore();
  const orders = (adminOrders && adminOrders.length > 0) ? adminOrders : storeOrders;
  const [statusTab, setStatusTab] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchAdminOrders?.();
  }, [fetchAdminOrders]);

  const filteredOrders = orders.filter((o) => {
    if (statusTab !== 'ALL') {
      const isCancelledMatch =
        statusTab === 'CANCELLED' && (o.status === 'CANCELLED' || o.status === 'CANCELED');
      if (!isCancelledMatch && o.status !== statusTab) {
        return false;
      }
    }
    if (providerFilter !== 'ALL') {
      const pName = (
        o.shippingProviderShort ||
        o.shippingProvider ||
        o.shipment?.provider?.code ||
        o.shipment?.provider?.name ||
        (o.shipment?.trackingNumber?.startsWith('GHN') ? 'GHN' : '') ||
        (o.shipment?.trackingNumber?.startsWith('GHTK') ? 'GHTK' : '') ||
        ''
      ).toUpperCase();
      if (!pName.includes(providerFilter.toUpperCase())) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const codeMatch = (o.code || o.orderCode || '').toLowerCase().includes(q);
      const custMatch =
        (o.adminCustomerName || o.customerName || '').toLowerCase().includes(q) ||
        (o.shippingAddressSnapshot || '').toLowerCase().includes(q);
      const trackMatch = (
        o.trackingCode ||
        o.shipment?.trackingNumber ||
        ''
      ).toLowerCase().includes(q);
      return codeMatch || custMatch || trackMatch;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusTab, providerFilter, search]);

  const renderStatusBadge = (status, awaitingPayment = false) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold">
            <Clock className="w-3 h-3" />
            <span>{awaitingPayment ? 'Chờ thanh toán' : 'Chờ duyệt'}</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Đã xác nhận</span>
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[11px] font-bold">
            <Package className="w-3 h-3" />
            <span>Đang đóng gói</span>
          </span>
        );
      case 'SHIPPED':
      case 'SHIPPING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-[11px] font-bold">
            <Truck className="w-3 h-3" />
            <span>Đang giao hàng</span>
          </span>
        );
      case 'DELIVERED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Đã giao thành công</span>
          </span>
        );
      case 'RETURNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[11px] font-bold">
            <RotateCcw className="w-3 h-3" />
            <span>Hoàn trả (RETURNED)</span>
          </span>
        );
      case 'CANCELLED':
      case 'CANCELED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-bold">
            <XCircle className="w-3 h-3" />
            <span>Đã hủy</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-2 text-ink-muted border border-line text-[11px] font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <AdminLayout
      searchPlaceholder="Tìm mã đơn (#ORD-...), tên khách, SĐT, mã vận đơn GHN/GHTK..."
      onSearchChange={setSearch}
    >
      <div className="space-y-6 text-ink">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-extrabold text-ink flex items-center gap-2">
              <FileText className="w-6 h-6 text-accent" />
              <span>Quản Lý Đơn Hàng &amp; Vận Đơn</span>
            </h1>
            <p className="text-[13px] text-ink-muted mt-0.5">
              Quản trị bảng <code className="font-bold text-accent">orders</code>,{' '}
              <code className="font-bold text-accent">order_items</code>,{' '}
              <code className="font-bold text-accent">payments</code> &amp;{' '}
              <code className="font-bold text-accent">shipments</code>
            </p>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-surface rounded-lg border border-line overflow-hidden shadow-xs">
          {/* Status Tabs */}
          <div className="px-6 pt-4 border-b border-line flex flex-wrap items-center justify-between gap-4 bg-surface-2/40">
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_TABS.map((t) => {
                const isActive = statusTab === t.id;
                const count =
                  t.id === 'ALL'
                    ? orders.length
                    : orders.filter((o) => {
                        if (t.id === 'CANCELLED')
                          return o.status === 'CANCELLED' || o.status === 'CANCELED';
                        if (t.id === 'SHIPPED')
                          return o.status === 'SHIPPED' || o.status === 'SHIPPING';
                        if (t.id === 'DELIVERED')
                          return o.status === 'DELIVERED' || o.status === 'COMPLETED';
                        return o.status === t.id;
                      }).length;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setStatusTab(t.id)}
                    className={`px-3 py-1.5 mb-3 rounded-md text-[12px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-accent text-white shadow-xs'
                        : 'bg-surface border border-line text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>{t.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-surface-2 text-ink-muted'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pb-3 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-ink-muted" />
              <span className="text-[12px] font-bold text-ink-muted">Lọc theo đơn vị vận chuyển:</span>
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="h-8 px-2.5 rounded-md bg-page border border-line text-[12px] font-bold text-ink focus:outline-none focus:border-accent"
              >
                <option value="ALL">Tất cả đơn vị</option>
                <option value="GHN">Giao Hàng Nhanh (GHN)</option>
                <option value="GHTK">Giao Hàng Tiết Kiệm (GHTK)</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-surface-2 text-[11px] font-extrabold uppercase text-ink-muted border-b border-line">
                  <th className="py-3 px-4">MÃ ĐƠN &amp; NGÀY TẠO</th>
                  <th className="py-3 px-4">KHÁCH HÀNG &amp; ĐỊA CHỈ</th>
                  <th className="py-3 px-4">MẶT HÀNG</th>
                  <th className="py-3 px-4">TỔNG TIỀN &amp; THANH TOÁN</th>
                  <th className="py-3 px-4">VẬN CHUYỂN</th>
                  <th className="py-3 px-4">TRẠNG THÁI</th>
                  <th className="py-3 px-4 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => {
                    const firstItem = order.items?.[0] || order.orderItems?.[0] || {};
                    const totalQty =
                      order.items?.reduce((s, it) => s + (it.quantity || 1), 0) ||
                      order.orderItems?.reduce((s, it) => s + (it.quantity || 1), 0) ||
                      1;

                    return (
                      <tr key={order.id} className="hover:bg-surface-2/60 transition">
                        <td className="py-3.5 px-4">
                          <p className="font-mono font-extrabold text-[13.5px] text-accent">
                            {order.code || order.orderCode}
                          </p>
                          <p className="text-[11px] text-ink-subtle mt-0.5">
                            {order.createdAt}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-ink">
                            {resolveAdminOrderCustomerName(order)}
                          </p>
                          <p className="text-[11.5px] text-ink-muted line-clamp-1 max-w-[200px]">
                            {resolveAdminOrderShippingAddress(order)}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-ink line-clamp-1 max-w-[200px]">
                            {firstItem.name || firstItem.productName || 'Sản phẩm thể thao'}
                          </p>
                          <p className="text-[11px] text-ink-subtle">
                            {totalQty} sản phẩm trong đơn
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-extrabold text-accent">
                            {formatCurrency(order.total || order.totalAmount || 0)}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="text-[10.5px] text-ink-muted">
                              {order.paymentMethod === 'BANK_TRANSFER' ? 'VNPay QR' : 'COD'}
                            </span>
                            {(order.paymentStatus === 'PAID' ||
                              order.payment?.status === 'PAID' ||
                              (order.paymentMethod === 'COD' && (order.status === 'DELIVERED' || order.status === 'COMPLETED'))) ? (
                              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Đã thanh toán (PAID)
                              </span>
                            ) : order.paymentMethod === 'BANK_TRANSFER' ? (
                              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Chờ thanh toán
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                Thu tiền COD
                              </span>
                            )}
                            {(order.payment?.status === 'REFUND' || order.paymentStatus === 'REFUND') && (
                              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                Đã hoàn tiền (REFUND)
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-surface-2 text-ink text-[11px] font-bold border border-line">
                            {resolveShippingProviderDisplay(order)}
                          </span>
                          {(order.trackingCode || order.trackingNumber || order.shipment?.trackingNumber) && (
                            <p className="text-[10.5px] text-ink-subtle font-mono mt-0.5">
                              {order.trackingCode || order.trackingNumber || order.shipment?.trackingNumber}
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {renderStatusBadge(order.status, isAwaitingPayment(order))}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => openModal('admin_order_modal', { order })}
                            className="px-2.5 py-1 rounded bg-accent-soft text-accent font-bold hover:bg-accent hover:text-white text-[11.5px] transition cursor-pointer"
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-ink-subtle">
                      Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-ink-muted">
              <div>
                Hiển thị <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> –{' '}
                <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}</strong> trên tổng số{' '}
                <strong>{filteredOrders.length}</strong> đơn hàng
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-md border border-line bg-surface hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-ink transition cursor-pointer"
                >
                  Trước
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-ink-subtle">…</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-md text-[12px] font-bold transition cursor-pointer ${
                          p === currentPage
                            ? 'bg-accent text-white shadow-xs'
                            : 'border border-line bg-surface hover:bg-surface-2 text-ink'
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-md border border-line bg-surface hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-ink transition cursor-pointer"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
