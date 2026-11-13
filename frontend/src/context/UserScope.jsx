import { Fragment } from 'react';
import { useAuth } from './AuthContext.jsx';

/**
 * Mount lại toàn bộ provider bên dưới mỗi khi người dùng đăng nhập/đăng xuất/đổi tài khoản,
 * để state trong bộ nhớ (giỏ hàng, yêu thích, đơn hàng, địa chỉ...) luôn thuộc đúng một user.
 */
export function UserScope({ children }) {
  const { user } = useAuth();
  return <Fragment key={user?.id ?? 'guest'}>{children}</Fragment>;
}

export default UserScope;
