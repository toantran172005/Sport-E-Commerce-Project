/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { notifications as mockNotifications } from '../mocks/notifications.js';
import { useUI } from './UIContext.jsx';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { showToast } = useUI();
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('Đã đánh dấu đọc tất cả thông báo');
  }, [showToast]);

  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      setNotifications,
      markAllNotificationsRead,
      markNotificationAsRead,
    }),
    [notifications, markAllNotificationsRead, markNotificationAsRead]
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
