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

  useEffect(() => {
    try {
      localStorage.removeItem('sport_wishlist');
    } catch {
      /* ignore */
    }
  }, []);

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

      setWishlistIds((prev) =>
        nextAdded ? (prev.includes(numId) ? prev : [...prev, numId]) : prev.filter((id) => id !== numId)
      );
      showToast(nextAdded ? 'Đã thêm vào danh sách yêu thích' : 'Đã xóa khỏi danh sách yêu thích');

      if (user) {
        try {
          await wishlistService.toggleWishlist(numId);
        } catch (err) {
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
