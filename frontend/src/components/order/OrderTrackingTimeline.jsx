import {
  CheckCircle2,
  ClipboardCheck,
  Package,
  PackageCheck,
  Truck,
  CreditCard,
  XCircle,
  RotateCcw,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { formatDateTime, formatDate } from '../../utils/formatters.js';

// Thứ tự các chặng của một đơn giao thành công
const STAGES = [
  { key: 'PLACED', title: 'Đặt hàng thành công', desc: 'Đơn hàng đã được ghi nhận.', icon: ClipboardCheck },
  { key: 'CONFIRMED', title: 'Đơn hàng đã được xác nhận', desc: 'Cửa hàng đã tiếp nhận và đang chuẩn bị hàng cho bạn.', icon: CheckCircle2 },
  { key: 'PROCESSING', title: 'Đang đóng gói', desc: 'Đơn hàng đang được đóng gói và chuẩn bị bàn giao cho đơn vị vận chuyển.', icon: Package },
  { key: 'SHIPPED', title: 'Đang vận chuyển', desc: 'Đơn hàng đã được bàn giao cho đơn vị vận chuyển và đang trên đường giao đến bạn.', icon: Truck },
  { key: 'DELIVERED', title: 'Giao hàng thành công', desc: 'Bạn đã nhận được hàng. Hãy để lại đánh giá sản phẩm nhé!', icon: PackageCheck },
];

const RANK = { PENDING: 0, CONFIRMED: 1, PROCESSING: 2, SHIPPED: 3, SHIPPING: 3, DELIVERED: 4, COMPLETED: 4 };

const CARRIER_LINKS = {
  GHN: (code) => `https://donhang.ghn.vn/?order_code=${encodeURIComponent(code)}`,
  GHTK: (code) => `https://i.ghtk.vn/${encodeURIComponent(code)}`,
};

const toTime = (value) => {
  const t = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
};

/**
 * Lộ trình đơn hàng kiểu sàn thương mại: tóm tắt hiện tại + các mốc đã qua (mới nhất ở trên).
 * Dữ liệu lấy từ lịch sử trạng thái, thông tin vận chuyển và thanh toán của đơn (không cần API ngoài).
 */
export default function OrderTrackingTimeline({ order, onCopy }) {
  if (!order) return null;

  const status = String(order.status || 'PENDING').toUpperCase();
  const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];
  const shipment = order.shipment || {};

  // Lấy thời điểm đầu tiên đơn đạt trạng thái đó (ưu tiên lịch sử, dự phòng các cột thời gian trên đơn)
  const timeOf = (statusKey) => {
    const hit = history.find((h) => h.status === statusKey);
    if (hit?.createdAt) return hit.createdAt;
    switch (statusKey) {
      case 'PENDING': return order.placedAt || order.createdAtRaw || null;
      case 'CONFIRMED': return order.confirmedAt || null;
      case 'SHIPPED': return shipment.shippedAt || null;
      case 'DELIVERED': return shipment.deliveredAt || null;
      case 'CANCELED': return order.canceledAt || null;
      default: return null;
    }
  };

  const isCanceled = status === 'CANCELED' || status === 'CANCELLED';
  const isReturn = status === 'RETURN_REQUESTED' || status === 'RETURNED';
  const currentRank = isReturn ? 4 : RANK[status] ?? 0;

  // Các mốc đã xảy ra
  const events = [];
  STAGES.forEach((stage, index) => {
    const statusKey = stage.key === 'PLACED' ? 'PENDING' : stage.key;
    const time = timeOf(statusKey);
    // Đơn đã hủy: chỉ hiện các chặng thật sự đã đi qua (có thời điểm ghi nhận)
    const reached = isCanceled ? Boolean(time) || index === 0 : index <= currentRank;
    if (reached) events.push({ ...stage, time, kind: 'stage' });
  });

  if (order.payment?.paidAt && order.paymentMethod !== 'COD') {
    events.push({
      key: 'PAID',
      title: 'Thanh toán thành công',
      desc: 'Cửa hàng đã nhận được thanh toán của bạn.',
      icon: CreditCard,
      time: order.payment.paidAt,
      kind: 'payment',
    });
  }

  if (isCanceled) {
    events.push({
      key: 'CANCELED',
      title: 'Đơn hàng đã được hủy',
      desc: order.cancelReason ? `Lý do: ${order.cancelReason}` : 'Đơn hàng đã được hủy.',
      icon: XCircle,
      time: timeOf('CANCELED'),
      kind: 'canceled',
    });
  }
  if (isReturn) {
    const requested = timeOf('RETURN_REQUESTED');
    if (requested || status === 'RETURN_REQUESTED') {
      events.push({
        key: 'RETURN_REQUESTED',
        title: 'Đã nhận yêu cầu hoàn trả',
        desc: 'Cửa hàng đã ghi nhận yêu cầu hoàn trả của bạn.',
        icon: RotateCcw,
        time: requested,
        kind: 'return',
      });
    }
    if (status === 'RETURNED') {
      events.push({
        key: 'RETURNED',
        title: 'Đơn hàng đã được hoàn trả',
        desc: 'Hàng đã được hoàn trả thành công. Nếu bạn đã thanh toán trước, cửa hàng sẽ hoàn tiền cho bạn.',
        icon: RotateCcw,
        time: timeOf('RETURNED'),
        kind: 'return',
      });
    }
  }

  // Mới nhất ở trên: sắp theo thời gian giảm dần; mốc không có thời gian giữ thứ tự chặng
  const ordered = events
    .map((e, i) => ({ ...e, _i: i }))
    .sort((a, b) => {
      const dt = toTime(b.time) - toTime(a.time);
      return dt !== 0 ? dt : b._i - a._i;
    });

  const latest = ordered[0];
  const nextStage = !isCanceled && !isReturn ? STAGES[currentRank + 1] : null;

  const carrierCode = String(order.shippingProviderCode || shipment.provider?.code || '').toUpperCase();
  const carrierName = order.shippingProviderName || shipment.provider?.name || carrierCode || 'Đơn vị vận chuyển';
  const tracking = order.trackingNumber || shipment.trackingNumber || '';
  const hasRealTracking = tracking && !String(tracking).startsWith('PENDING_');
  const trackLink = hasRealTracking && CARRIER_LINKS[carrierCode] ? CARRIER_LINKS[carrierCode](tracking) : null;
  const eta = shipment.estimatedDeliveryDate;
  const showEta = eta && !isCanceled && !isReturn && currentRank < 4;
  const showCarrier = !isCanceled && currentRank >= 2 || Boolean(tracking);

  const tone = (kind) => {
    if (kind === 'canceled') return 'bg-danger text-white border-danger';
    if (kind === 'return') return 'bg-amber-500 text-white border-amber-500';
    return 'bg-success text-white border-success';
  };

  return (
    <div className="p-6 border-b border-line bg-page/30 space-y-5">
      <h3 className="text-[13px] font-extrabold uppercase text-ink tracking-wider">LỘ TRÌNH ĐƠN HÀNG</h3>

      {/* Tóm tắt hiện tại */}
      <div className="rounded-lg border border-line bg-surface p-4 space-y-2">
        <p className="text-[15px] font-extrabold text-ink">{latest?.title}</p>
        <p className="text-[12.5px] text-ink-muted leading-relaxed">{latest?.desc}</p>
        {nextStage && (
          <p className="text-[12px] text-ink-subtle">
            Bước tiếp theo: <strong className="text-ink">{nextStage.title}</strong>
          </p>
        )}
        {showEta && (
          <p className="text-[12px] text-ink-subtle">
            Dự kiến giao hàng: <strong className="text-ink">{formatDate(eta)}</strong>
          </p>
        )}
        {showCarrier && (
          <div className="pt-2 mt-1 border-t border-line flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px]">
            <span className="text-ink-muted">
              Đơn vị vận chuyển: <strong className="text-ink">{carrierName}</strong>
            </span>
            {hasRealTracking ? (
              <span className="inline-flex items-center gap-1.5 text-ink-muted">
                Mã vận đơn:
                <span className="px-1.5 py-0.5 rounded bg-surface-2 text-ink font-mono text-[11.5px] border border-line">
                  {tracking}
                </span>
                <button
                  type="button"
                  onClick={() => onCopy?.(tracking, 'mã vận đơn')}
                  className="text-accent hover:opacity-75 transition cursor-pointer"
                  title="Sao chép mã vận đơn"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {trackLink && (
                  <a
                    href={trackLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline font-semibold"
                  >
                    <span>Tra cứu trên {carrierCode}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </span>
            ) : (
              <span className="text-ink-muted">Mã vận đơn: đang chờ đơn vị vận chuyển cập nhật</span>
            )}
          </div>
        )}
      </div>

      {/* Các mốc đã qua */}
      <ol className="relative pl-8 space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
        {ordered.map((event, index) => {
          const Icon = event.icon;
          const isLatest = index === 0;
          return (
            <li key={`${event.key}-${index}`} className="relative">
              <span
                className={`absolute -left-8 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isLatest ? tone(event.kind) : 'bg-surface text-ink-subtle border-line'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className={`text-[13px] font-bold ${isLatest ? 'text-ink' : 'text-ink-muted'}`}>{event.title}</p>
                {event.time && <span className="text-[11.5px] text-ink-subtle">{formatDateTime(event.time)}</span>}
              </div>
              <p className="text-[12px] text-ink-subtle mt-0.5 leading-relaxed">{event.desc}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
