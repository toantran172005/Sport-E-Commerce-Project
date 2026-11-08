import { ArrowRight } from 'lucide-react';
import VoucherDropdown from '../promotion/VoucherDropdown.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export default function CartSummary({
  cartLength,
  totalItemsCount,
  isAllSelected = false,
  onToggleSelectAll,
  selectedCount,
  selectedItemsCount,
  onRemoveSelected,
  selectedSubtotal = 0,
  finalTotal = 0,
  voucherDiscount = 0,
  selectedTotalUnits,
  selectedUnitsCount,
  onProceedToCheckout,
}) {
  const effectiveCartLength = totalItemsCount ?? cartLength ?? 0;
  const effectiveTotalUnits = selectedUnitsCount ?? selectedTotalUnits ?? 0;
  const effectiveSelectedCount =
    selectedItemsCount ?? selectedCount ?? (effectiveTotalUnits > 0 ? effectiveTotalUnits : 0);

  const isDisabled = effectiveSelectedCount === 0 && effectiveTotalUnits === 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-line shadow-2xl py-3 px-4 md:px-6">
      <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Select all & Delete */}
        <div className="flex items-center justify-between md:justify-start gap-4">
          <label className="flex items-center gap-2.5 cursor-pointer text-[13px] font-bold text-ink">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={onToggleSelectAll}
              className="w-4 h-4 rounded text-accent accent-accent cursor-pointer"
            />
            <span>Chọn tất cả ({effectiveCartLength})</span>
          </label>

          <button
            type="button"
            disabled={isDisabled}
            onClick={onRemoveSelected}
            className="text-[12.5px] text-ink-muted hover:text-danger font-bold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            Xóa ({effectiveSelectedCount})
          </button>
        </div>

        {/* Right: Voucher & Total Payment CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-6">
          {/* Voucher Trigger */}
          <div className="w-full sm:w-[280px]">
            <VoucherDropdown orderSubtotal={selectedSubtotal} direction="up" />
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
              disabled={isDisabled}
              onClick={onProceedToCheckout}
              className="px-6 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-white text-[13.5px] font-bold shadow-xs flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              <span>Mua Hàng</span>
              <span>({effectiveTotalUnits})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
