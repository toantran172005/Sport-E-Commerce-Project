import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Truck,
  CreditCard,
  ShieldCheck,
  QrCode,
  Banknote,
  ArrowRight,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { calculateDiscount } from '../../utils/pricing.js';
import { shippingService } from '../../services/shippingService.js';
import { orderService } from '../../services/orderService.js';
import { paymentService } from '../../services/paymentService.js';
import VoucherDropdown from '../../components/common/VoucherDropdown.jsx';

export default function CheckoutPage() {
  const {
    user,
    cart,
    cartSubtotal,
    selectedCartItems,
    selectedCartSubtotal,
    removeFromCart,
    selectedAddress,
    appliedCoupon,
    openModal,
    showToast,
  } = useStore();
  const navigate = useNavigate();

  // Guard: Guest không được phép truy cập Checkout
  useEffect(() => {
    if (!user) {
      showToast('Vui lòng đăng nhập để tiến hành đặt hàng');
      navigate('/login?redirect=/checkout', { replace: true });
    }
  }, [user, navigate, showToast]);

  // Xác định danh sách mặt hàng được mua: ưu tiên các mặt hàng được tick chọn từ trang Cart
  const checkoutItems =
    selectedCartItems && selectedCartItems.length > 0 ? selectedCartItems : cart;
  const checkoutSubtotal =
    selectedCartItems && selectedCartItems.length > 0
      ? selectedCartSubtotal
      : cartSubtotal;

  // Shipping Providers from service
  const [shippingProviders, setShippingProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState(1);

  // Payment method: 'COD' | 'BANK_TRANSFER' (VNPay)
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');

  // Note
  const [shippingNote, setShippingNote] = useState('Giao giờ hành chính');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    shippingService.getShippingProviders().then((res) => {
      setShippingProviders(res);
      if (res && res.length > 0) setSelectedProviderId(res[0].id);
    });
  }, []);

  // Điều hướng về cart nếu không có sản phẩm nào
  useEffect(() => {
    if (checkoutItems.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [checkoutItems.length, navigate]);

  // Shipping Fee calculation (Free if subtotal >= 500k, otherwise 30k)
  const isFreeShip = checkoutSubtotal >= 500000;
  const shippingFee = isFreeShip ? 0 : 30000;

  // Discount from applied coupon using safe shared pricing helper
  const discountAmount = calculateDiscount(appliedCoupon, checkoutSubtotal, shippingFee);
  const totalAmount = Math.max(0, checkoutSubtotal + shippingFee - discountAmount);

  const handlePlaceOrder = async () => {
    if (checkoutItems.length === 0) {
      showToast('Không có sản phẩm nào để đặt hàng!');
      navigate('/cart');
      return;
    }

    if (!selectedAddress) {
      showToast('Vui lòng chọn hoặc thêm địa chỉ nhận hàng!');
      openModal('address_modal');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        subTotal: checkoutSubtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        shippingAddressSnapshot: `${selectedAddress.addressLine}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.city}`,
        note: shippingNote,
        paymentMethod,
        shippingProviderId: selectedProviderId,
        couponId: appliedCoupon?.id || null,
        orderItems: checkoutItems.map((item, idx) => ({
          id: Date.now() + idx,
          variantId: item.variantId,
          productNameSnapshot: item.name,
          skuSnapshot: item.sku || 'SKU-STANDARD',
          variantSnapshot: item.variant,
          unitPrice: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
          createdAt: new Date().toISOString(),
        })),
      };

      const newOrder = await orderService.createOrder(orderPayload);

      // Dọn dẹp chính xác các sản phẩm vừa đặt khỏi giỏ (không xóa nhầm sản phẩm khác)
      checkoutItems.forEach((item) => {
        removeFromCart(item.productId, item.variantId);
      });

      if (paymentMethod === 'BANK_TRANSFER') {
        const paymentRes = await paymentService.createPayment({
          orderId: newOrder.id,
          method: 'BANK_TRANSFER',
        });
        openModal('vnpay_qr_modal', {
          amount: totalAmount,
          orderCode: newOrder.orderCode,
          orderId: newOrder.id,
          paymentUrl: paymentRes?.paymentUrl,
        });
      } else {
        await paymentService.createPayment({
          orderId: newOrder.id,
          method: 'COD',
        });
        showToast('Đặt hàng thành công!');
        navigate(
          `/payment-result?orderId=${newOrder.id}&orderCode=${newOrder.orderCode}&method=COD`
        );
      }
    } catch (err) {
      showToast(err.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1360px] w-full mx-auto px-4 md:px-6 py-6 text-ink">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-[13px] text-ink-muted">
          <Link to="/cart" className="hover:text-accent flex items-center gap-1 transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại giỏ hàng</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-ink">Thanh toán</span>
        </div>

        <div className="flex items-center gap-2 text-[12px] font-semibold text-ink-muted bg-surface px-3 py-1 rounded-full border border-line">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Thanh toán an toàn &amp; Bảo mật SSL</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Address, Shipping, Payment */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Delivery Address */}
          <div className="bg-surface rounded-lg border border-line p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-line">
              <h2 className="text-[15px] font-bold text-accent flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Địa Chỉ Nhận Hàng</span>
              </h2>
              <button
                type="button"
                onClick={() => openModal('address_modal')}
                className="text-[12.5px] font-bold text-accent hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thay đổi / Thêm mới</span>
              </button>
            </div>

            {selectedAddress ? (
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[14px] font-bold text-ink">
                    {selectedAddress.recipientName || selectedAddress.name}
                  </span>
                  <span className="text-[13px] text-ink-muted">
                    ({selectedAddress.phoneNumber || selectedAddress.phone})
                  </span>
                  {selectedAddress.isDefault && (
                    <span className="px-2 py-0.5 rounded-md bg-accent-soft text-accent text-[10.5px] font-bold">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-[12.5px] text-ink-muted">
                  {selectedAddress.addressLine}, {selectedAddress.ward},{' '}
                  {selectedAddress.district}, {selectedAddress.city}
                </p>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-[13px] text-ink-muted mb-2">Chưa có địa chỉ nhận hàng</p>
                <button
                  type="button"
                  onClick={() => openModal('address_modal')}
                  className="px-3.5 py-1.5 rounded-md bg-accent hover:bg-accent/90 text-white text-[12px] font-bold transition"
                >
                  Thêm địa chỉ ngay
                </button>
              </div>
            )}
          </div>

          {/* 2. Shipping Provider */}
          <div className="bg-surface rounded-lg border border-line p-5 shadow-xs">
            <h2 className="text-[15px] font-bold text-ink flex items-center gap-2 mb-3">
              <Truck className="w-4 h-4 text-accent" />
              <span>Đơn Vị Vận Chuyển</span>
            </h2>

            <div className="space-y-2.5">
              {shippingProviders.map((provider) => {
                const isSelected = selectedProviderId === provider.id;
                return (
                  <div
                    key={provider.id}
                    onClick={() => setSelectedProviderId(provider.id)}
                    className={`p-3.5 rounded-md border flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? 'border-accent bg-accent-soft'
                        : 'border-line bg-surface hover:bg-surface-2'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                          isSelected ? 'border-accent bg-accent' : 'border-line bg-surface'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-surface" />}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-ink">
                          {provider.name} ({provider.code})
                        </p>
                        <p className="text-[11px] text-ink-muted">
                          Thời gian giao hàng dự kiến: 2-3 ngày làm việc
                        </p>
                      </div>
                    </div>

                    <span className="text-[13px] font-bold text-ink">
                      {isFreeShip ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Miễn phí
                        </span>
                      ) : (
                        formatCurrency(30000)
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Note input */}
            <div className="mt-4 pt-3 border-t border-line">
              <label className="block text-[12px] font-semibold text-ink-muted mb-1">
                Ghi chú cho shipper:
              </label>
              <input
                type="text"
                value={shippingNote}
                onChange={(e) => setShippingNote(e.target.value)}
                placeholder="Ví dụ: Gọi trước khi giao 15 phút, giao giờ hành chính..."
                className="w-full h-9 px-3 rounded-md bg-page border border-line text-[12.5px] text-ink focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-surface rounded-lg border border-line p-5 shadow-xs">
            <h2 className="text-[15px] font-bold text-ink flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-accent" />
              <span>Phương Thức Thanh Toán</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* VNPay QR */}
              <div
                onClick={() => setPaymentMethod('BANK_TRANSFER')}
                className={`p-3.5 rounded-md border flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'border-accent bg-accent-soft'
                    : 'border-line bg-surface hover:bg-surface-2'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'border-accent bg-accent'
                      : 'border-line bg-surface'
                  }`}
                >
                  {paymentMethod === 'BANK_TRANSFER' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-surface" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-accent" />
                    <p className="text-[13px] font-bold text-ink">Chuyển Khoản VNPay QR</p>
                  </div>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Quét mã QR qua ứng dụng ngân hàng
                  </p>
                </div>
              </div>

              {/* COD */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-3.5 rounded-md border flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === 'COD'
                    ? 'border-accent bg-accent-soft'
                    : 'border-line bg-surface hover:bg-surface-2'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                    paymentMethod === 'COD'
                      ? 'border-accent bg-accent'
                      : 'border-line bg-surface'
                  }`}
                >
                  {paymentMethod === 'COD' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-surface" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-[13px] font-bold text-ink">Thanh Toán Khi Nhận (COD)</p>
                  </div>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Kiểm tra hàng rồi thanh toán tiền mặt
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-[84px]">
          <div className="bg-surface rounded-lg border border-line p-5 space-y-4 shadow-xs">
            <h2 className="text-[15px] font-bold text-ink pb-2 border-b border-line flex items-center justify-between">
              <span>Đơn Hàng ({checkoutItems.length} sản phẩm)</span>
              <Link to="/cart" className="text-[12px] font-normal text-accent hover:underline">
                Sửa giỏ hàng
              </Link>
            </h2>

            {/* Items List */}
            <div className="space-y-3 max-h-64 overflow-y-auto divide-y divide-line pr-1">
              {checkoutItems.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-[12.5px]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={
                        item.imageUrl ||
                        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'
                      }
                      alt={item.name}
                      className="w-11 h-11 rounded-md object-cover bg-page shrink-0 border border-line"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-ink truncate">{item.name}</p>
                      <p className="text-[11px] text-ink-muted truncate">
                        {item.variant} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-ink shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Voucher Dropdown integration */}
            <div className="pt-3 border-t border-line">
              <label className="block text-[12px] font-semibold text-ink-muted mb-1.5">
                Mã giảm giá / Voucher:
              </label>
              <VoucherDropdown orderSubtotal={checkoutSubtotal} direction="down" />
            </div>

            {/* Price Calculation breakdown */}
            <div className="pt-3 border-t border-line space-y-2 text-[12.5px]">
              <div className="flex justify-between text-ink-muted">
                <span>Tạm tính hàng hóa:</span>
                <span className="font-bold text-ink">
                  {formatCurrency(checkoutSubtotal)}
                </span>
              </div>

              <div className="flex justify-between text-ink-muted">
                <span>Phí vận chuyển:</span>
                <span className="font-bold text-ink">
                  {isFreeShip ? (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      0 ₫ (Miễn phí)
                    </span>
                  ) : (
                    formatCurrency(shippingFee)
                  )}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Giảm giá Voucher:</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-2.5 border-t border-line">
                <span className="text-[14px] font-bold text-ink">Tổng thanh toán:</span>
                <span className="text-2xl font-extrabold text-accent">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              type="button"
              disabled={isSubmitting || checkoutItems.length === 0}
              onClick={handlePlaceOrder}
              className="w-full h-11 rounded-md bg-accent hover:bg-accent/90 text-white text-[14px] font-bold shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Hàng'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-[11px] text-ink-muted flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Bảo mật thông tin giao dịch 100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
