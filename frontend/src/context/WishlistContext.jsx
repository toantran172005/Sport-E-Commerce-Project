/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useCallback, useEffect, useState } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { useUI } from './UIContext.jsx';
import { wishlistService } from '../services/wishlistService.js';

const WishlistContext = createContext(null);
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export function WishlistProvider({ children }) {
  const { showToast } = useUI();
  const [wishlistIds, setWishlistIds] = usePersistentState('sport_wishlist', [1, 3]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  useEffect(() => {
    if (!USE_MOCK) {
      setLoadingWishlist(true);
      wishlistService
        .getWishlistIds()
        .then((data) => {
          if (Array.isArray(data)) {
            setWishlistIds(data);
          }
        })
        .catch(() => {})
        .finally(() => {
          setLoadingWishlist(false);
        });
    }
  }, [setWishlistIds]);

  const toggleWishlist = useCallback(
    (productId) => {
      const numId = Number(productId);
      const exists = wishlistIds.includes(numId);
      setWishlistIds((prev) => (exists ? prev.filter((id) => id !== numId) : [...prev, numId]));
      showToast(exists ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích');

      if (!USE_MOCK) {
        wishlistService.toggleWishlist(numId).catch(() => {});
      }
    },
    [wishlistIds, setWishlistIds, showToast]
  );

  const isInWishlist = useCallback((productId) => wishlistIds.includes(Number(productId)), [wishlistIds]);

  const value = useMemo(
    () => ({
      wishlistIds,
      setWishlistIds,
      loadingWishlist,
      toggleWishlist,
      isInWishlist,
    }),
    [wishlistIds, setWishlistIds, loadingWishlist, toggleWishlist, isInWishlist]
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
