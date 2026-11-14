import { useState, useEffect } from 'react';
import { X, Ticket } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

function toInputDate(dateVal, fallback = '2026-01-01') {
  if (!dateVal) return fallback;
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
    return dateVal;
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return fallback;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AdminCouponModal() {
  const { activeModal, modalPayload, closeModal, addCoupon, updateCoupon, showToast } = useStore();

  const editCoupon = modalPayload?.coupon;

  const [code, setCode] = useState('SPORT100K');
  const [discountType, setDiscountType] = useState('FIXED_AMOUNT');
  const [discountValue, setDiscountValue] = useState(100000);
  const [minOrderAmount, setMinOrderAmount] = useState(800000);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(100000);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState(500);
  const [description, setDescription] = useState(
    'Giảm 100.000₫ cho đơn hàng thể thao từ 800.000₫'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeModal === 'admin_coupon_modal') {
      if (editCoupon) {
        setCode(editCoupon.code || '');
        setDiscountType(editCoupon.discountType || 'FIXED_AMOUNT');
        setDiscountValue(editCoupon.discountValue ?? editCoupon.discount ?? 100000);
        setMinOrderAmount(editCoupon.minOrderAmount ?? editCoupon.minOrder ?? 0);
        setMaxDiscountAmount(editCoupon.maxDiscountAmount ?? 100000);
        setStartDate(toInputDate(editCoupon.startDate, '2026-01-01'));
        setEndDate(toInputDate(editCoupon.endDate, '2026-12-31'));
        setUsageLimit(editCoupon.usageLimit ?? 500);
        setDescription(editCoupon.description || editCoupon.desc || '');
      } else {
        setCode('SPORT50K');
        setDiscountType('FIXED_AMOUNT');
        setDiscountValue(50000);
        setMinOrderAmount(500000);
        setMaxDiscountAmount(50000);
        setStartDate('2026-01-01');
        setEndDate('2026-12-31');
        setUsageLimit(200);
        setDescription('Giảm 50.000₫ cho đơn hàng từ 500.000₫');
      }
    }
  }, [activeModal, editCoupon]);

  if (activeModal !== 'admin_coupon_modal') return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    const couponData = {
      code: cleanCode,
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount),
      maxDiscountAmount: Number(maxDiscountAmount),
      startDate,
      endDate,
      usageLimit: Number(usageLimit),
      isActive: editCoupon ? editCoupon.isActive : true,
      description: description.trim(),
    };

    setIsSubmitting(true);
    try {
      if (editCoupon) {
        await updateCoupon(editCoupon.id || editCoupon.code, couponData);
      } else {
        await addCoupon(couponData);
      }
      closeModal();
    } catch (err) {
      showToast(err.message || 'Không thể lưu mã khuyến mãi!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-surface rounded-lg w-full max-w-[560px] shadow-xl border border-line overflow-hidden my-8 text-ink">
        {/* Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-surface-2">
          <div className="flex items-center gap-2.5">
            <Ticket className="w-5 h-5 text-accent" />
            <div>
              <h2 className="text-[16px] font-bold text-ink">
                {editCoupon ? 'Cập Nhật Mã Khuyến Mãi' : 'Tạo Mã Giảm Giá Mới'}
              </h2>
              <p className="text-[12px] text-ink-muted">
                Thiết lập chương trình khuyến mãi (bảng coupons)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="w-8 h-8 rounded-md bg-surface border border-line hover:bg-danger/10 text-ink-muted hover:text-danger flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[12px] font-bold text-ink mb-1">
                Mã Coupon (In hoa): <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VD: SPORT100K"
                required
                className="w-full h-10 px-3 rounded-md border border-accent bg-page text-[13px] font-mono font-bold text-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-ink mb-1">
                Loại giảm giá (DiscountType):
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-line bg-page text-[12.5px] font-bold text-ink focus:border-accent focus:outline-none"
              >
                <option value="FIXED_AMOUNT">Giảm cố định (₫)</option>
                <option value="PERCENTAGE">Giảm theo % (PERCENTAGE)</option>
                <option value="FREE_SHIPPING">Miễn phí ship (FREE_SHIPPING)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11.5px] font-bold text-ink mb-1">
                Giá trị giảm:
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-line bg-page text-[13px] text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11.5px] font-bold text-ink mb-1">
                Đơn tối thiểu (₫):
              </label>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-line bg-page text-[13px] text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11.5px] font-bold text-ink mb-1">
                Giảm tối đa (₫):
              </label>
              <input
                type="number"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-line bg-page text-[13px] text-ink focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11.5px] font-bold text-ink mb-1">
                Ngày bắt đầu:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 px-2.5 rounded-md border border-line bg-page text-[12px] text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11.5px] font-bold text-ink mb-1">
                Ngày hết hạn:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-10 px-2.5 rounded-md border border-line bg-page text-[12px] text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11.5px] font-bold text-ink mb-1">
                Giới hạn lượt dùng:
              </label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-line bg-page text-[13px] text-ink focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-ink mb-1">
              Mô tả hiển thị cho khách:
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Giảm 50k cho đơn từ 500k áp dụng toàn sàn..."
              className="w-full p-2.5 rounded-md border border-line bg-page text-[12.5px] text-ink focus:border-accent focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-line flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-surface border border-line hover:bg-surface-2 text-[12.5px] font-bold text-ink-muted transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold shadow-xs transition disabled:opacity-50"
            >
              {isSubmitting
                ? 'Đang lưu...'
                : editCoupon
                  ? 'Cập Nhật Voucher'
                  : 'Tạo Voucher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
