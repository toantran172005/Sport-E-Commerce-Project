/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useUI } from './UIContext.jsx';
import { users as mockUsers } from '../mocks/users.js';

const CustomerContext = createContext(null);

export function CustomerProvider({ children }) {
  const { showToast } = useUI();
  const [customers, setCustomers] = useState(mockUsers);

  const toggleCustomerStatus = useCallback((customerId) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, status: c.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' } : c))
    );
    showToast('Đã cập nhật trạng thái tài khoản');
  }, [showToast]);

  const value = useMemo(
    () => ({
      customers,
      setCustomers,
      toggleCustomerStatus,
    }),
    [customers, toggleCustomerStatus]
  );

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) {
    throw new Error('useCustomer phải được sử dụng bên trong CustomerProvider');
  }
  return ctx;
}
