import axiosClient from '../api/axiosClient.js';

export const notificationService = {
  /** GET /api/notifications?page&size → backend trả PageResponse, hàm này trả mảng content (mới nhất trước) */
  async getNotifications({ page = 0, size = 30 } = {}) {
    const data = await axiosClient.get('/notifications', { params: { page, size } });
    return data?.content ?? [];
  },

  /** GET /api/notifications/unread-count */
  async getUnreadCount() {
    return axiosClient.get('/notifications/unread-count');
  },

  /** PATCH /api/notifications/{id}/read */
  async markAsRead(id) {
    await axiosClient.patch(`/notifications/${id}/read`);
    return { success: true };
  },

  /** PATCH /api/notifications/read-all */
  async markAllAsRead() {
    await axiosClient.patch('/notifications/read-all');
    return { success: true };
  },
};

export default notificationService;
