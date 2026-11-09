/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { userAddresses as mockAddresses } from '../mocks/userAddresses.js';
import { useAuth } from './AuthContext.jsx';
import { useUI } from './UIContext.jsx';
import { invalidateShippingCache } from '../services/shippingService.js';

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
    return sanitizeAddresses(mockAddresses);
  });

  // Tự động khôi phục nếu localStorage bị rỗng hoặc không có địa chỉ
  useEffect(() => {
    if (!addresses || addresses.length === 0) {
      setAddresses(sanitizeAddresses(mockAddresses));
    }
  }, [addresses, setAddresses]);

  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    const defaultAddr = mockAddresses.find((a) => a.isDefault);
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
          userId: user?.id || 4,
          country: 'Vietnam',
          type: 'SHIPPING',
        };
        const base = shouldBeDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
        if (shouldBeDefault) {
          setSelectedAddressId(id);
        }
        return sanitizeAddresses([...base, { ...created, isDefault: shouldBeDefault }]);
      });
      invalidateShippingCache();
      showToast('Đã thêm địa chỉ nhận hàng mới');
    },
    [setAddresses, showToast, user?.id]
  );

  const updateAddress = useCallback(
    (id, updatedFields) => {
      setAddresses((prev) => {
        const updated = prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a));
        return sanitizeAddresses(updated);
      });
      invalidateShippingCache();
      showToast('Đã cập nhật địa chỉ');
    },
    [setAddresses, showToast]
  );

  const deleteAddress = useCallback(
    (id) => {
      setAddresses((prev) => {
        const filtered = prev.filter((a) => a.id !== id);
        return sanitizeAddresses(filtered);
      });
      invalidateShippingCache();
      showToast('Đã xóa địa chỉ');
    },
    [setAddresses, showToast]
  );

  const setDefaultAddress = useCallback(
    (id) => {
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
      setSelectedAddressId(id);
      invalidateShippingCache();
      showToast('Đã thiết lập làm địa chỉ mặc định');
    },
    [setAddresses, showToast]
  );

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) || addresses[0] || mockAddresses[0],
    [addresses, selectedAddressId]
  );

  const value = useMemo(
    () => ({
      addresses: addresses && addresses.length > 0 ? addresses : mockAddresses,
      setAddresses,
      selectedAddressId,
      setSelectedAddressId,
      selectedAddress,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
    }),
    [
      addresses,
      setAddresses,
      selectedAddressId,
      selectedAddress,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
    ]
  );

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}

export function useAddress() {
  const ctx = useContext(AddressContext);
  if (!ctx) {
    throw new Error('useAddress phải được sử dụng bên trong AddressProvider');
  }
  return ctx;
}
