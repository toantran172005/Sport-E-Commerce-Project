import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';

/**
 * Dùng cho mọi thao tác bắt buộc đăng nhập.
 *
 *   const requireLogin = useRequireLogin();
 *   if (!requireLogin('Vui lòng đăng nhập để thêm vào giỏ hàng')) return;
 *
 * - Đã đăng nhập: trả true, thao tác chạy tiếp.
 * - Là khách: hiện hộp thoại hỏi. Người dùng đồng ý → chuyển sang /login (đăng nhập xong quay lại
 *   `redirect`, mặc định là trang hiện tại). Không đồng ý → đóng hộp thoại, ở nguyên trang hiện tại.
 */
export function useRequireLogin() {
  const { user } = useAuth();
  const { openModal } = useUI();
  const { pathname, search } = useLocation();

  return useCallback(
    (message, { redirect, onCancel } = {}) => {
      if (user) return true;
      openModal('login_required_modal', {
        message,
        redirect: redirect ?? `${pathname}${search}`,
        onCancel,
      });
      return false;
    },
    [user, openModal, pathname, search]
  );
}

export default useRequireLogin;
