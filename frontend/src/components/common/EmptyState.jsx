import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'Không có dữ liệu',
  description = 'Hiện tại chưa có mục nào trong danh sách này.',
  actionText = null,
  actionLink = null,
  onAction = null,
  icon: Icon = PackageOpen,
}) {
  return (
    <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-surface-2 dark:bg-surface-2 flex items-center justify-center text-ink-subtle mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-ink mb-1">{title}</h3>
      <p className="text-[13px] text-ink-muted max-w-md mb-5">{description}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-[13px] font-bold transition shadow-xs"
        >
          {actionText}
        </Link>
      )}
      {actionText && onAction && !actionLink && (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-[13px] font-bold transition shadow-xs"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
