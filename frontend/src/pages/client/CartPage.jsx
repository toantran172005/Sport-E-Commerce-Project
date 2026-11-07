import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Package,
} from 'lucide-react';
import ProductCard from '../../components/common/ProductCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import VoucherDropdown from '../../components/common/VoucherDropdown.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { calculateDiscount } from '../../utils/pricing.js';

export default function CartPage() {
  const {
    user,
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

  // Kiểm tra trạng thái đã chọn tất cả chưa
  const isAllSelected =
    cart.length > 0 && cart.every((item) => selectedCartItemKeys.includes(getCartItemKey(item)));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      deselectAllCartItems();
    } else {
      selectAllCartItems();
    }
  };

  // Nhóm sản phẩm theo thương hiệu
  const groupedCart = useMemo(() => {
    const groups = {};
    cart.forEach((item) => {
      // Tìm brand name từ products
      const p = products.find((prod) => prod.id === item.productId);
      const brandName = p?.brand?.name || p?.brand || 'Sân Nhà Sport';
      if (!groups[brandName]) {
        groups[brandName] = [];
      }
      groups[brandName].push(item);
    });
    return groups;
  }, [cart, products]);

  // Tính số tiền giảm giá từ voucher sử dụng helper dùng chung an toàn
  const voucherDiscount = calculateDiscount(appliedCoupon, selectedCartSubtotal, 0);
  const finalTotal = Math.max(0, selectedCartSubtotal - voucherDiscount);

  const handleProceedToCheckout = () => {
    if (selectedCartItems.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!');
      return;
    }
    if (!user) {
      showToast('Vui lòng đăng nhập để tiến hành đặt hàng');
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  // Khối "Có thể bạn cũng thích" (4 sản phẩm)
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

        {/* Khối gợi ý */}
        <section className="space-y-4">
          <h2 className="text-[17px] font-bold text-ink flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-accent" />
            <span>Có Thể Bạn Cũng Thích</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recommendedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] w-full mx-auto px-4 md:px-6 py-6 space-y-6 pb-28 md:pb-24">
      {/* Breadcrumb */}
      <div className="text-[12.5px] text-ink-muted flex items-center gap-1.5">
        <Link to="/" className="hover:text-accent">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="font-bold text-accent">Giỏ hàng của bạn</span>
      </div>

      {/* Page Title */}
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-[20px] font-extrabold text-ink flex items-center gap-2">
          <span>Giỏ Hàng</span>
          <span className="text-[13px] font-medium text-ink-muted">
            ({cart.length} mặt hàng)
          </span>
        </h1>
      </div>

      {/* Desktop Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 rounded-lg bg-surface border border-line text-[13px] font-bold text-ink-muted items-center shadow-2xs">
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
          // Check nếu tất cả sản phẩm của brand này đều được tick
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
              {/* Brand Header */}
              <div className="px-5 py-2.5 bg-page/60 border-b border-line flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isBrandAllSelected}
                  onChange={toggleBrandSelect}
                  className="w-4 h-4 rounded text-accent accent-accent cursor-pointer"
                />
                <span className="text-[13px] font-extrabold text-ink flex items-center gap-2">
                  <span>{brandName}</span>
                  <span className="px-2 py-0.2 rounded text-[10.5px] font-bold bg-accent-soft text-accent">
                    Chính hãng
                  </span>
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-line">
                {items.map((item) => {
                  const itemKey = getCartItemKey(item);
                  const isChecked = selectedCartItemKeys.includes(itemKey);
                  const effectiveStock = item.stock ?? 20;
                  const isOutOfStock = effectiveStock <= 0;
                  const isLowStock = effectiveStock > 0 && effectiveStock <= 5;

                  return (
                    <div
                      key={itemKey}
                      className="p-4 md:px-5 md:py-4 flex flex-col md:grid md:grid-cols-12 gap-3.5 md:items-center hover:bg-page/40 transition"
                    >
                      {/* Product Info & Checkbox */}
                      <div className="col-span-5 flex items-start gap-3">
                        <input
                          type="checkbox"
                          disabled={isOutOfStock}
                          checked={isChecked && !isOutOfStock}
                          onChange={() => toggleSelectCartItem(itemKey)}
                          className="w-4 h-4 rounded text-accent accent-accent mt-1 cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                        <Link
                          to={`/products/${item.productId}`}
                          className="w-16 h-16 rounded-md bg-surface-2 border border-line overflow-hidden shrink-0 flex items-center justify-center"
                        >
                          {item.imageUrl || item.image ? (
                            <img
                              src={item.imageUrl || item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-ink-subtle" />
                          )}
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/products/${item.productId}`}
                            className="text-[13.5px] font-bold text-ink hover:text-accent line-clamp-2 leading-snug"
                          >
                            {item.name}
                          </Link>
                          <p className="text-[11.5px] text-ink-muted mt-0.5">
                            Phân loại: <strong className="text-ink">{item.variant || 'Tiêu chuẩn'}</strong>
                          </p>
                          {isOutOfStock ? (
                            <span className="inline-block mt-0.5 text-[10.5px] font-bold text-danger bg-danger-soft px-1.5 py-0.5 rounded">
                              Hết hàng
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-block mt-0.5 text-[10.5px] font-bold text-warning bg-warning-soft px-1.5 py-0.5 rounded">
                              Chỉ còn {effectiveStock} sản phẩm
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Unit Price */}
                      <div className="col-span-2 md:text-center flex md:block items-center justify-between">
                        <span className="text-[12px] text-ink-muted md:hidden">Đơn giá:</span>
                        <div>
                          <p className="text-[13.5px] font-bold text-ink">
                            {formatCurrency(item.price)}
                          </p>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <p className="text-[11px] text-ink-subtle line-through">
                              {formatCurrency(item.originalPrice)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="col-span-2 flex md:justify-center items-center justify-between">
                        <span className="text-[12px] text-ink-muted md:hidden">Số lượng:</span>
                        <div className="flex items-center border border-line rounded-md bg-surface overflow-hidden">
                          <button
                            type="button"
                            disabled={item.quantity <= 1 || isOutOfStock}
                            onClick={() => updateCartQuantity(item.productId, -1, item.variantId)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-surface-2 text-ink disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-9 text-center text-[13px] font-bold text-ink">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={isOutOfStock || item.quantity >= effectiveStock}
                            onClick={() => updateCartQuantity(item.productId, 1, item.variantId)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-surface-2 text-ink disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="col-span-2 md:text-right flex md:block items-center justify-between">
                        <span className="text-[12px] text-ink-muted md:hidden">Thành tiền:</span>
                        <span className="text-[14.5px] font-extrabold text-accent">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>

                      {/* Action */}
                      <div className="col-span-1 md:text-center text-right">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          className="p-1.5 text-ink-subtle hover:text-danger rounded transition"
                          title="Xóa khỏi giỏ hàng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommended Products Carousel / Grid */}
      <section className="space-y-4 pt-4">
        <h2 className="text-[17px] font-bold text-ink flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-accent" />
          <span>Có Thể Bạn Cũng Thích</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {recommendedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Sticky Bottom Summary Bar (Shopee pattern) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-line shadow-2xl py-3 px-4 md:px-6">
        <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Select all & Delete */}
          <div className="flex items-center justify-between md:justify-start gap-4">
            <label className="flex items-center gap-2.5 cursor-pointer text-[13px] font-bold text-ink">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleToggleSelectAll}
                className="w-4 h-4 rounded text-accent accent-accent cursor-pointer"
              />
              <span>Chọn tất cả ({cart.length})</span>
            </label>

            <button
              type="button"
              disabled={selectedCartItems.length === 0}
              onClick={removeSelectedCartItems}
              className="text-[12.5px] text-ink-muted hover:text-danger font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Xóa ({selectedCartItems.length})
            </button>
          </div>

          {/* Right: Voucher & Total Payment CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-6">
            {/* Voucher Trigger */}
            <div className="w-full sm:w-[280px]">
              <VoucherDropdown orderSubtotal={selectedCartSubtotal} direction="up" />
            </div>

            {/* Total Display & CTA Button */}
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="text-right">
                <div className="flex items-baseline gap-1.5 justify-end">
                  <span className="text-[12px] text-ink-muted">Tổng thanh toán:</span>
                  <span className="text-[18px] md:text-[20px] font-black text-accent">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
                {voucherDiscount > 0 && (
                  <p className="text-[11px] text-success font-bold">
                    Tiết kiệm {formatCurrency(voucherDiscount)}
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={selectedCartItems.length === 0}
                onClick={handleProceedToCheckout}
                className="px-6 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-white text-[13.5px] font-bold shadow-xs flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <span>Mua Hàng</span>
                <span>({selectedCartTotalUnits})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
