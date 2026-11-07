import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Zap,
  Menu,
  Search,
  Heart,
  Bell,
  ShoppingCart,
  ChevronDown,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import CategoriesDropdown from './CategoriesDropdown.jsx';
import NotificationsDropdown from './NotificationsDropdown.jsx';
import UserDropdown from './UserDropdown.jsx';

export default function Header() {
  const {
    user,
    cartItemCount,
    notifications,
    products,
    isCategoriesOpen,
    setIsCategoriesOpen,
    isNotificationsOpen,
    setIsNotificationsOpen,
    isUserMenuOpen,
    setIsUserMenuOpen,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isWishlistPage = location.pathname === '/wishlist';
  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;
  const searchContainerRef = useRef(null);

  // Suggestions filter
  const suggestions = searchTerm.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sportType?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 6)
    : [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearchFocused(false);
      navigate(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-surface shadow-xs border-b border-line">
      {/* Main Header Bar */}
      <div className="relative">
        <div className="max-w-[1360px] mx-auto px-4 md:px-6 h-[64px] flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-accent text-white flex items-center justify-center shadow-xs group-hover:bg-accent-hover transition">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="text-[19px] font-extrabold text-ink tracking-tight leading-none block">
                  Sân Nhà
                </span>
                <p className="text-[11px] text-ink-subtle mt-0.5 font-medium hidden sm:block">
                  Đồ thể thao cho người chơi thật
                </p>
              </div>
            </Link>
          </div>

          {/* Category Trigger */}
          <button
            type="button"
            onClick={() => {
              setIsCategoriesOpen(!isCategoriesOpen);
              setIsNotificationsOpen(false);
              setIsUserMenuOpen(false);
            }}
            className={`hidden lg:flex px-3.5 py-2 rounded-md text-[13px] font-bold items-center gap-2 transition shrink-0 ${
              isCategoriesOpen
                ? 'bg-accent text-white shadow-xs'
                : 'bg-surface-2 hover:bg-line text-ink'
            }`}
          >
            <Menu className="w-4 h-4" />
            <span>Danh mục</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isCategoriesOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Search Bar with Autocomplete & History */}
          <div ref={searchContainerRef} className="flex-1 max-w-[480px] relative">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
                <input
                  type="text"
                  value={searchTerm}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm vợt cầu lông, giày chạy bộ, bóng đá..."
                  className="w-full h-9.5 pl-9 pr-8 rounded-md bg-page border border-line focus:border-accent focus:bg-surface focus:outline-none text-[13px] text-ink placeholder:text-ink-subtle transition"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Suggestions Dropdown (Chỉ hiển thị khi đang focus VÀ đã gõ từ khóa, không hiển thị ô trắng rỗng) */}
            {isSearchFocused && searchTerm.trim() && (
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-surface rounded-lg shadow-xl border border-line p-3 z-50 animate-in fade-in duration-100">
                {suggestions.length > 0 ? (
                  <div>
                    <p className="text-[11px] font-bold text-ink-subtle uppercase tracking-wider mb-1.5">
                      Sản phẩm gợi ý
                    </p>
                    <div className="space-y-1">
                      {suggestions.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setIsSearchFocused(false);
                            navigate(`/products/${p.id}`);
                          }}
                          className="px-2.5 py-1.5 rounded-md hover:bg-surface-2 flex items-center justify-between cursor-pointer transition"
                        >
                          <span className="text-[12.5px] font-medium text-ink line-clamp-1">
                            {p.name}
                          </span>
                          <span className="text-[11.5px] font-bold text-accent shrink-0 ml-2">
                            {formatCurrency(p.salePrice || p.basePrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-center text-[12.5px] text-ink-muted">
                    Không tìm thấy sản phẩm phù hợp cho &quot;{searchTerm}&quot;
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Wishlist & Notifications - ONLY for Logged-in Users */}
            {user && (
              <>
                {/* Wishlist Link */}
                <Link
                  to="/wishlist"
                  title="Danh sách yêu thích"
                  className={`w-9 h-9 rounded-md flex items-center justify-center transition border ${
                    isWishlistPage
                      ? 'bg-accent-soft border-accent text-accent'
                      : 'bg-surface border-line text-ink-muted hover:bg-surface-2 hover:text-ink'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                </Link>

                {/* Notifications Popover */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      setIsCategoriesOpen(false);
                      setIsUserMenuOpen(false);
                    }}
                    title="Thông báo"
                    className={`w-9 h-9 rounded-md flex items-center justify-center relative transition border ${
                      isNotificationsOpen
                        ? 'bg-accent-soft border-accent text-accent'
                        : 'bg-surface border-line text-ink-muted hover:bg-surface-2 hover:text-ink'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotifCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadNotifCount}
                      </span>
                    )}
                  </button>
                  <NotificationsDropdown />
                </div>
              </>
            )}

            {/* Cart Icon - Accessible to both Guests and Logged-in Users */}
            <Link
              to="/cart"
              title="Giỏ hàng"
              className="w-9 h-9 rounded-md bg-surface border border-line hover:bg-surface-2 text-ink-muted hover:text-ink flex items-center justify-center relative transition shadow-xs"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Profile Menu or Guest Login */}
            {user ? (
              <div className="relative ml-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(!isUserMenuOpen);
                    setIsCategoriesOpen(false);
                    setIsNotificationsOpen(false);
                  }}
                  className="h-9 px-2 rounded-md bg-accent-soft hover:bg-surface-2 border border-line flex items-center gap-1.5 transition cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-accent text-white text-[11px] font-bold flex items-center justify-center">
                    {(user.fullName || user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[12px] font-bold text-ink hidden sm:inline max-w-[100px] truncate">
                    {user.fullName?.split(' ').pop() || user.name || 'Tài khoản'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
                </button>
                <UserDropdown />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 ml-1">
                <Link
                  to="/login"
                  className="h-9 px-3 rounded-md bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold flex items-center justify-center transition shadow-xs"
                >
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Categories Dropdown Container */}
        <CategoriesDropdown />
      </div>
    </header>
  );
}
