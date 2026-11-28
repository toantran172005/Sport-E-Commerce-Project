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

  /**
   * Mở kênh SSE GET /api/notifications/stream (EventSource không gửi được header Authorization nên dùng fetch + đọc stream).
   * Chạy tới khi bị đóng/ngắt; gọi onEvent(tenSuKien) mỗi khi server báo (vd "notification"). Ném lỗi (có .status) khi lỗi kết nối.
   */
  async openStream({ signal, onEvent }) {
    const token = localStorage.getItem('token');
    const base = axiosClient.defaults.baseURL || '/api';
    const res = await fetch(`${base}/notifications/stream`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
      signal,
    });
    if (!res.ok || !res.body) {
      const err = new Error(`SSE ${res.status}`);
      err.status = res.status;
      throw err;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return;
      buffer += decoder.decode(value, { stream: true });
      let sep;
      while ((sep = buffer.search(/\r?\n\r?\n/)) !== -1) {
        const rawEvent = buffer.slice(0, sep);
        buffer = buffer.slice(sep).replace(/^\r?\n\r?\n/, '');
        const nameLine = rawEvent.split(/\r?\n/).find((l) => l.startsWith('event:'));
        if (nameLine) onEvent(nameLine.slice(6).trim());
      }
    }
  },

  /** PATCH /api/notifications/read-all */
  async markAllAsRead() {
    await axiosClient.patch('/notifications/read-all');
    return { success: true };
  },
};

export default notificationService;
