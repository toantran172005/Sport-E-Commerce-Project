/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useCallback } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { validateStaffInput } from '../utils/staffRules.js';
import { useUI } from './UIContext.jsx';

const StaffContext = createContext(null);

const getInitialStaff = () => {
  try {
    const raw = localStorage.getItem('sport_staff');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

export function StaffProvider({ children }) {
  const { showToast } = useUI();
  const [staffMembers, setStaffMembers] = usePersistentState('sport_staff', getInitialStaff);

  const addStaff = useCallback(
    async (staffData) => {
      const dataToValidate = {
        ...staffData,
        role: 'STAFF',
      };

      const validation = validateStaffInput(dataToValidate, staffMembers);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        throw new Error(firstError || 'Dữ liệu nhân viên không hợp lệ');
      }

      const now = new Date().toISOString();
      const newStaff = {
        id: Date.now(),
        fullName: staffData.fullName.trim(),
        email: staffData.email.trim().toLowerCase(),
        phoneNumber: staffData.phoneNumber.trim(),
        avatarUrl:
          staffData.avatarUrl ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop',
        gender: staffData.gender || 'MALE',
        dateOfBirth: staffData.dateOfBirth || '1995-01-01',
        role: 'STAFF', // Luôn cố định STAFF
        status: staffData.status || 'ACTIVE',
        createdAt: now,
        lastLoginAt: null,
      };

      setStaffMembers((prev) => [newStaff, ...prev]);
      showToast(`Đã thêm nhân viên ${newStaff.fullName}`);
      return newStaff;
    },
    [staffMembers, setStaffMembers, showToast]
  );

  const updateStaff = useCallback(
    async (id, updateData) => {
      const existing = staffMembers.find((s) => s.id === Number(id));
      if (!existing) {
        throw new Error('Không tìm thấy nhân viên cần cập nhật');
      }

      const mergedData = {
        ...existing,
        ...updateData,
        id: Number(id),
        role: 'STAFF',
      };

      const validation = validateStaffInput(mergedData, staffMembers);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        throw new Error(firstError || 'Dữ liệu cập nhật không hợp lệ');
      }

      const updatedStaff = {
        ...existing,
        fullName: mergedData.fullName.trim(),
        email: mergedData.email.trim().toLowerCase(),
        phoneNumber: mergedData.phoneNumber.trim(),
        avatarUrl: mergedData.avatarUrl || existing.avatarUrl,
        gender: mergedData.gender || existing.gender,
        dateOfBirth: mergedData.dateOfBirth || existing.dateOfBirth,
        role: 'STAFF',
        status: mergedData.status || existing.status,
      };

      setStaffMembers((prev) =>
        prev.map((s) => (s.id === Number(id) ? updatedStaff : s))
      );
      showToast(`Đã cập nhật thông tin nhân viên ${updatedStaff.fullName}`);
      return updatedStaff;
    },
    [staffMembers, setStaffMembers, showToast]
  );

  const setStaffStatus = useCallback(
    async (id, nextStatus) => {
      const existing = staffMembers.find((s) => s.id === Number(id));
      if (!existing) {
        throw new Error('Không tìm thấy nhân viên');
      }

      const updatedStaff = {
        ...existing,
        status: nextStatus,
      };

      setStaffMembers((prev) =>
        prev.map((s) => (s.id === Number(id) ? updatedStaff : s))
      );
      showToast(
        nextStatus === 'ACTIVE'
          ? `Đã mở khóa tài khoản nhân viên ${existing.fullName}`
          : `Đã khóa tài khoản nhân viên ${existing.fullName}`
      );
      return updatedStaff;
    },
    [staffMembers, setStaffMembers, showToast]
  );

  const removeStaff = useCallback(
    async (id) => {
      const existing = staffMembers.find((s) => s.id === Number(id));
      if (!existing) {
        throw new Error('Không tìm thấy nhân viên cần xóa');
      }

      setStaffMembers((prev) => prev.filter((s) => s.id !== Number(id)));
      showToast(`Đã xóa nhân viên ${existing.fullName}`);
      return existing;
    },
    [staffMembers, setStaffMembers, showToast]
  );

  const value = useMemo(
    () => ({
      staffMembers,
      addStaff,
      updateStaff,
      setStaffStatus,
      removeStaff,
    }),
    [staffMembers, addStaff, updateStaff, setStaffStatus, removeStaff]
  );

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
}

export function useStaff() {
  const ctx = useContext(StaffContext);
  if (!ctx) {
    throw new Error('useStaff phải được sử dụng bên trong StaffProvider');
  }
  return ctx;
}
