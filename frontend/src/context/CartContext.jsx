/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { useScopedKey } from '../hooks/useScopedKey.js';
import { useUI } from './UIContext.jsx';

const CartContext = createContext(null);

export const DEFAULT_CART_ITEMS = () => [];

export function CartProvider({ children }) {
  const { showToast } = useUI();

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

  const removeSelectedCartItems = useCallback(() => {
    setCart((prev) => prev.filter((item) => !selectedCartItemKeys.includes(getCartItemKey(item))));
    setSelectedCartItemKeys([]);
  }, [getCartItemKey, selectedCartItemKeys, setCart, setSelectedCartItemKeys]);

  const resetTestCart = useCallback(() => {
    setCart([]);
    setSelectedCartItemKeys([]);
    showToast('Đã làm trống giỏ hàng');
  }, [setCart, setSelectedCartItemKeys, showToast]);

  const addToCart = useCallback(
    (product, quantity = 1, customVariant = null) => {
      const selectedVariant = customVariant || product.variants?.[0] || {};
      const variantId = selectedVariant.id || 1;
      const price = selectedVariant.salePrice || selectedVariant.price || product.salePrice || product.basePrice;
      const originalPrice = selectedVariant.price || product.basePrice;
      const variantLabel = selectedVariant.size
        ? `${selectedVariant.size}${selectedVariant.color ? ` • ${selectedVariant.color}` : ''}`
        : 'Tiêu chuẩn';

      setCart((prev) => {
        const existing = prev.find((item) => item.productId === product.id && item.variantId === variantId);
        if (existing) {
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
            stock: selectedVariant.stock ?? 20,
          },
        ];
      });

      setSelectedCartItemKeys((prev) => {
        const itemKey = `${product.id}_${variantId}`;
        return prev.includes(itemKey) ? prev : [...prev, itemKey];
      });
      showToast(`Đã thêm "${product.name}" vào giỏ hàng`);
    },
    [setCart, setSelectedCartItemKeys, showToast]
  );

  const updateCartQuantity = useCallback(
    (productId, delta, variantId = null) => {
      setCart((prev) =>
        prev.map((item) => {
          const isMatch =
            variantId !== null && variantId !== undefined
              ? item.productId === productId && item.variantId === variantId
              : item.productId === productId;
          if (!isMatch) return item;
          const newQty = item.quantity + delta;
          return { ...item, quantity: Math.max(1, newQty) };
        })
      );
    },
    [setCart]
  );

  const removeFromCart = useCallback(
    (productId, variantId = null) => {
      setCart((prev) =>
        prev.filter((item) => {
          if (variantId) return !(item.productId === productId && item.variantId === variantId);
          return item.productId !== productId;
        })
      );
    },
    [setCart]
  );

  const clearCart = useCallback(() => setCart([]), [setCart]);

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
