import { useState, useEffect, useMemo } from 'react';
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
import { shippingService, DEFAULT_SHIPPING_PROVIDERS } from '../../services/shippingService.js';
import { orderService } from '../../services/orderService.js';
import { paymentService } from '../../services/paymentService.js';
import { VoucherDropdown } from '../../components/promotion';
import { PaymentMethodSelector } from '../../components/payment';

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
    showErrorModal,
    addOrder,
  } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      showToast('Vui lòng đăng nhập để tiến hành đặt hàng', 'warning');
      navigate('/login?redirect=/checkout', { replace: true });
    }
  }, [user, navigate, showToast]);

  // Cố định (freeze) danh sách sản phẩm trong phiên checkout hiện tại
  // để khi đặt hàng xong và xóa sản phẩm khỏi giỏ hàng, giao diện tóm tắt KHÔNG bị nhảy sang sản phẩm khác (như giày Nike)
  const [frozenCheckoutItems] = useState(() => {
    const initialList =
      selectedCartItems && selectedCartItems.length > 0 ? selectedCartItems : cart;
    return initialList ? [...initialList] : [];
  });

  const checkoutItems =
    frozenCheckoutItems && frozenCheckoutItems.length > 0
      ? frozenCheckoutItems
      : selectedCartItems && selectedCartItems.length > 0
      ? selectedCartItems
      : cart;

  const checkoutSubtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [checkoutItems]
  );

  const [isInitializing, setIsInitializing] = useState(true);
  const [shippingProviders, setShippingProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState(1);
  const [shippingQuotes, setShippingQuotes] = useState({});
  const [shippingFee, setShippingFee] = useState(() => (checkoutSubtotal >= 1000000 ? 0 : 30000));
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');

  const [shippingNote, setShippingNote] = useState('Giao giờ hành chính');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unified Shipping & Provider initialization pipeline (0 layout shifts)
  useEffect(() => {
    let isMounted = true;

    const initializeCheckoutShipping = async () => {
      try {
        const rawProviders = await shippingService.getShippingProviders();
        const providers =
          Array.isArray(rawProviders) && rawProviders.length > 0
            ? rawProviders
            : DEFAULT_SHIPPING_PROVIDERS;

        if (!isMounted) return;
        setShippingProviders(providers);

        const currentProvider =
          providers.find((p) => p.id === selectedProviderId) || providers[0];
        const defaultCode = currentProvider?.code || (currentProvider?.id === 2 ? 'GHTK' : 'GHN');

        const quotes = {};
        await Promise.all(
          providers.map(async (p) => {
            const code = p.code || (p.id === 2 ? 'GHTK' : 'GHN');
            try {
              const res = await shippingService.calculateShipping({
                providerCode: code,
                addressId: selectedAddress?.id,
                city: selectedAddress?.city,
                subTotal: checkoutSubtotal,
              });
              quotes[code] = res?.data || res;
            } catch (err) {
              console.warn('Lỗi tính phí ship cho đơn vị:', code, err);
            }
          })
        );

        if (!isMounted) return;
        setShippingQuotes(quotes);

        const initialQuote = quotes[defaultCode];
        if (initialQuote) {
          setShippingFee(
            initialQuote.shippingFee ?? (checkoutSubtotal >= 1000000 ? 0 : 30000)
          );
          setEstimatedDeliveryDate(initialQuote.formattedDeliveryDate || '');
        }
      } catch (err) {
        console.warn('Lỗi khởi tạo vận chuyển:', err);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeCheckoutShipping();

    return () => {
      isMounted = false;
    };
  }, [selectedAddress?.id, selectedAddress?.city, checkoutSubtotal]);

  const safeProviders =
    Array.isArray(shippingProviders) && shippingProviders.length > 0
      ? shippingProviders
      : DEFAULT_SHIPPING_PROVIDERS;
  const selectedProvider =
    safeProviders.find((p) => p.id === selectedProviderId) || safeProviders[0];
  const selectedProviderCode =
    selectedProvider?.code || (selectedProviderId === 2 ? 'GHTK' : 'GHN');

  useEffect(() => {
    if (!isSubmitting && checkoutItems.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [checkoutItems.length, isSubmitting, navigate]);

  const isFreeShip = shippingFee === 0;

  const discountAmount = calculateDiscount(appliedCoupon, checkoutSubtotal, shippingFee);
  const totalAmount = Math.max(0, checkoutSubtotal + shippingFee - discountAmount);

  const handlePlaceOrder = async () => {
    if (checkoutItems.length === 0) {
      showToast('Không có sản phẩm nào để đặt hàng!', 'error');
      navigate('/cart');
      return;
    }

    if (!selectedAddress) {
      showToast('Vui lòng chọn hoặc thêm địa chỉ nhận hàng!', 'error');
      openModal('address_modal');
      return;
    }

    setIsSubmitting(true);
    try {
      const hasRealCartItemIds = checkoutItems.some(
        (it) => it.cartItemId && typeof it.cartItemId === 'number'
      );

      const orderPayload = {
        userId: user?.id ? Number(user.id) : null,
        shippingAddressId: Number(selectedAddress.id),
        paymentMethod: paymentMethod === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'COD',
        note: shippingNote || '',
        shippingProviderCode: selectedProviderId === 2 ? 'GHTK' : 'GHN',
        couponId: appliedCoupon?.id ? Number(appliedCoupon.id) : null,
        subTotal: checkoutSubtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        shippingAddressSnapshot: `${selectedAddress.addressLine}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.city}`,
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

      if (hasRealCartItemIds) {
        orderPayload.cartItemIds = checkoutItems
          .map((item) => item.cartItemId)
          .filter(Boolean);
      } else {
        orderPayload.items = {
          variantId: Number(checkoutItems[0]?.variantId || 1),
          quantity: Number(checkoutItems[0]?.quantity || 1),
        };
      }

      const res = await orderService.placeOrder(orderPayload);
      const newOrder = res?.data || res;
      const orderId = newOrder?.orderId || newOrder?.id;
      const orderCode = newOrder?.orderCode || newOrder?.code;

      const orderForContext = {
        id: orderId,
        orderCode: orderCode,
        code: orderCode,
        status: paymentMethod === 'BANK_TRANSFER' ? 'PENDING' : 'CONFIRMED',
        total: newOrder?.totalAmount || totalAmount,
        totalAmount: newOrder?.totalAmount || totalAmount,
        subTotal: checkoutSubtotal,
        shippingFee,
        discountAmount,
        paymentMethod: paymentMethod === 'BANK_TRANSFER' ? 'VNPAY' : 'COD',
        shippingAddress: `${selectedAddress.addressLine}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.city}`,
        receiverName: selectedAddress.recipientName || 'Khách hàng',
        receiverPhone: selectedAddress.phoneNumber || '0901234567',
        items: checkoutItems.map((it) => ({
          id: it.variantId || it.productId,
          variantId: it.variantId,
          productId: it.productId,
          name: it.name,
          productName: it.name,
          variant: it.variant,
          price: it.price,
          quantity: it.quantity,
          image: it.imageUrl || it.image,
          imageUrl: it.imageUrl || it.image,
        })),
        createdAt: new Date().toISOString(),
      };

      if (typeof addOrder === 'function') {
        addOrder(orderForContext);
      }

      checkoutItems.forEach((item) => {
        removeFromCart(item.productId, item.variantId);
      });

      if (paymentMethod === 'BANK_TRANSFER') {
        const paymentRes = await paymentService.createPayment({
          orderId,
          method: 'BANK_TRANSFER',
        });
        openModal('vnpay_qr_modal', {
          amount: newOrder?.totalAmount || totalAmount,
          orderCode,
          orderId,
          paymentUrl: paymentRes?.paymentUrl || paymentRes?.data?.paymentUrl,
        });
      } else {
        await paymentService.createPayment({
          orderId,
          method: 'COD',
        });
        showToast('Đặt hàng thành công!', 'success');
        navigate(
          `/payment-result?orderId=${orderId}&orderCode=${orderCode}&method=COD`
        );
      }
    } catch (err) {
      console.error('Lỗi khi đặt hàng:', err);
      showErrorModal(err, { title: 'Đặt Hàng Không Thành Công' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="max-w-[1360px] w-full mx-auto px-4 py-32 flex flex-col items-center justify-center gap-4 min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-[15px] font-bold text-ink">Đang tải đơn vị vận chuyển & biểu phí...</p>
          <p className="text-[12.5px] text-ink-muted">Hệ thống đang kết nối dữ liệu vận chuyển từ Backend</p>
        </div>
      </div>
    );
  }

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
              {safeProviders.map((provider) => {
                const isSelected = selectedProviderId === provider.id;
                const code = provider.code || (provider.id === 2 ? 'GHTK' : 'GHN');
                const quote = shippingQuotes[code];
                const providerFee = quote?.shippingFee ?? (checkoutSubtotal >= 1000000 ? 0 : 30000);
                const providerDate = quote?.formattedDeliveryDate;

                return (
                  <div
                    key={provider.id}
                    onClick={() => {
                      setSelectedProviderId(provider.id);
                      setShippingFee(providerFee);
                      if (providerDate) setEstimatedDeliveryDate(providerDate);
                    }}
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
                        <p className="text-[13px] font-bold text-ink flex items-center gap-2">
                          <span>{provider.name}</span>
                          <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-surface-2 text-accent border border-line">
                            {code}
                          </span>
                        </p>
                        <p className="text-[11px] text-ink-muted mt-0.5">
                          {providerDate ? (
                            <>
                              Dự kiến giao hàng: <strong className="text-accent">{providerDate}</strong>
                            </>
                          ) : (
                            'Thời gian giao hàng: 2-3 ngày làm việc'
                          )}
                        </p>
                      </div>
                    </div>

                    <span className="text-[13px] font-bold text-ink">
                      {providerFee === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                          Miễn phí (Freeship)
                        </span>
                      ) : (
                        formatCurrency(providerFee)
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
          <PaymentMethodSelector
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
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
                <span>Phí vận chuyển ({selectedProviderCode}):</span>
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

              {estimatedDeliveryDate && (
                <div className="flex justify-between text-[11.5px] text-ink-subtle">
                  <span>Dự kiến giao hàng:</span>
                  <span className="font-semibold text-accent">{estimatedDeliveryDate}</span>
                </div>
              )}

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
