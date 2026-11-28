import axiosClient from '../api/axiosClient.js';

export const refundService = {
  /**
   * Khoản cần hoàn tiền (đơn đã thu tiền rồi bị hủy / trả hàng).
   * GET /api/admin/refunds?refunded=false|true (ADMIN/STAFF)
   */
  async getRefunds(refunded = false) {
    const list = await axiosClient.get('/admin/refunds', { params: { refunded } });
    return Array.isArray(list) ? list : [];
  },

  /** PATCH /api/admin/refunds/{paymentId}/refunded: nhân viên xác nhận đã hoàn tiền cho khách */
  async markRefunded(paymentId, note) {
    return axiosClient.patch(`/admin/refunds/${paymentId}/refunded`, { note: note || undefined });
  },
};

export default refundService;
