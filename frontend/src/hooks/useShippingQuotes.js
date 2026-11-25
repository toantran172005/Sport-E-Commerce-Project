import { useState, useEffect, useCallback, useMemo } from 'react';
import { shippingService, DEFAULT_SHIPPING_PROVIDERS } from '../services/shippingService.js';
import { calculateShippingFee, calculateEstimatedDeliveryDate } from '../utils/shippingQuote.js';

/**
 * Hook tính toán báo giá vận chuyển trực tiếp 0ms, không phụ thuộc API mạng.
 * @param {Object} params - { addressId, city, subTotal }
 * @returns {{ providers: Array, quotes: Object, isLoading: boolean, error: Error|null, refresh: Function }}
 */
export function useShippingQuotes({ city, subTotal } = {}) {
  const [providers, setProviders] = useState(DEFAULT_SHIPPING_PROVIDERS);

  // 1. Tải danh sách đơn vị vận chuyển ngầm nếu backend có thay đổi
  useEffect(() => {
    let isMounted = true;
    shippingService.getShippingProviders().then((res) => {
      if (isMounted && Array.isArray(res) && res.length > 0) {
        setProviders(res);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Tính toán báo giá tức thì (0ms) trên client cho tất cả đơn vị vận chuyển
  const quotes = useMemo(() => {
    const quotesMap = {};
    for (const p of providers) {
      const code = (p.code || 'GHN').toUpperCase();
      const fee = calculateShippingFee(code, city, subTotal);
      const est = calculateEstimatedDeliveryDate(code, city);
      quotesMap[code] = {
        providerCode: code,
        shippingFee: fee,
        estimatedDeliveryDate: est.estimatedDeliveryDate,
        formattedDeliveryDate: est.formattedDeliveryDate,
        source: 'client',
      };
    }
    return quotesMap;
  }, [providers, city, subTotal]);

  const refresh = useCallback(() => {
    shippingService.invalidateShippingCache();
  }, []);

  return {
    providers,
    quotes,
    isLoading: false,
    error: null,
    refresh,
  };
}

export default useShippingQuotes;
