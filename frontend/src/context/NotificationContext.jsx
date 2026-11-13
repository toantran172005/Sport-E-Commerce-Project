/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { notificationService } from '../services/notificationService.js';
import { useAuth } from './AuthContext.jsx';
import { useUI } from './UIContext.jsx';

const NotificationContext = createContext(null);

// Chuông thông báo tự cập nhật mỗi 30 giây (backend chưa có WebSocket/SSE)
const POLL_INTERVAL_MS = 30000;

export function NotificationProvider({ children }) {
  const { showToast } = useUI();
  const { user } = useAuth();
  const userId = user?.id;
  // Đang bị khóa đổi mật khẩu → backend từ chối mọi API khác, nên chưa tải thông báo
  const locked = Boolean(user?.mustChangePassword);

  const [notifications, setNotifications] = useState([]);

  const refreshNotifications = useCallback(async () => {
    try {
      const list = await notificationService.getNotifications();
      setNotifications(list);
    } catch {
      // lỗi mạng/401 đã được axiosClient xử lý; giữ nguyên danh sách hiện tại
    }
  }, []);

  // Tải khi đăng nhập, xóa khi đăng xuất, và làm mới định kỳ
  useEffect(() => {
    if (!userId || locked) {
      setNotifications([]);
      return undefined;
    }
    refreshNotifications();
    const timer = setInterval(refreshNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [userId, locked, refreshNotifications]);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      showToast(err.message || 'Không thể đánh dấu đã đọc', 'error');
      refreshNotifications();
      return;
    }
    showToast('Đã đánh dấu đọc tất cả thông báo', 'success');
  }, [showToast, refreshNotifications]);

  const markNotificationAsRead = useCallback(
    async (notificationId) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      try {
        await notificationService.markAsRead(notificationId);
      } catch {
        refreshNotifications();
      }
    },
    [refreshNotifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      setNotifications,
      refreshNotifications,
      markAllNotificationsRead,
      markNotificationAsRead,
    }),
    [notifications, refreshNotifications, markAllNotificationsRead, markNotificationAsRead]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification phải được sử dụng bên trong NotificationProvider');
  }
  return ctx;
}
