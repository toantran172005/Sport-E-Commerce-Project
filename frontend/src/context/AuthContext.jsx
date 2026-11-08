/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { users as mockUsers } from '../mocks/users.js';
import { authService } from '../services/authService.js';
import { USE_MOCK } from '../config/env.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Mock: mặc định đăng nhập sẵn user mẫu. API thật: mặc định là khách (null) cho tới khi đăng nhập.
  const [user, setUser] = usePersistentState('sport_user', () => (USE_MOCK ? mockUsers[0] : null));

  // API thật: khi mở app, đồng bộ phiên đăng nhập với backend (GET /users/me).
  // Không có token → coi như khách. Token hết hạn → axiosClient tự refresh hoặc đá về /login.
  useEffect(() => {
    if (USE_MOCK) return undefined;
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
        // 401 đã được axiosClient xử lý (xóa phiên + chuyển /login)
      });
    return () => {
      cancelled = true;
    };
  }, [setUser]);

  const isAdmin = Boolean(user && user.role === 'ADMIN');
  const isCustomer = Boolean(user && user.role === 'CUSTOMER');
  const isGuest = !user;

  const value = useMemo(
    () => ({
      user,
      setUser,
      isAdmin,
      isCustomer,
      isGuest,
      isAuthenticated: Boolean(user),
    }),
    [user, setUser, isAdmin, isCustomer, isGuest]
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
