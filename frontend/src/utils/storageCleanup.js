export const DEPRECATED_KEYS = Object.freeze([
  'sport_orders',
  'sport_cart_mock',
  'mock_orders',
  'mock_cart',
  'orders_cache',
  'cart_cache',
  'sport_cart',
  'sport_selected_cart',
  'sport_wishlist',
  'sport_user_addresses',
  'sport_staff',
  'isLogin',
]);

export function purgeDeprecatedStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    DEPRECATED_KEYS.forEach((k) => {
      try {
        window.localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    });
  } catch (e) {
    console.warn('[storage] purge failed:', e);
  }
}

export function cleanMultiUserStorage(currentUserId = null) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    purgeDeprecatedStorage();

    const allowedSuffix = currentUserId ? String(currentUserId) : null;
    const prefixPatterns = ['sport_cart:', 'sport_selected_cart:', 'sport_wishlist:'];
    const keysToRemove = [];

    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key) continue;

      for (const prefix of prefixPatterns) {
        if (key.startsWith(prefix)) {
          const suffix = key.slice(prefix.length);
          if (allowedSuffix) {
            if (suffix !== allowedSuffix && suffix !== 'guest') {
              keysToRemove.push(key);
            }
          } else {
            if (suffix !== 'guest') {
              keysToRemove.push(key);
            }
          }
          break;
        }
      }
    }

    keysToRemove.forEach((k) => {
      try {
        window.localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    });
  } catch (err) {
    console.warn('[storage] cleanMultiUserStorage error:', err);
  }
}
