/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { userService } from '../services/userService.js';
import { useAuth } from './AuthContext.jsx';
import { invalidateShippingCache } from '../services/shippingService.js';
import { useUI } from './UIContext.jsx';

const AddressContext = createContext(null);

// Sổ địa chỉ cũ (mock) từng lưu ở localStorage → bỏ đi để không lẫn với dữ liệu thật
const LEGACY_STORAGE_KEY = 'sport_user_addresses';

export function AddressProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useUI();
  const userId = user?.id;
  // Đang bị khóa đổi mật khẩu → backend từ chối mọi API khác
  const locked = Boolean(user?.mustChangePassword);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // bỏ qua
    }
  }, []);

  /** Tải sổ địa chỉ từ GET /api/users/me/addresses, giữ lại lựa chọn hiện tại nếu còn tồn tại. */
  const loadAddresses = useCallback(async (preferId) => {
    setLoading(true);
    try {
      const list = await userService.getMyAddresses();
      setAddresses(list);
      setSelectedAddressId((prev) => {
        const wanted = preferId ?? prev;
        if (wanted != null && list.some((a) => a.id === wanted)) return wanted;
        return (list.find((a) => a.isDefault) || list[0])?.id ?? null;
      });
      return list;
    } catch {
      // lỗi mạng/401 đã được axiosClient xử lý; giữ nguyên danh sách hiện tại
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải khi đăng nhập, xóa sạch khi đăng xuất (không để địa chỉ của user trước lộ sang user sau)
  useEffect(() => {
    if (!userId || locked) {
      setAddresses([]);
      setSelectedAddressId(null);
      return;
    }
    loadAddresses();
  }, [userId, locked, loadAddresses]);

  /** Thêm địa chỉ (POST). Ném lỗi để nơi gọi hiển thị thông báo cụ thể từ backend. */
  const addAddress = useCallback(
    async (payload) => {
      const created = await userService.addAddress(payload);
      if (created) {
        setAddresses((prev) => {
          if (created.isDefault) {
            return [...prev.map((a) => ({ ...a, isDefault: false })), created];
          }
          return [...prev, created];
        });
        setSelectedAddressId(created.id);
      }
      invalidateShippingCache();
      showToast('Đã thêm địa chỉ nhận hàng mới', 'success');
      return created;
    },
    [showToast]
  );

  const updateAddress = useCallback(
    async (id, payload) => {
      const updated = await userService.updateAddress(id, payload);
      setAddresses((prev) =>
        prev.map((a) => {
          if (a.id === id) return updated;
          if (payload?.isDefault && a.id !== id) return { ...a, isDefault: false };
          return a;
        })
      );
      invalidateShippingCache();
      showToast('Đã cập nhật địa chỉ nhận hàng', 'success');
      return updated;
    },
    [showToast]
  );

  const deleteAddress = useCallback(
    async (id) => {
      let rollbackList;
      setAddresses((prev) => {
        rollbackList = prev;
        return prev.filter((a) => a.id !== id);
      });
      setSelectedAddressId((prev) => (prev === id ? null : prev));
      try {
        await userService.deleteAddress(id);
        invalidateShippingCache();
        showToast('Đã xóa địa chỉ nhận hàng', 'success');
      } catch (err) {
        if (rollbackList) setAddresses(rollbackList);
        showToast(err.message || 'Không thể xóa địa chỉ', 'error');
        throw err;
      }
    },
    [showToast]
  );

  const setDefaultAddress = useCallback(
    async (id) => {
      let rollbackList;
      setAddresses((prev) => {
        rollbackList = prev;
        return prev.map((a) => ({ ...a, isDefault: a.id === id }));
      });
      setSelectedAddressId(id);
      try {
        await userService.setDefaultAddress(id);
        invalidateShippingCache();
        showToast('Đã thiết lập làm địa chỉ mặc định', 'success');
      } catch (err) {
        if (rollbackList) setAddresses(rollbackList);
        showToast(err.message || 'Không thể đặt địa chỉ mặc định', 'error');
      }
    },
    [showToast]
  );

  const selectedAddress = useMemo(
    () =>
      addresses.find((a) => a.id === selectedAddressId) ||
      addresses.find((a) => a.isDefault) ||
      addresses[0] ||
      null,
    [addresses, selectedAddressId]
  );

  const value = useMemo(
    () => ({
      addresses,
      loading,
      setAddresses,
      selectedAddressId,
      setSelectedAddressId,
      selectedAddress,
      loadAddresses,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
    }),
    [
      addresses,
      loading,
      selectedAddressId,
      selectedAddress,
      loadAddresses,
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
