import { FREE_SHIPPING_THRESHOLD_1M } from './pricing.js';
import { formatEstimatedDelivery } from './formatters.js';

export const FALLBACK_SHIPPING_FEE = 30000;

/**
 * Tính phí vận chuyển trực tiếp trên Client (0ms phản hồi, không phụ thuộc API mạng)
 * @param {string} providerCode - 'GHN' | 'GHTK' | 'VTP'
 * @param {string|object} address - Tên thành phố hoặc object địa chỉ có city
 * @param {number} subTotal - Tổng tiền hàng
 * @returns {number} Phí vận chuyển (VNĐ)
 */
export function calculateShippingFee(providerCode = 'GHN', address = '', subTotal = 0) {
  if (subTotal != null && Number(subTotal) >= FREE_SHIPPING_THRESHOLD_1M) {
    return 0;
  }

  const cityStr = typeof address === 'string'
    ? address
    : (address?.city || address?.province || '');
  const city = cityStr.toLowerCase().trim();
  const isLocal = city.includes('hồ chí minh') || city.includes('hcm');

  const code = (providerCode || 'GHN').toUpperCase();
  switch (code) {
    case 'GHN':
      return isLocal ? 25000 : 38000;
    case 'GHTK':
      return isLocal ? 22000 : 35000;
    case 'VTP':
      return isLocal ? 20000 : 32000;
    default:
      return 30000;
  }
}

/**
 * Tính ngày giao hàng dự kiến trực tiếp trên Client (0ms)
 * @param {string} providerCode - 'GHN' | 'GHTK' | 'VTP'
 * @param {string|object} address - Tên thành phố hoặc object địa chỉ có city
 * @returns {{ estimatedDeliveryDate: string, formattedDeliveryDate: string }}
 */
export function calculateEstimatedDeliveryDate(providerCode = 'GHN', address = '') {
  const cityStr = typeof address === 'string'
    ? address
    : (address?.city || address?.province || '');
  const city = cityStr.toLowerCase().trim();
  const isLocal = city.includes('hồ chí minh') || city.includes('hcm');

  const code = (providerCode || 'GHN').toUpperCase();
  let daysToAdd;
  switch (code) {
    case 'GHN':
      daysToAdd = isLocal ? 1 : 3;
      break;
    case 'GHTK':
      daysToAdd = isLocal ? 2 : 3;
      break;
    case 'VTP':
      daysToAdd = isLocal ? 2 : 4;
      break;
    default:
      daysToAdd = 3;
      break;
  }

  const est = new Date();
  est.setDate(est.getDate() + daysToAdd);

  const yyyy = est.getFullYear();
  const mm = String(est.getMonth() + 1).padStart(2, '0');
  const dd = String(est.getDate()).padStart(2, '0');

  return {
    estimatedDeliveryDate: `${yyyy}-${mm}-${dd}`,
    formattedDeliveryDate: `${dd}/${mm}/${yyyy}`,
  };
}

/**
 * Chuẩn hóa kết quả báo giá vận chuyển để giao diện luôn nhận cấu trúc nhất quán
 * @param {Object|null} raw - Báo giá thô từ API hoặc fallback
 * @param {Object} options - { subTotal, source: 'api'|'fallback'|'client' }
 * @returns {{ shippingFee: number, estimatedDeliveryDate: string|null, formattedDeliveryDate: string, source: 'api'|'fallback'|'client' }}
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
    source: source,
  };
}
