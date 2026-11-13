/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { useScopedKey } from '../hooks/useScopedKey.js';
import { useRequireLogin } from '../hooks/useRequireLogin.js';
import { useUI } from './UIContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { showToast } = useUI();
  const requireLogin = useRequireLogin();

  // Giỏ hàng lưu theo từng tài khoản (khóa gắn user id); khách vãng lai không có giỏ.
  const [cart, setCart] = usePersistentState(useScopedKey('sport_cart'), []);
  const [selectedCartItemKeys, setSelectedCartItemKeys] = usePersistentState(
    useScopedKey('sport_selected_cart'),
    []
  );
  const [appliedCoupon, setAppliedCoupon] = useState(null);

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
    if (!selectedCartItemKeys || selectedCartItemKeys.length === 0) return;
    setCart((prev) => prev.filter((item) => !selectedCartItemKeys.includes(getCartItemKey(item))));
    setSelectedCartItemKeys([]);
    showToast('Đã xóa các sản phẩm đã chọn khỏi giỏ hàng', 'success');
  }, [getCartItemKey, selectedCartItemKeys, setCart, setSelectedCartItemKeys, showToast]);

  const addToCart = useCallback(
    (product, quantity = 1, customVariant = null) => {
      // Khách vãng lai không có giỏ hàng: hỏi có muốn đăng nhập không (không đồng ý thì ở nguyên trang)
      if (!requireLogin('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng')) return false;
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
      showToast(`Đã thêm "${product.name}" vào giỏ hàng`, 'success');
      return true;
    },
    [requireLogin, setCart, setSelectedCartItemKeys, showToast]
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
          const maxStock = item.stock ?? 99;
          return { ...item, quantity: Math.min(maxStock, Math.max(1, newQty)) };
        })
      );
    },
    [setCart]
  );

  const removeFromCart = useCallback(
    (productId, variantId = null) => {
      setCart((prev) =>
        prev.filter((item) => {
          if (variantId !== null && variantId !== undefined) {
            return !(item.productId === productId && item.variantId === variantId);
          }
          return item.productId !== productId;
        })
      );
      setSelectedCartItemKeys((prev) =>
        prev.filter((key) => {
          if (variantId !== null && variantId !== undefined) {
            return key !== `${productId}_${variantId}`;
          }
          return !key.startsWith(`${productId}_`);
        })
      );
    },
    [setCart, setSelectedCartItemKeys]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCartItemKeys([]);
  }, [setCart, setSelectedCartItemKeys]);

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
