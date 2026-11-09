/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useCallback } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { users as mockUsers } from '../mocks/users.js';
import { hasPermission, isBackOfficeRole, ROLES } from '../utils/permissions.js';
import { invalidateShippingCache } from '../services/shippingService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [rawUser, setRawUser] = usePersistentState('sport_user', () => mockUsers[0]);

  // Sanitize persisted user: xử lý role cũ/không hợp lệ và gán status mặc định là ACTIVE
  const user = useMemo(() => {
    if (!rawUser) return null;
    const validRoles = [ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER];
    const safeRole = validRoles.includes(rawUser.role) ? rawUser.role : 'UNKNOWN';
    return {
      ...rawUser,
      role: safeRole,
      status: rawUser.status || 'ACTIVE',
    };
  }, [rawUser]);

  const setUser = useCallback(
    (nextUser) => {
      setRawUser(nextUser);
      if (!nextUser) {
        invalidateShippingCache();
      }
    },
    [setRawUser]
  );

  const isAdmin = Boolean(user && user.role === ROLES.ADMIN);
  const isStaff = Boolean(user && user.role === ROLES.STAFF);
  const isBackOffice = Boolean(user && isBackOfficeRole(user.role));
  const isCustomer = Boolean(user && user.role === ROLES.CUSTOMER);
  const isGuest = !user;

  const can = useCallback(
    (permission) => {
      if (!user) return false;
      return hasPermission(user.role, permission);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      setUser,
      isAdmin,
      isStaff,
      isBackOffice,
      isCustomer,
      isGuest,
      can,
      isAuthenticated: Boolean(user),
    }),
    [user, setUser, isAdmin, isStaff, isBackOffice, isCustomer, isGuest, can]
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
