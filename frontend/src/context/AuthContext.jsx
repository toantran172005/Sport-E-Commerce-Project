/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { users as mockUsers } from '../mocks/users.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = usePersistentState('sport_user', () => mockUsers[0]);

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
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
