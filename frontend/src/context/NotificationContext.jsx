/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { notificationService } from '../services/notificationService.js';
import { useAuth } from './AuthContext.jsx';
import { useUI } from './UIContext.jsx';
import { emitLiveRefresh } from '../utils/liveRefresh.js';

const NotificationContext = createContext(null);

// Thông báo được đẩy tức thì qua SSE; polling chỉ còn là lưới an toàn khi kênh SSE bị đứt (proxy/mạng)
const POLL_INTERVAL_MS = 120000;
const RECONNECT_BASE_MS = 2000;
const RECONNECT_MAX_MS = 30000;

export function NotificationProvider({ children }) {
  const { showToast } = useUI();
  const { user } = useAuth();
  const userId = user?.id;
  const locked = Boolean(user?.mustChangePassword);

  const [notifications, setNotifications] = useState([]);

  const refreshNotifications = useCallback(async () => {
    try {
      const list = await notificationService.getNotifications();
      setNotifications(list);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!userId || locked) {
      setNotifications([]);
      return undefined;
    }
    refreshNotifications();
    // Polling thưa, bỏ qua khi tab đang ẩn
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refreshNotifications();
    }, POLL_INTERVAL_MS);
    // Quay lại tab thì tải ngay
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshNotifications();
    };
    document.addEventListener('visibilitychange', onVisible);

    // Kênh SSE: tự nối lại với backoff; token hết hạn (401) thì gọi 1 API thường để axios tự refresh rồi nối lại
    const controller = new AbortController();
    let cancelled = false;
    (async () => {
      let attempt = 0;
      while (!cancelled) {
        try {
          await notificationService.openStream({
            signal: controller.signal,
            onEvent: (name, data) => {
              attempt = 0;
              if (name === 'notification') refreshNotifications();
              // Dữ liệu nghiệp vụ vừa đổi (vd đơn hàng): báo cho các nơi liên quan tự tải lại
              else if (name === 'refresh') emitLiveRefresh(data);
            },
          });
        } catch (err) {
          if (cancelled || err?.name === 'AbortError') return;
          if (err?.status === 401) {
            try {
              await notificationService.getUnreadCount();
            } catch {
              return; // phiên đã hết hạn hẳn: axiosClient đã đưa về trang đăng nhập
            }
          }
        }
        if (cancelled) return;
        attempt += 1;
        const delay = Math.min(RECONNECT_BASE_MS * 2 ** Math.min(attempt - 1, 4), RECONNECT_MAX_MS);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
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
