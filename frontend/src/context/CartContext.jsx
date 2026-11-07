/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { products as mockProducts } from '../mocks/products.js';
import { useUI } from './UIContext.jsx';

const CartContext = createContext(null);

const DEFAULT_CART_ITEMS = () => {
  const p1 = mockProducts[0];
  const p2 = mockProducts[1];
  return [
    {
      productId: p1.id,
      variantId: p1.variants[0]?.id || 1,
      name: p1.name,
      variant: `${p1.variants[0]?.size} • ${p1.variants[0]?.color}`,
      price: p1.variants[0]?.salePrice || p1.variants[0]?.price || p1.basePrice,
      originalPrice: p1.variants[0]?.price || p1.basePrice,
      quantity: 1,
      imageUrl: p1.images[0]?.imageUrl,
      stock: p1.variants[0]?.stock || 20,
    },
    {
      productId: p2.id,
      variantId: p2.variants[0]?.id || 2,
      name: p2.name,
      variant: `${p2.variants[0]?.size} • ${p2.variants[0]?.color}`,
      price: p2.variants[0]?.salePrice || p2.variants[0]?.price || p2.basePrice,
      originalPrice: p2.variants[0]?.price || p2.basePrice,
      quantity: 1,
      imageUrl: p2.images[0]?.imageUrl,
      stock: p2.variants[0]?.stock || 15,
    },
  ];
};

export function CartProvider({ children }) {
  const { showToast } = useUI();

  const [cart, setCart] = usePersistentState('sport_cart', DEFAULT_CART_ITEMS);
  const [selectedCartItemKeys, setSelectedCartItemKeys] = usePersistentState('sport_selected_cart', [
    '1_11',
    '2_21',
  ]);
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
    setCart((prev) => prev.filter((item) => !selectedCartItemKeys.includes(getCartItemKey(item))));
    setSelectedCartItemKeys([]);
    showToast('Đã xóa các sản phẩm đã chọn khỏi giỏ hàng');
  }, [getCartItemKey, selectedCartItemKeys, setCart, setSelectedCartItemKeys, showToast]);

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
          const maxStock = item.stock ?? 99;
          return { ...item, quantity: Math.max(1, Math.min(newQty, maxStock)) };
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
      showToast('Đã xóa sản phẩm khỏi giỏ hàng');
    },
    [setCart, showToast]
  );

  const clearCart = useCallback(() => setCart([]), [setCart]);

  // Derived Calculations
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
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
