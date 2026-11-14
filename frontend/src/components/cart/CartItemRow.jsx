import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, Package } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import LineNumberBadge from '../common/LineNumberBadge.jsx';

export default function CartItemRow({
  item,
  itemKey,
  lineNumber,
  isChecked,
  onToggleSelect,
  onUpdateQuantity,
  onRemove,
}) {
  const effectiveStock = item.stock ?? 20;
  const isOutOfStock = effectiveStock <= 0;
  const isLowStock = effectiveStock > 0 && effectiveStock <= 5;

  return (
    <div className="p-4 md:px-5 md:py-4 flex flex-col md:grid md:grid-cols-12 gap-3.5 md:items-center hover:bg-page/40 transition">
      {/* Product Info & Checkbox */}
      <div className="col-span-5 flex items-start gap-3">
        {lineNumber != null && (
          <div className="mt-0.5 shrink-0">
            <LineNumberBadge n={lineNumber} />
          </div>
        )}
        <input
          type="checkbox"
          disabled={isOutOfStock}
          checked={isChecked && !isOutOfStock}
          onChange={() => onToggleSelect && onToggleSelect(itemKey)}
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
            onClick={() => onUpdateQuantity && onUpdateQuantity(-1)}
            className="w-7 h-7 flex items-center justify-center hover:bg-surface-2 text-ink disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-9 text-center text-[13px] font-bold text-ink">
            {item.quantity}
          </span>
          <button
            type="button"
            disabled={false}
            onClick={() => onUpdateQuantity && onUpdateQuantity(1)}
            className="w-7 h-7 flex items-center justify-center hover:bg-surface-2 text-ink disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
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
          onClick={() => onRemove && onRemove(item.productId, item.variantId)}
          className="text-ink-subtle hover:text-danger p-1 rounded hover:bg-danger-soft transition cursor-pointer"
          title="Xóa khỏi giỏ hàng"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
