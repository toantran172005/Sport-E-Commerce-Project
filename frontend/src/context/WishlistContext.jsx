/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { useScopedKey } from '../hooks/useScopedKey.js';
import { useUI } from './UIContext.jsx';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { showToast } = useUI();
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

  const toggleWishlist = useCallback((productId) => {
    const exists = wishlistIds.includes(productId);
    setWishlistIds((prev) => (exists ? prev.filter((id) => id !== productId) : [...prev, productId]));
    showToast(exists ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích');
  }, [wishlistIds, setWishlistIds, showToast]);

  const isInWishlist = useCallback((productId) => wishlistIds.includes(productId), [wishlistIds]);

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
