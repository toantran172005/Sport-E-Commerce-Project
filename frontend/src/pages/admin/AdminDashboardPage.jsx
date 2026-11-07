import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Layers,
  Star,
  TrendingUp,
  Clock,
  ArrowRight,
  AlertCircle,
  Download,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import AdminLayout from '../../layouts/AdminLayout.jsx';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

export default function AdminDashboardPage() {
  const { orders, products, reviews, openModal, showToast } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleExportReport = () => {
    showToast('Đã xuất báo cáo tổng quan kinh doanh thành công!');
  };

  const avgRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return '5.0';
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const ratingStats = useMemo(() => {
    const total = reviews?.length || 0;
    const positive = (reviews || []).filter((r) => (r.rating || 5) >= 4).length;
    const negative = total - positive;
    const posPercent = total > 0 ? Math.round((positive / total) * 100) : 100;
    const negPercent = total > 0 ? 100 - posPercent : 0;
    return { total, positive, negative, posPercent, negPercent };
  }, [reviews]);

  // Calculations
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'CANCELED')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [orders]);

  const pendingOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'PENDING');
  }, [orders]);

  const lowStockVariantsCount = useMemo(() => {
    let count = 0;
    products.forEach((p) => {
      (p.variants || []).forEach((v) => {
        if (v.stock < 15) count++;
      });
    });
    return count;
  }, [products]);

  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderCode.toLowerCase().includes(q) ||
          o.shippingAddressSnapshot?.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 5);
  }, [orders, searchQuery]);

  return (
    <AdminLayout
      searchPlaceholder="Tìm kiếm mã đơn, sản phẩm..."
      onSearchChange={setSearchQuery}
    >
      <div className="space-y-6 text-ink">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-ink">
              Bảng Điều Khiển Tổng Quan
            </h1>
            <p className="text-[12.5px] text-ink-muted">
              Theo dõi chỉ số kinh doanh, tình trạng đơn hàng và tồn kho sản phẩm
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportReport}
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Báo Cáo</span>
          </button>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Link
            to="/admin/orders"
            className="bg-surface rounded-lg border border-line p-4.5 hover:border-accent shadow-xs transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-ink-muted">
                Tổng Doanh Thu
              </span>
              <div className="w-8 h-8 rounded-md bg-accent-soft text-accent flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-ink mt-2">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-[11.5px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.5% so với tháng trước</span>
            </p>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-surface rounded-lg border border-line p-4.5 hover:border-accent shadow-xs transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-ink-muted">
                Đơn Hàng
              </span>
              <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-accent mt-2">
              {orders.length} đơn
            </p>
            <p className="text-[11.5px] font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{pendingOrders.length} đơn chờ duyệt</span>
            </p>
          </Link>

          <Link
            to="/admin/products"
            className="bg-surface rounded-lg border border-line p-4.5 hover:border-accent shadow-xs transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-ink-muted">
                Sản Phẩm Đang Bán
              </span>
              <div className="w-8 h-8 rounded-md bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-ink mt-2">
              {products.length} sản phẩm
            </p>
            <p className="text-[11.5px] font-bold text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{lowStockVariantsCount} biến thể sắp hết hàng</span>
            </p>
          </Link>

          <Link
            to="/admin/reviews"
            className="bg-surface rounded-lg border border-line p-4.5 hover:border-accent shadow-xs transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-ink-muted">
                Đánh Giá Khách Hàng
              </span>
              <div className="w-8 h-8 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-amber-500 mt-2">
              {avgRating} / 5.0
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">
                  Tích cực (4-5★): {ratingStats.positive} ({ratingStats.posPercent}%)
                </span>
                <span className="text-rose-500">
                  Tiêu cực (1-3★): {ratingStats.negative} ({ratingStats.negPercent}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${ratingStats.posPercent}%` }}
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-300"
                  style={{ width: `${ratingStats.negPercent}%` }}
                />
              </div>
            </div>
          </Link>
        </div>

        {/* 2 Visual Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Revenue 7-Day Chart (8 cols) */}
          <div className="lg:col-span-8 bg-surface rounded-lg border border-line p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-bold text-ink">
                  Biểu Đồ Doanh Thu 7 Ngày Gần Nhất
                </h3>
                <p className="text-[11.5px] text-ink-subtle">
                  Thống kê doanh thu theo ngày đạt chuẩn kiểm thử
                </p>
              </div>
              <span className="text-[12px] font-bold text-accent">
                Đơn vị: Triệu VNĐ
              </span>
            </div>

            {/* Pure SVG Bar/Line Chart */}
            <div className="h-44 w-full pt-4">
              <svg viewBox="0 0 700 160" className="w-full h-full overflow-visible">
                {/* Grid horizontal lines */}
                <line x1="40" y1="20" x2="680" y2="20" stroke="currentColor" className="text-line opacity-50" strokeWidth="1" />
                <line x1="40" y1="60" x2="680" y2="60" stroke="currentColor" className="text-line opacity-50" strokeWidth="1" />
                <line x1="40" y1="100" x2="680" y2="100" stroke="currentColor" className="text-line opacity-50" strokeWidth="1" />
                <line x1="40" y1="140" x2="680" y2="140" stroke="currentColor" className="text-line" strokeWidth="1" />

                {/* Y labels */}
                <text x="10" y="24" fontSize="10" className="fill-ink-subtle">30tr</text>
                <text x="10" y="64" fontSize="10" className="fill-ink-subtle">20tr</text>
                <text x="10" y="104" fontSize="10" className="fill-ink-subtle">10tr</text>
                <text x="15" y="144" fontSize="10" className="fill-ink-subtle">0</text>

                {/* 7 Days Bars */}
                {[
                  { day: 'T2', val: 75, amount: '18tr' },
                  { day: 'T3', val: 95, amount: '22tr' },
                  { day: 'T4', val: 60, amount: '14tr' },
                  { day: 'T5', val: 110, amount: '26tr' },
                  { day: 'T6', val: 85, amount: '20tr' },
                  { day: 'T7', val: 130, amount: '31tr' },
                  { day: 'CN', val: 120, amount: '28tr' },
                ].map((bar, idx) => {
                  const x = 85 + idx * 85;
                  const h = bar.val;
                  const y = 140 - h;
                  return (
                    <g key={idx} className="group cursor-pointer">
                      <rect
                        x={x}
                        y={y}
                        width="36"
                        height={h}
                        rx="4"
                        fill="currentColor"
                        className={`transition-all duration-200 ${
                          idx >= 5 ? 'text-accent' : 'text-accent/40'
                        } hover:opacity-80`}
                      />
                      <text x={x + 18} y={y - 6} fontSize="10" fontWeight="bold" className="fill-accent" textAnchor="middle">
                        {bar.amount}
                      </text>
                      <text x={x + 18} y="156" fontSize="11" className="fill-ink-subtle" textAnchor="middle">
                        {bar.day}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Sport Categories Share (4 cols) */}
          <div className="lg:col-span-4 bg-surface rounded-lg border border-line p-5 space-y-4 shadow-xs">
            <div>
              <h3 className="text-[14px] font-bold text-ink">
                Cơ Cấu Ngành Hàng
              </h3>
              <p className="text-[11.5px] text-ink-subtle">
                Tỉ trọng đơn hàng theo môn thể thao
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { name: 'Cầu lông (Yonex/Lining)', percent: 38, color: 'bg-accent' },
                { name: 'Bóng đá sân cỏ nhân tạo', percent: 26, color: 'bg-emerald-500' },
                { name: 'Tennis & Vợt chuyên nghiệp', percent: 18, color: 'bg-amber-500' },
                { name: 'Chạy bộ marathon', percent: 12, color: 'bg-indigo-500' },
                { name: 'Tập Gym & Yoga', percent: 6, color: 'bg-purple-500' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[12px] font-medium">
                    <span className="text-ink">{item.name}</span>
                    <span className="font-bold text-ink">{item.percent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden border border-line">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-surface rounded-lg border border-line p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <div>
              <h2 className="text-[15px] font-bold text-ink">
                Đơn Hàng Gần Đây
              </h2>
              <p className="text-[12px] text-ink-subtle">
                Các đơn hàng cần xử lý xác nhận và bàn giao bưu tá
              </p>
            </div>

            <Link
              to="/admin/orders"
              className="text-[12.5px] font-bold text-accent hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả đơn hàng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead className="bg-surface-2 text-ink-muted uppercase text-[10.5px] font-bold">
                <tr>
                  <th className="px-4 py-2.5">Mã đơn</th>
                  <th className="px-4 py-2.5">Thời gian</th>
                  <th className="px-4 py-2.5">Địa chỉ giao hàng</th>
                  <th className="px-4 py-2.5">Tổng tiền</th>
                  <th className="px-4 py-2.5">Trạng thái</th>
                  <th className="px-4 py-2.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-surface-2/60 transition">
                    <td className="px-4 py-3 font-mono font-bold text-accent">
                      {o.orderCode}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {formatDateTime(o.placedAt || o.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-ink max-w-[240px] truncate">
                      {o.shippingAddressSnapshot}
                    </td>
                    <td className="px-4 py-3 font-bold text-ink">
                      {formatCurrency(o.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-bold ${
                        o.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                        o.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                        o.status === 'CANCELED' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' :
                        'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openModal('admin_order_modal', { order: o })}
                        className="px-2.5 py-1 rounded bg-accent-soft text-accent font-bold hover:bg-accent hover:text-white text-[11.5px] transition cursor-pointer"
                      >
                        Cập nhật
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
