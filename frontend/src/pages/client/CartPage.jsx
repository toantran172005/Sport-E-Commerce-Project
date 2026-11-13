import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { ProductCard } from '../../components/product';
import { EmptyState } from '../../components/common';
import { CartItemRow, CartSummary } from '../../components/cart';
import { useStore } from '../../context/StoreContext.jsx';
import { calculateDiscount } from '../../utils/pricing.js';
import { useRequireLogin } from '../../hooks/useRequireLogin.js';

export default function CartPage() {
  const {
    cart,
    products,
    updateCartQuantity,
    removeFromCart,
    selectedCartItemKeys,
    selectedCartItems,
    selectedCartSubtotal,
    selectedCartTotalUnits,
    getCartItemKey,
    toggleSelectCartItem,
    selectAllCartItems,
    deselectAllCartItems,
    removeSelectedCartItems,
    appliedCoupon,
    showToast,
  } = useStore();

  const navigate = useNavigate();
  const requireLogin = useRequireLogin();

  const isAllSelected =
    cart.length > 0 && cart.every((item) => selectedCartItemKeys.includes(getCartItemKey(item)));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      deselectAllCartItems();
    } else {
      selectAllCartItems();
    }
  };

  const groupedCart = useMemo(() => {
    const groups = {};
    cart.forEach((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      const brandName = p?.brand?.name || p?.brand || 'Delta Sport';
      if (!groups[brandName]) {
        groups[brandName] = [];
      }
      groups[brandName].push(item);
    });
    return groups;
  }, [cart, products]);

  const voucherDiscount = calculateDiscount(appliedCoupon, selectedCartSubtotal, 0);
  const finalTotal = Math.max(0, selectedCartSubtotal - voucherDiscount);

  const handleProceedToCheckout = () => {
    if (selectedCartItems.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!', 'error');
      return;
    }
    if (!requireLogin('Vui lòng đăng nhập để tiến hành đặt hàng', { redirect: '/checkout' })) return;
    navigate('/checkout');
  };

  const recommendedProducts = useMemo(() => {
    return products.slice(0, 4);
  }, [products]);

  if (cart.length === 0) {
    return (
      <div className="max-w-[1360px] w-full mx-auto px-4 md:px-6 py-10 space-y-12">
        <div className="bg-surface rounded-lg border border-line p-10 shadow-2xs">
          <EmptyState
            title="Giỏ hàng của bạn còn trống"
            description="Hãy khám phá hàng trăm trang thiết bị thể thao chính hãng và lấp đầy giỏ hàng ngay hôm nay!"
            actionText="Mua sắm ngay"
            actionLink="/products"
          />
        </div>

        {recommendedProducts.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-[17px] font-extrabold text-ink flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-accent" />
              <span>Gợi ý cho bạn</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recommendedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] w-full mx-auto px-4 md:px-6 py-8 pb-32 space-y-6">
      {/* Page Title & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] md:text-[22px] font-black text-ink flex items-center gap-2">
            <span>Giỏ Hàng Của Bạn</span>
            <span className="text-[14px] font-bold text-accent px-2 py-0.5 rounded-full bg-accent-soft">
              {cart.length} sản phẩm
            </span>
          </h1>
          <p className="text-[12.5px] text-ink-muted mt-0.5">
            Chọn các sản phẩm bạn muốn đặt hàng và tiến hành thanh toán
          </p>
        </div>
      </div>

      {/* Shopee-style Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-3.5 px-5 py-3 bg-surface rounded-lg border border-line text-[12px] font-extrabold text-ink-muted uppercase tracking-wider shadow-2xs">
        <div className="col-span-5 flex items-center gap-3">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={handleToggleSelectAll}
            className="w-4 h-4 rounded text-accent accent-accent cursor-pointer"
          />
          <span>Sản phẩm</span>
        </div>
        <div className="col-span-2 text-center">Đơn giá</div>
        <div className="col-span-2 text-center">Số lượng</div>
        <div className="col-span-2 text-right">Số tiền</div>
        <div className="col-span-1 text-center">Thao tác</div>
      </div>

      {/* Cart Groups by Brand */}
      <div className="space-y-4">
        {Object.entries(groupedCart).map(([brandName, items]) => {
          const isBrandAllSelected = items.every((it) =>
            selectedCartItemKeys.includes(getCartItemKey(it))
          );

          const toggleBrandSelect = () => {
            if (isBrandAllSelected) {
              items.forEach((it) => {
                const k = getCartItemKey(it);
                if (selectedCartItemKeys.includes(k)) toggleSelectCartItem(k);
              });
            } else {
              items.forEach((it) => {
                const k = getCartItemKey(it);
                if (!selectedCartItemKeys.includes(k)) toggleSelectCartItem(k);
              });
            }
          };

          return (
            <div
              key={brandName}
              className="bg-surface rounded-lg border border-line overflow-hidden shadow-2xs"
            >
              <div className="px-5 py-3 border-b border-line bg-surface-muted/30 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isBrandAllSelected}
                  onChange={toggleBrandSelect}
                  className="w-4 h-4 rounded text-accent accent-accent cursor-pointer"
                />
                <span className="text-[13.5px] font-black text-ink">{brandName}</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-accent-soft text-accent uppercase tracking-wider">
                  Chính hãng
                </span>
              </div>

              <div className="divide-y divide-line">
                {items.map((item) => {
                  const itemKey = getCartItemKey(item);
                  const isChecked = selectedCartItemKeys.includes(itemKey);

                  return (
                    <CartItemRow
                      key={itemKey}
                      item={item}
                      isChecked={isChecked}
                      onToggleSelect={() => toggleSelectCartItem(itemKey)}
                      onUpdateQuantity={(delta) =>
                        updateCartQuantity(item.productId, delta, item.variantId)
                      }
                      onRemove={() => removeFromCart(item.productId, item.variantId)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
        <section className="space-y-4 pt-6">
          <h2 className="text-[17px] font-extrabold text-ink flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-accent" />
            <span>Có thể bạn cũng thích</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recommendedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Bottom Summary Bar */}
      <CartSummary
        cartLength={cart.length}
        totalItemsCount={cart.length}
        isAllSelected={isAllSelected}
        onToggleSelectAll={handleToggleSelectAll}
        selectedCount={selectedCartItems.length}
        selectedItemsCount={selectedCartItems.length}
        selectedSubtotal={selectedCartSubtotal}
        selectedTotalUnits={selectedCartTotalUnits}
        selectedUnitsCount={selectedCartTotalUnits}
        finalTotal={finalTotal}
        voucherDiscount={voucherDiscount}
        onRemoveSelected={removeSelectedCartItems}
        onProceedToCheckout={handleProceedToCheckout}
      />
    </div>
  );
}
