/**
 * Badge hiển thị số thứ tự (STT) sản phẩm thống nhất cho Cart, Checkout, OrderDetail và Admin.
 */
export default function LineNumberBadge({ n }) {
  if (n === undefined || n === null) return null;

  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface-2 border border-line text-[11px] font-bold text-ink-muted shrink-0 select-none"
      aria-label={`Sản phẩm số ${n}`}
      title={`STT: ${n}`}
    >
      {n}
    </span>
  );
}
