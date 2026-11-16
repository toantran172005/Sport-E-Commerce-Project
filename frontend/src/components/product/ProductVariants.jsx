const COLOR_HEX_MAP = {
  'đen': '#111827',
  'trắng': '#f3f4f6',
  'xám': '#9ca3af',
  'đỏ': '#dc2626',
  'xanh': '#2563eb',
  'xanh dương': '#2563eb',
  'xanh navy': '#1e3a8a',
  'xanh lá': '#16a34a',
  'vàng': '#eab308',
  'cam': '#f97316',
  'hồng': '#ec4899',
  'tím': '#a855f7',
  'nâu': '#78350f',
  'black': '#111827',
  'white': '#f3f4f6',
  'red': '#dc2626',
  'blue': '#2563eb',
  'navy': '#1e3a8a',
  'green': '#16a34a',
  'yellow': '#eab308',
  'pink': '#ec4899',
};

const getColorHex = (colorName) => {
  if (!colorName) return null;
  const key = colorName.toLowerCase().trim();
  return COLOR_HEX_MAP[key] || null;
};

export default function ProductVariants({
  variants = [],
  selectedVariantId = null,
  setSelectedVariantId,
  maxStock = 0,
}) {
  if (!variants || variants.length === 0) return null;

  const currentVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold text-ink dark:text-slate-200">
          Chọn Biến Thể (Màu / Size):
          {currentVariant && (
            <span className="ml-2 font-normal text-ink-muted">
              {currentVariant.color ? `${currentVariant.color} - ` : ''}Size {currentVariant.size}
            </span>
          )}
        </p>
        <span className={`text-[12px] font-medium ${maxStock > 0 ? 'text-success' : 'text-danger'}`}>
          {maxStock > 0 ? `Còn ${maxStock} sản phẩm` : 'Tạm hết hàng'}
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {variants.map((v) => {
          const isSelected = selectedVariantId === v.id;
          const colorHex = getColorHex(v.color);
          const isOutOfStock = (v.stock ?? 1) <= 0;

          return (
            <button
              key={v.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => setSelectedVariantId && setSelectedVariantId(v.id)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium border-2 transition-all ${
                isSelected
                  ? 'border-accent bg-accent-soft dark:bg-accent/20 text-accent ring-2 ring-accent/20 shadow-xs'
                  : isOutOfStock
                  ? 'border-line bg-surface opacity-40 cursor-not-allowed line-through'
                  : 'border-line bg-surface text-ink hover:border-accent/60 hover:bg-surface-2'
              }`}
            >
              {/* Variant Thumbnail if available */}
              {v.imageUrl ? (
                <img
                  src={v.imageUrl}
                  alt={v.color || v.size}
                  className={`w-6 h-6 rounded object-cover border ${
                    isSelected ? 'border-accent' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : colorHex ? (
                <span
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                  style={{ backgroundColor: colorHex }}
                />
              ) : null}

              {/* Color & Size Label */}
              <span>
                {v.color ? `${v.color} - ` : ''}{v.size || 'Tiêu chuẩn'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
