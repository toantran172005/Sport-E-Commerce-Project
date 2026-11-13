import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { ProductCard } from '../../components/product';
import { EmptyState } from '../../components/common';
import { CartItemRow, CartSummary } from '../../components/cart';
import { useStore } from '../../context/StoreContext.jsx';
import { buildLineNumberMap, getItemKey } from '../../utils/cartNumbering.js';
import { getShippingQuotes } from '../../services/shippingService.js';
import { useRequireLogin } from '../../hooks/useRequireLogin.js';

export default function CartPage() {
  const {
    cart,
    user,
    products,
    addresses = [],
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

  // Compute continuous line numbers across all brand groups
  const lineNumberMap = useMemo(() => {
    return buildLineNumberMap(Object.entries(groupedCart));
  }, [groupedCart]);

  // Mới vào trang giỏ hàng: mặc định không chọn bất kỳ sản phẩm nào
  useEffect(() => {
    deselectAllCartItems();
  }, [deselectAllCartItems]);

  // Pre-warm shipping quotes cache for default address when cart has items
  useEffect(() => {
    if (user && selectedCartSubtotal > 0 && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      if (defaultAddr?.city) {
        getShippingQuotes({
          addressId: defaultAddr.id,
          city: defaultAddr.city,
          subTotal: selectedCartSubtotal,
        }).catch(() => {
          // Non-blocking pre-warm error
        });
      }
    }
  }, [user, selectedCartSubtotal, addresses]);

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

      {/* Unified Cart Card: Header and Items merged together */}
      <div className="bg-surface rounded-xl border border-line overflow-hidden shadow-2xs">
        {/* Table Header with the SINGLE Select-All Checkbox */}
        <div className="hidden md:grid grid-cols-12 gap-3.5 px-5 py-3.5 bg-surface-2/60 border-b border-line text-[12px] font-extrabold text-ink-muted uppercase tracking-wider">
          <div className="col-span-5 flex items-center gap-3">
            <input
              type="checkbox"
              id="select-all-cart-header"
              checked={isAllSelected}
              onChange={handleToggleSelectAll}
              className="w-4 h-4 rounded text-accent accent-accent cursor-pointer"
              title="Chọn tất cả sản phẩm"
            />
            <label htmlFor="select-all-cart-header" className="cursor-pointer select-none">
              Sản phẩm
            </label>
          </div>
          <div className="col-span-2 text-center">Đơn giá</div>
          <div className="col-span-2 text-center">Số lượng</div>
          <div className="col-span-2 text-right">Số tiền</div>
          <div className="col-span-1 text-center">Thao tác</div>
        </div>

        {/* Cart Groups & Items */}
        <div className="divide-y divide-line">
          {Object.entries(groupedCart).map(([brandName, items]) => (
            <div key={brandName}>
              {/* Brand Header Banner (No Checkbox) */}
              <div className="px-5 py-2.5 bg-surface-muted/30 border-b border-line/60 flex items-center gap-2">
                <span className="text-[13px] font-black text-ink">{brandName}</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-accent-soft text-accent uppercase tracking-wider">
                  Chính hãng
                </span>
              </div>

              {/* Items List under this Brand */}
              <div className="divide-y divide-line">
                {items.map((item) => {
                  const itemKey = getCartItemKey(item);
                  const isChecked = selectedCartItemKeys.includes(itemKey);
                  const lineNumber = lineNumberMap.get(getItemKey(item));

                  return (
                    <CartItemRow
                      key={itemKey}
                      item={item}
                      itemKey={itemKey}
                      lineNumber={lineNumber}
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
          ))}
        </div>
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
        finalTotal={selectedCartSubtotal}
        onRemoveSelected={removeSelectedCartItems}
        onProceedToCheckout={handleProceedToCheckout}
      />
    </div>
  );
}
