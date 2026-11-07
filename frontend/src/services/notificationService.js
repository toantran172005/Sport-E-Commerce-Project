import { notifications as initialNotifications } from '../mocks/notifications.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const fakeDelay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

let mockNotifications = [...initialNotifications];

export const notificationService = {
  async getNotifications(userId) {
    if (USE_MOCK) {
      await fakeDelay();
      return [...mockNotifications];
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get('/notifications', { params: { userId } });
  },

  async markAsRead(id) {
    if (USE_MOCK) {
      await fakeDelay(100);
      const notif = mockNotifications.find((n) => n.id === id);
      if (notif) notif.isRead = true;
      return { success: true };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.put(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    if (USE_MOCK) {
      await fakeDelay(100);
      mockNotifications.forEach((n) => (n.isRead = true));
      return { success: true };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.put('/notifications/read-all');
  },
};

export default notificationService;
