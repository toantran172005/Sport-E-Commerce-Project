/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { useScopedKey } from '../hooks/useScopedKey.js';
import { useUI } from './UIContext.jsx';
import { useAuth } from './AuthContext.jsx';
import { cartService } from '../services/cartService.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const CartContext = createContext(null);

export const DEFAULT_CART_ITEMS = () => [];

function mapServerCartItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((it) => ({
    ...it,
    name: it.productName || it.name || '',
    imageUrl: it.imageUrl || it.image,
    stock: it.stock ?? 20,
  }));
}

export function CartProvider({ children }) {
  const { showToast } = useUI();
  const { user } = useAuth();

  // Khóa localStorage phân tách theo từng người dùng (sport_cart:<userId> hoặc sport_cart:guest)
  const cartKey = useScopedKey('sport_cart');
  const selectedCartKey = useScopedKey('sport_selected_cart');

  const [cart, setCart] = usePersistentState(cartKey, []);
  const [selectedCartItemKeys, setSelectedCartItemKeys] = usePersistentState(selectedCartKey, []);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Xóa sạch key dùng chung cũ (sport_cart / sport_selected_cart) nếu còn lưu mock data trong trình duyệt
  useEffect(() => {
    try {
      localStorage.removeItem('sport_cart');
      localStorage.removeItem('sport_selected_cart');
    } catch {
      // ignore
    }
  }, []);

  // Khi đã đăng nhập và chạy chế độ thật: đồng bộ giỏ Guest (nếu có) và tải giỏ từ server
  useEffect(() => {
    if (USE_MOCK || !user) return;
    let active = true;

    const loadAndSync = async () => {
      try {
        let guestItems = [];
        try {
          guestItems = JSON.parse(localStorage.getItem('sport_cart:guest') || '[]');
        } catch {
          guestItems = [];
        }

        let res;
        if (Array.isArray(guestItems) && guestItems.length > 0) {
          const validItems = guestItems.filter((i) => i.variantId);
          if (validItems.length > 0) {
            res = await cartService.syncCart(validItems);
          } else {
            res = await cartService.getCart();
          }
          try {
            localStorage.removeItem('sport_cart:guest');
            localStorage.removeItem('sport_selected_cart:guest');
          } catch {
            // ignore
          }
        } else {
          res = await cartService.getCart();
        }

        if (active && res && Array.isArray(res.items)) {
          setCart(mapServerCartItems(res.items));
        }
      } catch {
        // Fallback giữ nguyên local state nếu lỗi mạng
      }
    };

    loadAndSync();
    return () => {
      active = false;
    };
  }, [user, setCart]);

  const getCartItemKey = useCallback((item) => `${item.productId}_${item.variantId || 'def'}`, []);

  const toggleSelectCartItem = useCallback(
    (key) => {
      setSelectedCartItemKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    },
    [setSelectedCartItemKeys]
  );

  const selectAllCartItems = useCallback(() => {
    setSelectedCartItemKeys(cart.map(getCartItemKey));
  }, [cart, getCartItemKey, setSelectedCartItemKeys]);

  const deselectAllCartItems = useCallback(() => {
    setSelectedCartItemKeys([]);
  }, [setSelectedCartItemKeys]);

  const removeSelectedCartItems = useCallback(async () => {
    const toRemove = cart.filter((item) => selectedCartItemKeys.includes(getCartItemKey(item)));
    setCart((prev) => prev.filter((item) => !selectedCartItemKeys.includes(getCartItemKey(item))));
    setSelectedCartItemKeys([]);

    if (!USE_MOCK && user && toRemove.length > 0) {
      try {
        for (const item of toRemove) {
          if (item.variantId) {
            await cartService.removeItem(item.variantId);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [cart, getCartItemKey, selectedCartItemKeys, setCart, setSelectedCartItemKeys, user]);

  const resetTestCart = useCallback(async () => {
    setCart([]);
    setSelectedCartItemKeys([]);
    if (!USE_MOCK && user) {
      try {
        await cartService.clearCart();
      } catch {
        // ignore
      }
    }
    showToast('Đã làm trống giỏ hàng');
  }, [setCart, setSelectedCartItemKeys, showToast, user]);

  const addToCart = useCallback(
    async (product, quantity = 1, customVariant = null) => {
      const selectedVariant = customVariant || product.selectedVariant || product.variants?.[0] || {};
      const variantId = selectedVariant.id || product.variantId || 1;
      const stock = selectedVariant.stock ?? product.stock ?? 20;

      const existing = cart.find((item) => item.productId === product.id && item.variantId === variantId);
      const currentQty = existing ? existing.quantity : 0;
      if (stock <= 0 || currentQty + quantity > stock) {
        showToast(`Số lượng yêu cầu vượt quá tồn kho (tối đa: ${stock})`, 'error');
        return;
      }

      if (!USE_MOCK && user && variantId) {
        try {
          const res = await cartService.addToCart({
            variantId,
            productId: product.id,
            quantity,
          });
          if (res && Array.isArray(res.items)) {
            setCart(mapServerCartItems(res.items));
          }
          setSelectedCartItemKeys((prev) => {
            const itemKey = `${product.id}_${variantId}`;
            return prev.includes(itemKey) ? prev : [...prev, itemKey];
          });
          showToast(`Đã thêm "${product.name}" vào giỏ hàng`);
          return;
        } catch (err) {
          showToast(err.message || 'Không thể thêm vào giỏ hàng', 'error');
          return;
        }
      }

      const price = selectedVariant.salePrice || selectedVariant.price || product.salePrice || product.basePrice;
      const originalPrice = selectedVariant.price || product.basePrice;
      const variantLabel = selectedVariant.size
        ? `${selectedVariant.size}${selectedVariant.color ? ` • ${selectedVariant.color}` : ''}`
        : 'Tiêu chuẩn';

      setCart((prev) => {
        const found = prev.find((item) => item.productId === product.id && item.variantId === variantId);
        if (found) {
          return prev.map((item) =>
            item.productId === product.id && item.variantId === variantId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            variantId,
            name: product.name,
            variant: variantLabel,
            price,
            originalPrice,
            quantity,
            imageUrl: selectedVariant.imageUrl || product.images?.[0]?.imageUrl,
            stock,
          },
        ];
      });

      setSelectedCartItemKeys((prev) => {
        const itemKey = `${product.id}_${variantId}`;
        return prev.includes(itemKey) ? prev : [...prev, itemKey];
      });
      showToast(`Đã thêm "${product.name}" vào giỏ hàng`);
    },
    [cart, setCart, setSelectedCartItemKeys, showToast, user]
  );

  const updateCartQuantity = useCallback(
    async (productId, delta, variantId = null) => {
      const target = cart.find((item) =>
        variantId !== null && variantId !== undefined
          ? item.productId === productId && item.variantId === variantId
          : item.productId === productId
      );
      if (!target) return;

      const stock = target.stock ?? 20;
      const newQty = Math.max(1, target.quantity + delta);
      if (delta > 0 && newQty > stock) {
        showToast(`Số lượng yêu cầu vượt quá tồn kho (tối đa: ${stock})`, 'error');
        return;
      }

      if (!USE_MOCK && user && target.variantId) {
        try {
          const res = await cartService.updateQuantity(target.variantId, newQty);
          if (res && Array.isArray(res.items)) {
            setCart(mapServerCartItems(res.items));
          }
          return;
        } catch (err) {
          showToast(err.message || 'Không thể cập nhật số lượng', 'error');
          return;
        }
      }

      setCart((prev) =>
        prev.map((item) => {
          const isMatch =
            variantId !== null && variantId !== undefined
              ? item.productId === productId && item.variantId === variantId
              : item.productId === productId;
          if (!isMatch) return item;
          return { ...item, quantity: newQty };
        })
      );
    },
    [cart, setCart, showToast, user]
  );

  const removeFromCart = useCallback(
    async (productId, variantId = null) => {
      if (!USE_MOCK && user && variantId) {
        try {
          const res = await cartService.removeItem(variantId);
          if (res && Array.isArray(res.items)) {
            setCart(mapServerCartItems(res.items));
            return;
          }
        } catch (err) {
          showToast(err.message || 'Không thể xóa sản phẩm', 'error');
          return;
        }
      }

      setCart((prev) =>
        prev.filter((item) => {
          if (variantId) return !(item.productId === productId && item.variantId === variantId);
          return item.productId !== productId;
        })
      );
    },
    [setCart, showToast, user]
  );

  const clearCart = useCallback(async () => {
    setCart([]);
    if (!USE_MOCK && user) {
      try {
        await cartService.clearCart();
      } catch {
        // ignore
      }
    }
  }, [setCart, user]);

  const cartItemCount = cart.length;
  const cartTotalUnits = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const selectedCartItems = useMemo(
    () => cart.filter((item) => selectedCartItemKeys.includes(getCartItemKey(item))),
    [cart, selectedCartItemKeys, getCartItemKey]
  );
  const selectedCartSubtotal = useMemo(
    () => selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [selectedCartItems]
  );
  const selectedCartTotalUnits = useMemo(
    () => selectedCartItems.reduce((sum, item) => sum + item.quantity, 0),
    [selectedCartItems]
  );

  const value = useMemo(
    () => ({
      cart,
      setCart,
      cartItemCount,
      cartTotalUnits,
      cartSubtotal,
      selectedCartItemKeys,
      setSelectedCartItemKeys,
      selectedCartItems,
      selectedCartSubtotal,
      selectedCartTotalUnits,
      getCartItemKey,
      toggleSelectCartItem,
      selectAllCartItems,
      deselectAllCartItems,
      removeSelectedCartItems,
      resetTestCart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      appliedCoupon,
      setAppliedCoupon,
    }),
    [
      cart,
      setCart,
      cartItemCount,
      cartTotalUnits,
      cartSubtotal,
      selectedCartItemKeys,
      setSelectedCartItemKeys,
      selectedCartItems,
      selectedCartSubtotal,
      selectedCartTotalUnits,
      getCartItemKey,
      toggleSelectCartItem,
      selectAllCartItems,
      deselectAllCartItems,
      removeSelectedCartItems,
      resetTestCart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      appliedCoupon,
      setAppliedCoupon,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart phải được sử dụng bên trong CartProvider');
  }
  return ctx;
}
