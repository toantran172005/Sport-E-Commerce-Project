import { useState, useEffect, useCallback, useRef } from 'react';
import { shippingService } from '../services/shippingService.js';

/**
 * Hook tính toán báo giá vận chuyển có debounce, caching và chống out-of-order race conditions.
 * @param {Object} params - { addressId, city, subTotal }
 * @returns {{ providers: Array, quotes: Object, isLoading: boolean, error: Error|null, refresh: Function }}
 */
export function useShippingQuotes({ addressId, city, subTotal } = {}) {
  const [providers, setProviders] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const requestIdRef = useRef(0);

  // 1. Tải danh sách đơn vị vận chuyển (đã được cache 1h)
  useEffect(() => {
    let isMounted = true;
    shippingService.getShippingProviders().then((res) => {
      if (isMounted) {
        setProviders(res || []);
      }
    }).catch((err) => {
      if (isMounted) {
        console.warn('Không thể tải danh sách đơn vị vận chuyển:', err);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Tải báo giá song song cho từng đơn vị có debounce 250ms
  useEffect(() => {
    if (!providers || providers.length === 0) return;

    const currentRequestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const quoteResults = await Promise.all(
          providers.map(async (p) => {
            const code = (p.code || 'GHN').toUpperCase();
            const quote = await shippingService.calculateShipping({
              providerCode: code,
              addressId,
              city,
              subTotal,
            });
            return [code, quote];
          })
        );

        if (currentRequestId === requestIdRef.current) {
          const quotesMap = Object.fromEntries(quoteResults);
          setQuotes(quotesMap);
          setIsLoading(false);
        }
      } catch (err) {
        if (currentRequestId === requestIdRef.current) {
          setError(err);
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [providers, addressId, city, subTotal, refreshIndex]);

  const refresh = useCallback(() => {
    shippingService.invalidateShippingCache();
    setRefreshIndex((prev) => prev + 1);
  }, []);

  return {
    providers,
    quotes,
    isLoading,
    error,
    refresh,
  };
}

export default useShippingQuotes;
