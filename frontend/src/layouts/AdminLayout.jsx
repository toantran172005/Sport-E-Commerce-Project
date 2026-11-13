import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  ClipboardList,
  Tag,
  Star,
  Users,
  Settings,
  Search,
  ExternalLink,
  Menu,
  Zap,
} from 'lucide-react';
import { useOrder, useAuth, useCatalog } from '../context';
import { ADMIN_PERMISSIONS, ROLE_LABELS_VI } from '../utils/permissions';

const ADMIN_NAV_ITEMS = [
  {
    to: '/admin',
    end: true,
    icon: LayoutDashboard,
    label: 'Tổng Quan',
    badge: null,
    permission: ADMIN_PERMISSIONS.DASHBOARD,
  },
  {
    to: '/admin/products',
    end: false,
    icon: Layers,
    label: 'Sản Phẩm & Biến Thể',
    badge: null,
    permission: ADMIN_PERMISSIONS.PRODUCTS,
  },
  {
    to: '/admin/orders',
    end: false,
    icon: ClipboardList,
    label: 'Quản Lý Đơn Hàng',
    badge: 'orders',
    permission: ADMIN_PERMISSIONS.ORDERS,
  },
  {
    to: '/admin/coupons',
    end: false,
    icon: Tag,
    label: 'Mã Khuyến Mãi (Coupon)',
    badge: null,
    permission: ADMIN_PERMISSIONS.COUPONS,
  },
  {
    to: '/admin/reviews',
    end: false,
    icon: Star,
    label: 'Đánh Giá Khách Hàng',
    badge: 'reviews',
    permission: ADMIN_PERMISSIONS.REVIEWS,
  },
  {
    to: '/admin/staff',
    end: false,
    icon: Users,
    label: 'Quản Lý Nhân Viên',
    badge: null,
    permission: ADMIN_PERMISSIONS.STAFF,
  },
  {
    to: '/admin/settings',
    end: false,
    icon: Settings,
    label: 'Cài Đặt Cửa Hàng',
    badge: null,
    permission: ADMIN_PERMISSIONS.SETTINGS,
  },
];

export default function AdminLayout({
  children,
  searchPlaceholder = 'Tìm kiếm trong quản trị...',
  onSearchChange,
}) {
  const { orders } = useOrder();
  const { user, can } = useAuth();
  const { reviews } = useCatalog();
  const [localSearch, setLocalSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const pendingOrdersCount = orders ? orders.filter((o) => o.status === 'PENDING').length : 0;
  const pendingReviewsCount = reviews ? reviews.filter((r) => r.status === 'PENDING').length : 0;

  const handleSearch = (val) => {
    setLocalSearch(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const visibleNavItems = ADMIN_NAV_ITEMS.filter(
    (item) => !item.permission || (can && can(item.permission))
  );

  const roleLabel = (user?.role && ROLE_LABELS_VI[user.role]) || 'Quản trị viên';

  return (
    <div className="min-h-screen bg-page flex flex-col text-ink transition-colors">
      {/* Top Horizontal Navbar Header */}
      <header className="sticky top-0 z-30 bg-surface border-b border-line shadow-xs">
        {/* Main Top Header Bar */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & CMS Tag */}
          <div className="flex items-center gap-6 shrink-0">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center shadow-xs">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="text-[17px] font-black tracking-tight text-ink">
                Sân Nhà
              </span>
              <span className="px-2 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider">
                CMS
              </span>
            </Link>
          </div>

          {/* Center: Search Box */}
          <div className="relative flex-1 max-w-[360px] hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-page border border-line text-ink text-[12.5px] focus:outline-none focus:border-accent"
            />
          </div>

          {/* Right: Quick actions & Profile */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/"
              className="px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-accent-soft border border-line text-[12px] font-bold text-ink-muted hover:text-accent transition hidden sm:flex items-center gap-1.5"
              title="Quay lại cửa hàng người mua"
            >
              <ExternalLink className="w-3.5 h-3.5 text-accent" />
              <span>Xem Cửa Hàng</span>
            </Link>

            <div
              onClick={() => navigate('/admin/settings')}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-lg bg-surface-2 hover:bg-surface-2/80 border border-line cursor-pointer transition"
              title="Cài đặt quản trị"
            >
              <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'A'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-[12px] font-bold text-ink leading-tight line-clamp-1">
                  {user?.fullName || user?.name || 'Quản trị viên'}
                </p>
                <p className="text-[10px] text-accent font-semibold leading-tight">{roleLabel}</p>
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg border border-line bg-surface-2 text-ink lg:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secondary Sub-navbar: Horizontal Navigation Tabs */}
        <div className="border-t border-line/60 bg-surface-2/30">
          <div className="max-w-[1440px] mx-auto px-4 md:px-6 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1.5">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `whitespace-nowrap flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px] font-bold transition shrink-0 ${
                      isActive
                        ? 'bg-accent text-white shadow-xs'
                        : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge === 'orders' && pendingOrdersCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-danger text-white text-[10px] font-bold">
                      {pendingOrdersCount}
                    </span>
                  )}
                  {item.badge === 'reviews' && pendingReviewsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold animate-pulse">
                      {pendingReviewsCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Mobile dropdown menu if toggled */}
        {isMobileMenuOpen && (
          <div className="border-t border-line p-4 space-y-2 lg:hidden bg-surface">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-semibold transition ${
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
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
