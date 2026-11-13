import { useAuth } from '../context/AuthContext.jsx';

/**
 * Khóa localStorage theo từng người dùng: "sport_cart" → "sport_cart:12" (user id) hoặc "sport_cart:guest".
 * Nhờ vậy giỏ hàng/yêu thích/đơn hàng lưu cục bộ không bị lẫn giữa các tài khoản dùng chung một trình duyệt.
 */
export function useScopedKey(baseKey) {
  const { user } = useAuth();
  return `${baseKey}:${user?.id ?? 'guest'}`;
}
