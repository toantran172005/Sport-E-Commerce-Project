/**
 * Shipping Cache Key builders and TTL constants.
 */

export const SHIPPING_CACHE_TTL_MS = 10 * 60_000; // 10 phút cho kết quả API
export const FALLBACK_SHIPPING_TTL_MS = 30_000;    // 30 giây cho kết quả fallback
export const PROVIDERS_CACHE_TTL_MS = 60 * 60_000; // 1 giờ cho danh sách đơn vị vận chuyển

/**
 * Chuẩn hóa tên thành phố / tỉnh để tạo cache key ổn định
 */
export function normalizeCity(city) {
  return (city || '').trim().toLowerCase();
}

/**
 * Phân nhóm giá trị giỏ hàng thành các bucket để tránh tràn cache key
 * - subTotal <= 0: '0'
 * - 0 < subTotal < 500k: 'lt_500k'
 * - 500k <= subTotal < 1M: 'lt_1m'
 * - subTotal >= 1M: 'gte_1m' (được freeship)
 */
export function getSubtotalBucket(subTotal) {
  const num = typeof subTotal === 'number' && !Number.isNaN(subTotal) ? subTotal : 0;
  if (num <= 0) return '0';
  if (num < 500000) return 'lt_500k';
  if (num < 1000000) return 'lt_1m';
  return 'gte_1m';
}

/**
 * Tạo cache key cho báo giá vận chuyển
 * Định dạng: ${providerCode}|${addressId ?? ''}|${normalizeCity(city)}|${getSubtotalBucket(subTotal)}
 */
export function buildShippingCacheKey({ providerCode = 'GHN', addressId, city, subTotal = 0 } = {}) {
  const code = (providerCode || 'GHN').trim().toUpperCase();
  const addr = addressId !== undefined && addressId !== null ? String(addressId) : '';
  const normCity = normalizeCity(city);
  const bucket = getSubtotalBucket(subTotal);
  return `${code}|${addr}|${normCity}|${bucket}`;
}
