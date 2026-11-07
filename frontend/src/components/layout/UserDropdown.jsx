import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Heart,
  Store,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';

export default function UserDropdown() {
  const {
    user,
    setUser,
    orders,
    wishlistIds,
    isUserMenuOpen,
    setIsUserMenuOpen,
    isDarkMode,
    toggleDarkMode,
    showToast,
  } = useStore();
  const navigate = useNavigate();

  if (!isUserMenuOpen) return null;

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    localStorage.removeItem('sport_user');
    localStorage.removeItem('token');
    setUser(null);
    showToast('Đã đăng xuất thành công');
    navigate('/login');
  };

  const displayName = user?.fullName || user?.name || 'Khách hàng';
  const displayEmail = user?.email || 'khach@sannha.vn';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => setIsUserMenuOpen(false)}
      />

      <div className="absolute right-0 top-[calc(100%+8px)] w-[280px] bg-surface rounded-lg shadow-xl border border-line z-50 overflow-hidden animate-in fade-in duration-150 text-ink">
        {/* User profile header */}
        <div className="p-4 border-b border-line flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent text-white font-bold text-base flex items-center justify-center shrink-0">
            {displayName.charAt(0)}
          </div>
          <div className="min-w-0">
            <h4 className="text-[14px] font-bold text-ink truncate">
              {displayName}
            </h4>
            <p className="text-[11.5px] text-ink-muted truncate">{displayEmail}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-accent-soft text-accent text-[10.5px] font-bold">
              {isAdmin ? 'Quản trị viên' : 'Khách hàng thân thiết'}
            </span>
          </div>
        </div>

        {/* Menu links */}
        <div className="p-2 space-y-1">
          <Link
            to="/account/profile"
            onClick={() => setIsUserMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-semibold text-ink hover:bg-accent-soft hover:text-accent transition"
          >
            <span className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-ink-muted" />
              <span>Hồ sơ cá nhân</span>
            </span>
          </Link>

          <Link
            to="/account/orders"
            onClick={() => setIsUserMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-semibold text-ink hover:bg-accent-soft hover:text-accent transition"
          >
            <span className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-ink-muted" />
              <span>Đơn hàng của tôi</span>
            </span>
            <span className="bg-accent text-white text-[10.5px] font-bold px-2 py-0.5 rounded-full">
              {orders.length}
            </span>
          </Link>

          <Link
            to="/account/addresses"
            onClick={() => setIsUserMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-semibold text-ink hover:bg-accent-soft hover:text-accent transition"
          >
            <span className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-ink-muted" />
              <span>Sổ địa chỉ nhận hàng</span>
            </span>
          </Link>

          <Link
            to="/wishlist"
            onClick={() => setIsUserMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-semibold text-ink hover:bg-accent-soft hover:text-accent transition"
          >
            <span className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-ink-muted" />
              <span>Danh sách yêu thích</span>
            </span>
            <span className="text-[11px] font-bold text-ink-muted">
              {wishlistIds.length}
            </span>
          </Link>

          {/* Quick link to Seller CMS (Only for ADMIN role) */}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsUserMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-semibold text-accent bg-accent-soft hover:bg-accent-soft/80 transition"
            >
              <span className="flex items-center gap-2.5">
                <Store className="w-4 h-4" />
                <span>Kênh Quản Trị Người Bán</span>
              </span>
              <span className="text-[10.5px] font-bold">Chủ shop</span>
            </Link>
          )}
        </div>

        {/* Theme toggle & Logout */}
        <div className="p-2 border-t border-line space-y-1">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-[12.5px] font-semibold text-ink-muted hover:bg-surface-2 transition cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              {isDarkMode ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4" />}
              <span>{isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}</span>
            </span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[12.5px] font-semibold text-danger hover:bg-danger-soft transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </>
  );
}
