/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { authService } from '../services/authService.js';
import { hasPermission, isBackOfficeRole, ROLES } from '../utils/permissions.js';
import { invalidateShippingCache } from '../services/shippingService.js';
import { getCookie } from '../utils/cookie.js';
import { cleanMultiUserStorage } from '../utils/storageCleanup.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = usePersistentState('sport_user', null);

  useEffect(() => {
    cleanMultiUserStorage(user?.id ?? null);
  }, [user]);

  const setUser = useCallback(
    (nextUser) => {
      setUserState(nextUser);
      if (!nextUser) invalidateShippingCache();
    },
    [setUserState]
  );

  useEffect(() => {
    const token = getCookie('token') || localStorage.getItem('token');
    if (!token) {
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
      });
    return () => {
      cancelled = true;
    };
  }, [setUser]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token' && !e.newValue) setUser(null);
      if (e.key === 'sport_user') {
        try {
          const next = e.newValue ? JSON.parse(e.newValue) : null;
          setUser((prev) => ((prev?.id ?? null) === (next?.id ?? null) ? prev : next));
        } catch {
      /* ignore */
    }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [setUser]);

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
