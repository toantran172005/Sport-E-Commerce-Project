/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useCallback } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { useUI } from './UIContext.jsx';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { showToast } = useUI();
  const [wishlistIds, setWishlistIds] = usePersistentState('sport_wishlist', [1, 3]);

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
