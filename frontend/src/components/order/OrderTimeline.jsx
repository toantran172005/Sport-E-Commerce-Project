import { Clock, CheckCircle2 } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters.js';

export default function OrderTimeline({ histories = [] }) {
  if (!histories || histories.length === 0) {
    return (
      <div className="py-4 text-center text-[12.5px] text-ink-muted">
        Chưa có lịch sử cập nhật trạng thái.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
      {histories.map((h, idx) => {
        const isLatest = idx === histories.length - 1;
        return (
          <div key={h.id || idx} className="relative flex items-start gap-3">
            <div
              className={`absolute -left-6 mt-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                isLatest
                  ? 'border-accent bg-accent text-white shadow-xs'
                  : 'border-line bg-surface text-ink-subtle'
              }`}
            >
              {isLatest ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <Clock className="w-2.5 h-2.5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-bold text-ink">
                  {h.status || 'Cập nhật trạng thái'}
                </span>
                <span className="text-[11px] text-ink-subtle">
                  {formatDateTime(h.createdAt)}
                </span>
              </div>
              {h.note && (
                <p className="text-[12px] text-ink-muted mt-0.5 leading-relaxed">
                  {h.note}
                </p>
              )}
              {h.changedBy?.fullName && (
                <p className="text-[11px] text-ink-subtle mt-0.5">
                  Thực hiện bởi: {h.changedBy.fullName}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
