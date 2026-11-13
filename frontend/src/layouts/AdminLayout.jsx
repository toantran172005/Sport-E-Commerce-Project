import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  ClipboardList,
  Tag,
  Star,
  Settings,
  Search,
  ExternalLink,
  UserCog,
} from 'lucide-react';
import { useOrder, useAuth, useCatalog } from '../context';
import BrandLogo from '../components/common/BrandLogo.jsx';
import Avatar from '../components/common/Avatar.jsx';

const ADMIN_NAV_ITEMS = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Tổng Quan', badge: null },
  { to: '/admin/products', end: false, icon: Layers, label: 'Sản Phẩm & Biến Thể', badge: null },
  { to: '/admin/orders', end: false, icon: ClipboardList, label: 'Quản Lý Đơn Hàng', badge: 'orders' },
  { to: '/admin/coupons', end: false, icon: Tag, label: 'Mã Khuyến Mãi (Coupon)', badge: null },
  { to: '/admin/reviews', end: false, icon: Star, label: 'Đánh Giá Khách Hàng', badge: 'reviews' },
  { to: '/admin/staff', end: false, icon: UserCog, label: 'Tài Khoản Nhân Viên', badge: null, adminOnly: true },
  { to: '/admin/settings', end: false, icon: Settings, label: 'Cài Đặt Cửa Hàng', badge: null },
];

export default function AdminLayout({
  children,
  searchPlaceholder = 'Tìm kiếm trong quản trị...',
  onSearchChange,
}) {
  const { orders } = useOrder();
  const { user } = useAuth();
  const { reviews } = useCatalog();
  const [localSearch, setLocalSearch] = useState('');
  const navigate = useNavigate();

  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;
  const pendingReviewsCount = reviews ? reviews.filter((r) => r.status === 'PENDING').length : 0;

  const handleSearch = (val) => {
    setLocalSearch(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  return (
    <div className="min-h-screen bg-page flex text-ink transition-colors">
      {/* Left Sidebar (Fully responsive to Light/Dark Mode) */}
      <aside className="w-[260px] bg-surface text-ink flex flex-col justify-between p-4 shrink-0 border-r border-line transition-colors">
        <div>
          {/* Logo */}
          <Link to="/admin" className="flex items-center gap-2.5 px-2 py-3 mb-4">
            <BrandLogo className="h-8 w-auto" />
            <span className="px-2 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider">
              CMS
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {ADMIN_NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === 'ADMIN').map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[13px] font-semibold transition ${
                      isActive
                        ? 'bg-accent text-white shadow-xs'
                        : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                    }`
                  }
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge === 'orders' && pendingOrdersCount > 0 && (
                    <span className="px-2 py-0.2 rounded-full bg-danger text-white text-[10.5px] font-bold">
                      {pendingOrdersCount}
                    </span>
                  )}
                  {item.badge === 'reviews' && pendingReviewsCount > 0 && (
                    <span className="px-2 py-0.2 rounded-full bg-amber-500 text-white text-[10.5px] font-bold animate-pulse">
                      {pendingReviewsCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Storefront link, Profile */}
        <div className="space-y-2 pt-4 border-t border-line">
          <Link
            to="/"
            className="w-full px-3 py-2 rounded-md bg-surface-2 hover:bg-accent-soft border border-line flex items-center justify-between text-[12px] font-medium text-ink-muted hover:text-accent transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-accent" />
              <span>Xem Cửa Hàng (Client)</span>
            </span>
            <span className="text-[10px] text-ink-subtle">Trang chủ</span>
          </Link>

          <div
            onClick={() => navigate('/admin/settings')}
            className="p-2.5 rounded-md bg-surface-2 hover:bg-surface-2/80 border border-line cursor-pointer flex items-center gap-2.5 transition"
          >
            <Avatar user={user} name={user?.fullName || 'Admin'} size={32} />
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-bold text-ink truncate">
                {user?.fullName || 'Quản trị viên'}
              </p>
              <p className="text-[10.5px] text-ink-subtle truncate">Admin Hệ Thống</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main CMS Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-page">
        {/* Top Header */}
        <header className="h-16 bg-surface border-b border-line px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="relative w-full max-w-[380px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-9 pl-9 pr-3 rounded-md bg-page border border-line text-ink text-[12.5px] focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11.5px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Hệ thống hoạt động ổn định</span>
            </span>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
