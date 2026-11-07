export default function ProductVariants({
  variants = [],
  selectedVariantId = null,
  setSelectedVariantId,
  maxStock = 0,
}) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold text-ink dark:text-slate-200">
          Chọn Biến Thể (Size / Màu):
        </p>
        <span className="text-[12px] font-medium text-success">
          Còn {maxStock} sản phẩm trong kho
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = selectedVariantId === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedVariantId && setSelectedVariantId(v.id)}
              className={`px-3.5 py-2 rounded-md text-[13px] font-semibold border transition ${
                isSelected
                  ? 'border-2 border-accent bg-accent-soft dark:bg-accent/20 text-accent'
                  : 'border-line bg-surface text-slate-700 dark:text-slate-300 hover:border-accent'
              }`}
            >
              <span>{v.size}</span>
              {v.color && <span className="opacity-75"> · {v.color}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
