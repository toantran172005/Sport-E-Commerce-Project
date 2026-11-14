import { useState, useEffect, useRef } from "react";
import { Ticket, ChevronRight, X, Check, AlertCircle } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency } from "../../utils/formatters";

export default function VoucherDropdown({
  orderSubtotal = 0,
  direction = "down",
  className = "",
}) {
  const { coupons, appliedCoupon, setAppliedCoupon, showToast } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (appliedCoupon) {
      const minReq =
        appliedCoupon.minOrderAmount || appliedCoupon.minOrder || 0;
      if (orderSubtotal < minReq) {
        setAppliedCoupon(null);
      }
    }
  }, [orderSubtotal, appliedCoupon, setAppliedCoupon]);

  const handleApplyInputCode = (e) => {
    e.preventDefault();
    setErrorMsg("");
    const clean = inputCode.trim().toUpperCase();
    if (!clean) return;

    const found = coupons.find((c) => c.code.toUpperCase() === clean);
    if (!found) {
      setErrorMsg("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
      return;
    }

    const minReq = found.minOrderAmount || found.minOrder || 0;
    if (orderSubtotal < minReq) {
      setErrorMsg(
        `Đơn hàng cần đạt tối thiểu ${formatCurrency(minReq)} để áp dụng mã này (còn thiếu ${formatCurrency(minReq - orderSubtotal)}).`,
      );
      return;
    }

    setAppliedCoupon(found);
    setInputCode("");
    setIsOpen(false);
    showToast(`Đã áp dụng mã giảm giá ${found.code} thành công!`, 'success');
  };

  const handleSelectCoupon = (coupon) => {
    const minReq = coupon.minOrderAmount || coupon.minOrder || 0;
    if (orderSubtotal < minReq) {
      showToast(
        `Cần mua thêm ${formatCurrency(minReq - orderSubtotal)} để áp dụng voucher này`,
        'error',
      );
      return;
    }

    if (appliedCoupon?.code === coupon.code) {
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon(coupon);
      setIsOpen(false);
      showToast(`Đã áp dụng mã ${coupon.code}`, 'success');
    }
  };

  const handleRemoveCoupon = (e) => {
    e.stopPropagation();
    setAppliedCoupon(null);
  };

  let discountAmount = 0;
  if (appliedCoupon && orderSubtotal > 0) {
    if (appliedCoupon.discountType === "PERCENTAGE") {
      const pct = appliedCoupon.discountValue || appliedCoupon.discount || 0;
      const raw = (orderSubtotal * pct) / 100;
      const maxDiscount = appliedCoupon.maxDiscountAmount || raw;
      discountAmount = Math.min(raw, maxDiscount);
    } else if (appliedCoupon.discountType === "FREE_SHIPPING") {
      discountAmount = 30000;
    } else {
      discountAmount =
        appliedCoupon.discountValue || appliedCoupon.discount || 0;
    }
  }

  return (
    <div ref={panelRef} className={`relative ${className}`}>
      {/* Trigger Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 p-3 rounded-md bg-surface border border-line hover:border-accent text-left transition"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Ticket className="w-4 h-4 text-accent shrink-0" />
          <span className="text-[13px] font-bold text-ink shrink-0">
            Delta Voucher
          </span>
          {appliedCoupon ? (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-accent-soft text-accent truncate border border-accent/30">
              {appliedCoupon.code} (-{formatCurrency(discountAmount)})
            </span>
          ) : (
            <span className="text-[12px] text-ink-muted truncate">
              Chọn hoặc nhập mã giảm giá
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {appliedCoupon && (
            <span
              onClick={handleRemoveCoupon}
              className="text-[11.5px] font-bold text-danger hover:underline p-1"
              title="Bỏ chọn mã"
            >
              Bỏ chọn
            </span>
          )}
          <ChevronRight
            className={`w-4 h-4 text-ink-subtle transition-transform duration-200 ${
              isOpen ? (direction === "up" ? "-rotate-90" : "rotate-90") : ""
            }`}
          />
        </div>
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 sm:right-auto sm:w-95 bg-surface rounded-lg shadow-2xl border border-line p-4 z-50 animate-in fade-in duration-150 ${
            direction === "up"
              ? "bottom-[calc(100%+8px)]"
              : "top-[calc(100%+8px)]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-line mb-3">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-accent" />
              <h3 className="text-[14px] font-extrabold text-ink">
                Chọn Delta Voucher
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-ink-subtle hover:text-ink rounded-md transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form nhập mã */}
          <form onSubmit={handleApplyInputCode} className="mb-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value.toUpperCase());
                  setErrorMsg("");
                }}
                placeholder="Nhập mã ưu đãi..."
                className="flex-1 h-9 px-3 rounded-md bg-page border border-line text-[12.5px] font-mono text-ink placeholder:text-ink-subtle focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="px-3.5 h-9 rounded-md bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold shadow-xs transition"
              >
                Áp dụng
              </button>
            </div>
            {errorMsg && (
              <p className="text-[11.5px] font-medium text-danger mt-1.5 flex items-start gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </p>
            )}
          </form>

          {/* Danh sách Voucher từ kho */}
          <div className="space-y-2.5 max-h-70 overflow-y-auto pr-1">
            <p className="text-[11px] font-extrabold text-ink-subtle uppercase tracking-wider">
              Mã giảm giá khả dụng ({coupons.length})
            </p>

            {coupons.map((c) => {
              const minReq = c.minOrderAmount || c.minOrder || 0;
              const isEligible = orderSubtotal >= minReq;
              const isSelected = appliedCoupon?.code === c.code;

              return (
                <div
                  key={c.id || c.code}
                  onClick={() => isEligible && handleSelectCoupon(c)}
                  className={`p-3 rounded-md border transition relative flex items-start justify-between gap-3 ${
                    isSelected
                      ? "border-accent bg-accent-soft shadow-2xs"
                      : isEligible
                        ? "border-line bg-page hover:border-accent/60 cursor-pointer"
                        : "border-line/60 bg-surface-2/60 opacity-55 cursor-not-allowed"
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-[13.5px] text-accent">
                        {c.code}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-success-soft text-success">
                        {c.discountType}
                      </span>
                    </div>

                    <p className="text-[12px] font-bold text-ink">
                      {c.discountType === "PERCENTAGE"
                        ? `Giảm ${c.discountValue || c.discount}%`
                        : c.discountType === "FREE_SHIPPING"
                          ? "Miễn phí vận chuyển"
                          : `Giảm ${formatCurrency(c.discountValue || c.discount)}`}
                    </p>

                    <p className="text-[11px] text-ink-muted">
                      Đơn tối thiểu: {formatCurrency(minReq)}
                    </p>

                    {!isEligible && (
                      <p className="text-[10.5px] font-medium text-danger flex items-center gap-1">
                        <span>
                          Mua thêm {formatCurrency(minReq - orderSubtotal)} để
                          dùng
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 pt-0.5">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? "border-accent bg-accent text-white"
                          : "border-line bg-surface"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
