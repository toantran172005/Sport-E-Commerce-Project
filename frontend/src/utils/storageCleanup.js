/**
 * Tiện ích dọn dẹp các khóa localStorage rác/mock cũ
 * Đảm bảo dữ liệu đơn hàng, giỏ hàng, địa chỉ luôn được tải thật từ database backend qua API REST.
 */
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
]);

export function purgeDeprecatedStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    DEPRECATED_KEYS.forEach((k) => {
      try {
        window.localStorage.removeItem(k);
      } catch {
        // ignore per-key failure
      }
    });
  } catch (e) {
    console.warn('[storage] purge failed:', e);
  }
}
