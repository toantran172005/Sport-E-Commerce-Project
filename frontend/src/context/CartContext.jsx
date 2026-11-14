/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { products as mockProducts } from '../mocks/products.js';
import { useUI } from './UIContext.jsx';

const CartContext = createContext(null);

export const DEFAULT_CART_ITEMS = () => {
  const p1 = mockProducts[0] || {};
  const v1 = p1.variants?.find((v) => v.id === 11) || p1.variants?.[0];
  const v2 = p1.variants?.find((v) => v.id === 10) || p1.variants?.[1] || p1.variants?.[0];

  return [
    {
      productId: p1.id || 1,
      variantId: 11,
      name: "Giày Chạy Bộ Nike Air Zoom Pegasus 40",
      variant: `${v1?.size || 'Size 42'} • ${v1?.color || 'Xanh Dương'}`,
      price: 890000,
      originalPrice: 890000,
      quantity: 1,
      imageUrl: v1?.imageUrl || p1.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
      stock: 50,
    },
    {
      productId: p1.id || 1,
      variantId: 10,
      name: "Vợt Cầu Lông Yonex Astrox (DB chỉ còn 3 cái - Tăng lên để test lỗi)",
      variant: `${v2?.size || 'Size Chuẩn'} • ${v2?.color || 'Vàng Chanh'}`,
      price: 3890000,
      originalPrice: 3890000,
      quantity: 1,
      imageUrl: v2?.imageUrl || p1.images?.[1]?.imageUrl || p1.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      stock: 20,
    },
  ];
};

export function CartProvider({ children }) {
  const { showToast } = useUI();

  const [cart, setCart] = usePersistentState('sport_cart', DEFAULT_CART_ITEMS);
  const [selectedCartItemKeys, setSelectedCartItemKeys] = usePersistentState('sport_selected_cart', [
    '1_11',
    '1_10',
  ]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Tự động đồng bộ giỏ hàng sang 2 sản phẩm test DB nếu giỏ hàng hiện tại chứa dữ liệu mock cũ
  useEffect(() => {
    const hasTestItems = cart && cart.some((item) => item.variantId === 11 || item.variantId === 10);
    if (!hasTestItems || !cart || cart.length === 0) {
      const defaultItems = DEFAULT_CART_ITEMS();
      setCart(defaultItems);
      setSelectedCartItemKeys(['1_11', '1_10']);
    } else if (cart.some((it) => it.variantId === 10 && it.stock < 20)) {
      setCart((prev) =>
        prev.map((it) => (it.variantId === 10 ? { ...it, stock: 20 } : it))
      );
    }
  }, [cart, setCart, setSelectedCartItemKeys]);

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
  }, [getCartItemKey, selectedCartItemKeys, setCart, setSelectedCartItemKeys, showToast]);

  const resetTestCart = useCallback(() => {
    const defaultItems = DEFAULT_CART_ITEMS();
    setCart(defaultItems);
    setSelectedCartItemKeys(['1_11', '1_10']);
    showToast('Đã khôi phục giỏ hàng về 2 sản phẩm Test DB');
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
          const maxStock = item.stock ?? 99;
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
    [setCart, showToast]
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
