import axiosClient from '../api/axiosClient.js';
import { notifications as initialNotifications } from '../mocks/notifications.js';
import { USE_MOCK } from '../config/env.js';

const fakeDelay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

let mockNotifications = [...initialNotifications];

export const notificationService = {
  /** GET /api/notifications?page&size → backend trả PageResponse, hàm này trả mảng content (mới nhất trước) */
  async getNotifications({ page = 0, size = 30 } = {}) {
    if (USE_MOCK) {
      await fakeDelay();
      return [...mockNotifications];
    }
    const data = await axiosClient.get('/notifications', { params: { page, size } });
    return data?.content ?? [];
  },

  /** GET /api/notifications/unread-count */
  async getUnreadCount() {
    if (USE_MOCK) {
      await fakeDelay(100);
      return mockNotifications.filter((n) => !n.isRead).length;
    }
    return axiosClient.get('/notifications/unread-count');
  },

  /** PATCH /api/notifications/{id}/read */
  async markAsRead(id) {
    if (USE_MOCK) {
      await fakeDelay(100);
      const notif = mockNotifications.find((n) => n.id === id);
      if (notif) notif.isRead = true;
      return { success: true };
    }
    await axiosClient.patch(`/notifications/${id}/read`);
    return { success: true };
  },

  /** PATCH /api/notifications/read-all */
  async markAllAsRead() {
    if (USE_MOCK) {
      await fakeDelay(100);
      mockNotifications.forEach((n) => (n.isRead = true));
      return { success: true };
    }
    await axiosClient.patch('/notifications/read-all');
    return { success: true };
  },
};

export default notificationService;
