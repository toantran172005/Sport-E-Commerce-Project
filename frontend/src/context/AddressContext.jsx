/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { userAddresses as mockAddresses } from '../mocks/userAddresses.js';
import { useAuth } from './AuthContext.jsx';
import { useUI } from './UIContext.jsx';

const AddressContext = createContext(null);

const sanitizeAddresses = (list) => {
  if (!Array.isArray(list) || list.length === 0) return [];
  let defaultIndex = list.findIndex((a) => a.isDefault);
  if (defaultIndex === -1) defaultIndex = 0;
  return list.map((a, idx) => ({ ...a, isDefault: idx === defaultIndex }));
};

export function AddressProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useUI();

  const [addresses, setAddresses] = usePersistentState('sport_user_addresses', () => {
    const userAddrs = mockAddresses.filter((a) => a.userId === 1);
    return sanitizeAddresses(userAddrs);
  });

  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    const defaultAddr = mockAddresses.find((a) => a.userId === 1 && a.isDefault);
    return defaultAddr?.id || 1;
  });

  const addAddress = useCallback(
    (newAddr) => {
      const id = Date.now();
      setAddresses((prev) => {
        const shouldBeDefault = Boolean(newAddr.isDefault) || prev.length === 0;
        const created = {
          ...newAddr,
          id,
          userId: user?.id || 1,
          country: 'Vietnam',
          type: 'SHIPPING',
          isDefault: shouldBeDefault,
        };
        const base = shouldBeDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
        if (shouldBeDefault) {
          setSelectedAddressId(id);
        }
        return sanitizeAddresses([...base, created]);
      });
      showToast('Đã thêm địa chỉ nhận hàng mới');
    },
    [setAddresses, showToast, user?.id]
  );

  const setDefaultAddress = useCallback(
    (id) => {
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
      setSelectedAddressId(id);
      showToast('Đã thiết lập làm địa chỉ mặc định');
    },
    [setAddresses, showToast]
  );

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) || addresses[0],
    [addresses, selectedAddressId]
  );

  const value = useMemo(
    () => ({
      addresses,
      setAddresses,
      selectedAddressId,
      setSelectedAddressId,
      selectedAddress,
      addAddress,
      setDefaultAddress,
    }),
    [addresses, setAddresses, selectedAddressId, selectedAddress, addAddress, setDefaultAddress]
  );

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}

export function useAddress() {
  const ctx = useContext(AddressContext);
  if (!ctx) {
    throw new Error('useAddress must be used within AddressProvider');
  }
  return ctx;
}
