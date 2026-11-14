import { FREE_SHIPPING_THRESHOLD_1M } from './pricing.js';
import { formatEstimatedDelivery } from './formatters.js';

export const FALLBACK_SHIPPING_FEE = 30000;

/**
 * Chuẩn hóa kết quả báo giá vận chuyển để giao diện luôn nhận cấu trúc nhất quán
 * @param {Object|null} raw - Báo giá thô từ API hoặc fallback
 * @param {Object} options - { subTotal, source: 'api'|'fallback' }
 * @returns {{ shippingFee: number, estimatedDeliveryDate: string|null, formattedDeliveryDate: string, source: 'api'|'fallback' }}
 */
export function normalizeShippingQuote(raw, { subTotal = 0, source = 'api' } = {}) {
  const isFreeShip = subTotal >= FREE_SHIPPING_THRESHOLD_1M;
  const defaultFee = isFreeShip ? 0 : FALLBACK_SHIPPING_FEE;

  let fee = typeof raw?.shippingFee === 'number' ? raw.shippingFee : defaultFee;
  if (isFreeShip) {
    fee = 0;
  }

  let estDate = raw?.estimatedDeliveryDate ?? null;
  if (typeof estDate === 'object' && estDate !== null && !(estDate instanceof Date)) {
    estDate = String(estDate);
  }

  let formattedDate = raw?.formattedDeliveryDate || '';
  if (!formattedDate) {
    const targetDate = estDate || new Date(Date.now() + 3 * 86400000);
    formattedDate = formatEstimatedDelivery(targetDate);
  }

  return {
    shippingFee: fee,
    estimatedDeliveryDate: estDate ? String(estDate) : null,
    formattedDeliveryDate: formattedDate,
    source: source === 'fallback' ? 'fallback' : 'api',
  };
}
