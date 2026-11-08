import { NavLink, Outlet } from 'react-router-dom';
import {
  User,
  MapPin,
  Lock,
  Package,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const NAV_ITEMS = [
  { to: '/account/profile', label: 'Hồ sơ cá nhân', icon: User },
  { to: '/account/orders', label: 'Đơn mua / Lịch sử', icon: Package },
  { to: '/account/addresses', label: 'Sổ địa chỉ', icon: MapPin },
  { to: '/account/password', label: 'Đổi mật khẩu', icon: Lock },
  { to: '/wishlist', label: 'Sản phẩm yêu thích', icon: Heart },
];

export default function AccountLayout() {
  const { user } = useStore();

  return (
    <div className="max-w-[1360px] mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Mobile Horizontal Tabs */}
      <div className="md:hidden mb-5 overflow-x-auto pb-1 scrollbar-none flex items-center gap-1.5 border-b border-line">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-t-md text-[12.5px] font-bold shrink-0 flex items-center gap-1.5 transition border-b-2 ${
                  isActive
                    ? 'border-accent text-accent bg-accent-soft'
                    : 'border-transparent text-ink-muted hover:text-ink'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar */}
        <aside className="hidden md:block md:col-span-3 bg-surface rounded-lg border border-line p-4 space-y-4 shadow-2xs">
          {/* User Brief Info */}
          <div className="flex items-center gap-3 pb-3 border-b border-line">
            <div className="w-12 h-12 rounded-full bg-accent text-white font-bold text-base flex items-center justify-center shrink-0">
              {(user?.fullName || user?.name || 'T').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-extrabold text-ink truncate">
                {user?.fullName || user?.name || 'Khách hàng'}
              </p>
              <p className="text-[11.5px] text-ink-subtle truncate">
                {user?.email || 'user@sannha.vn'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-md text-[13px] font-bold flex items-center justify-between transition ${
                      isActive
                        ? 'bg-accent text-white shadow-2xs'
                        : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Right Content Area */}
        <div className="col-span-1 md:col-span-9 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
