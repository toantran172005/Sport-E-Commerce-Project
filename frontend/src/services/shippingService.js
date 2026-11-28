import axiosClient from '../api/axiosClient.js';
import { createTtlCache } from '../utils/ttlCache.js';
import {
  SHIPPING_CACHE_TTL_MS,
  PROVIDERS_CACHE_TTL_MS,
  buildShippingCacheKey,
} from '../utils/shippingCacheKey.js';
import {
  normalizeShippingQuote,
  calculateShippingFee,
  calculateEstimatedDeliveryDate,
} from '../utils/shippingQuote.js';

export const DEFAULT_SHIPPING_PROVIDERS = [
  { id: 1, name: 'Giao Hàng Nhanh (GHN Express)', code: 'GHN', baseFee: 30000, isActive: true },
  { id: 2, name: 'Giao Hàng Tiết Kiệm (GHTK)', code: 'GHTK', baseFee: 25000, isActive: true },
];

const shippingCache = createTtlCache({
  ttlMs: SHIPPING_CACHE_TTL_MS,
  storageKey: 'sport_shipping_cache',
});

const providersCache = createTtlCache({
  ttlMs: PROVIDERS_CACHE_TTL_MS,
  storageKey: 'sport_providers_cache',
});

/**
 * Xóa cache báo giá vận chuyển (gọi khi đổi địa chỉ hoặc đăng xuất)
 */
export function invalidateShippingCache() {
  shippingCache.clear();
}

/**
 * Báo giá đồng thời cho tất cả các đơn vị vận chuyển (GHN, GHTK)
 */
export async function getShippingQuotes({ addressId, city, subTotal = 0 }) {
  const providers = await shippingService.getShippingProviders();
  const quotes = {};
  await Promise.all(
    providers.map(async (p) => {
      quotes[p.code] = await shippingService.calculateShipping({
        providerCode: p.code,
        addressId,
        city,
        subTotal,
      });
    })
  );
  return quotes;
}

export const shippingService = {
  DEFAULT_SHIPPING_PROVIDERS,
  invalidateShippingCache,
  getShippingQuotes,

  /**
   * Lấy danh sách đơn vị vận chuyển (chỉ GHN và GHTK, cache 1 giờ)
   */
  async getShippingProviders() {
    return providersCache.getOrLoad('providers', async () => {
      try {
        const response = await axiosClient.get('/shipping-providers');
        const data = response?.data || response;
        if (Array.isArray(data) && data.length > 0) {
          const active = data.filter(
            (p) => Boolean(p.isActive) && (p.code === 'GHN' || p.code === 'GHTK')
          );
          if (active.length > 0) return active;
        }
      } catch (err) {
        console.warn('Lỗi lấy danh sách đơn vị vận chuyển từ API, dùng mặc định:', err.message);
      }
      return DEFAULT_SHIPPING_PROVIDERS;
    });
  },

  /**
   * Báo giá vận chuyển (tính toán đồng bộ trực tiếp trên client 0ms, không tốn network roundtrip)
   */
  async calculateShipping({ providerCode = 'GHN', addressId, city, subTotal = 0 }) {
    const code = (providerCode || 'GHN').toUpperCase();
    const cacheKey = buildShippingCacheKey({
      providerCode: code,
      addressId,
      city,
      subTotal,
    });

    const cached = shippingCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const fee = calculateShippingFee(code, city, subTotal);
    const est = calculateEstimatedDeliveryDate(code, city);
    const result = {
      providerCode: code,
      shippingFee: fee,
      estimatedDeliveryDate: est.estimatedDeliveryDate,
      formattedDeliveryDate: est.formattedDeliveryDate,
      source: 'client',
    };

    const normalized = normalizeShippingQuote(result, { subTotal, source: 'client' });
    shippingCache.set(cacheKey, normalized, { ttlMs: SHIPPING_CACHE_TTL_MS });
    return normalized;
  },
};

export default shippingService;
