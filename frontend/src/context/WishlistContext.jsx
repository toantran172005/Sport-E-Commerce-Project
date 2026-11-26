/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { useScopedKey } from '../hooks/useScopedKey.js';
import { useUI } from './UIContext.jsx';
import { useAuth } from './AuthContext.jsx';
import { wishlistService } from '../services/wishlistService.js';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { showToast } = useUI();
  const { user } = useAuth();
  const wishlistKey = useScopedKey('sport_wishlist');
  const [wishlistIds, setWishlistIds] = usePersistentState(wishlistKey, []);

  // Xóa sạch key cũ nếu từng lưu [1, 3] trong localStorage
  useEffect(() => {
    try {
      localStorage.removeItem('sport_wishlist');
    } catch {
      // ignore
    }
  }, []);

  // Khi đã đăng nhập: tải danh sách ID yêu thích trực tiếp từ database server
  useEffect(() => {
    if (!user) return;
    let active = true;
    wishlistService
      .getWishlistIds()
      .then((ids) => {
        if (active && Array.isArray(ids)) {
          setWishlistIds(ids);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user, setWishlistIds]);

  const toggleWishlist = useCallback(
    async (productId) => {
      const numId = Number(productId);
      const exists = wishlistIds.includes(numId);
      const nextAdded = !exists;

      // Optimistic update: phản hồi tức thì 0ms trên giao diện
      setWishlistIds((prev) =>
        nextAdded ? (prev.includes(numId) ? prev : [...prev, numId]) : prev.filter((id) => id !== numId)
      );
      showToast(nextAdded ? 'Đã thêm vào danh sách yêu thích' : 'Đã xóa khỏi danh sách yêu thích');

      if (user) {
        try {
          await wishlistService.toggleWishlist(numId);
        } catch (err) {
          // Rollback nếu gọi API thất bại
          setWishlistIds((prev) =>
            exists ? (prev.includes(numId) ? prev : [...prev, numId]) : prev.filter((id) => id !== numId)
          );
          showToast(err.message || 'Không thể cập nhật danh sách yêu thích', 'error');
        }
      }
    },
    [wishlistIds, setWishlistIds, showToast, user]
  );

  const isInWishlist = useCallback((productId) => wishlistIds.includes(Number(productId)), [wishlistIds]);

  const value = useMemo(
    () => ({
      wishlistIds,
      setWishlistIds,
      toggleWishlist,
      isInWishlist,
    }),
    [wishlistIds, setWishlistIds, toggleWishlist, isInWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist phải được sử dụng bên trong WishlistProvider');
  }
  return ctx;
}
