import { ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export default function CartSummary({
  cartLength,
  totalItemsCount,
  isAllSelected = false,
  onToggleSelectAll,
  showSelectAll = false,
  selectedCount,
  selectedItemsCount,
  onRemoveSelected,
  selectedSubtotal = 0,
  finalTotal,
  selectedTotalUnits,
  selectedUnitsCount,
  onProceedToCheckout,
}) {
  const effectiveCartLength = totalItemsCount ?? cartLength ?? 0;
  const effectiveTotalUnits = selectedUnitsCount ?? selectedTotalUnits ?? 0;
  const effectiveSelectedCount =
    selectedItemsCount ?? selectedCount ?? (effectiveTotalUnits > 0 ? effectiveTotalUnits : 0);

  const displayTotal = finalTotal !== undefined && finalTotal !== null ? finalTotal : selectedSubtotal;
  const isDisabled = effectiveSelectedCount === 0 && effectiveTotalUnits === 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-line shadow-2xl py-3.5 px-4 md:px-6">
      <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Actions */}
        <div className="flex items-center gap-4">
          {showSelectAll && (
            <label className="flex items-center gap-2.5 cursor-pointer text-[13px] font-bold text-ink">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded text-accent accent-accent cursor-pointer"
              />
              <span>Chọn tất cả ({effectiveCartLength})</span>
            </label>
          )}

          <button
            type="button"
            disabled={isDisabled}
            onClick={onRemoveSelected}
            className="text-[13px] text-ink-muted hover:text-danger font-bold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1.5"
          >
            <span>Xóa các mục đã chọn</span>
            <span className="text-accent font-extrabold">({effectiveSelectedCount})</span>
          </button>
        </div>

        {/* Right: Total Payment CTA */}
        <div className="flex items-center justify-between sm:justify-end gap-5">
          <div className="text-right">
            <div className="flex items-baseline gap-2 justify-end">
              <span className="text-[12px] text-ink-muted">Tổng tạm tính:</span>
              <span className="text-[18px] md:text-[22px] font-black text-accent">
                {formatCurrency(displayTotal)}
              </span>
            </div>
            <p className="text-[11px] text-ink-subtle">
              (Mã giảm giá &amp; phí vận chuyển sẽ áp dụng ở bước Thanh toán)
            </p>
          </div>

          <button
            type="button"
            disabled={isDisabled}
            onClick={onProceedToCheckout}
            className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-[13.5px] font-bold shadow-md flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 active:scale-95"
          >
            <span>Mua Hàng</span>
            <span>({effectiveTotalUnits})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
