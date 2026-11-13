/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Phiên đăng nhập thật: mặc định là khách (null) cho tới khi đăng nhập qua backend.
  const [user, setUser] = usePersistentState('sport_user', null);

  // Khi mở app: đồng bộ phiên với backend (GET /users/me).
  // Không có token → coi như khách. Token hết hạn → axiosClient tự refresh hoặc đá về /login.
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setUser(null);
      return undefined;
    }
    let cancelled = false;
    authService
      .getCurrentUser()
      .then((fresh) => {
        if (!cancelled) setUser(fresh);
      })
      .catch(() => {
        // 401 đã được axiosClient xử lý (xóa phiên + chuyển /login); lỗi mạng thì giữ user đang lưu
      });
    return () => {
      cancelled = true;
    };
  }, [setUser]);

  // Đăng xuất/đăng nhập ở tab khác → tab này cập nhật theo, tránh dùng nhầm phiên cũ.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token' && !e.newValue) setUser(null);
      if (e.key === 'sport_user') {
        try {
          const next = e.newValue ? JSON.parse(e.newValue) : null;
          setUser((prev) => ((prev?.id ?? null) === (next?.id ?? null) ? prev : next));
        } catch {
          // bỏ qua dữ liệu hỏng
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [setUser]);

  const isAdmin = Boolean(user && user.role === 'ADMIN');
  const isStaff = Boolean(user && user.role === 'STAFF');
  const isCustomer = Boolean(user && user.role === 'CUSTOMER');
  const isGuest = !user;

  const value = useMemo(
    () => ({
      user,
      setUser,
      isAdmin,
      isStaff,
      isCustomer,
      isGuest,
      isAuthenticated: Boolean(user),
    }),
    [user, setUser, isAdmin, isStaff, isCustomer, isGuest]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return ctx;
}
