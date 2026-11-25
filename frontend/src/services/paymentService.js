import axiosClient from '../api/axiosClient.js';

export const paymentService = {
  /**
   * Tạo yêu cầu thanh toán (VNPay / COD)
   * POST /api/payments/create
   */
  async createPayment({ orderId, method = 'BANK_TRANSFER', bankCode = '' }) {
    const response = await axiosClient.post('/payments/create', {
      orderId: Number(orderId),
      method: method === 'VNPAY' ? 'BANK_TRANSFER' : method,
      bankCode: bankCode || undefined,
    });
    return response?.data ?? response;
  },

  /**
   * Xác nhận đã hoàn tất thanh toán QR cho đơn hàng
   * POST /api/payments/confirm/{orderId}
   */
  async confirmPayment(orderId) {
    const response = await axiosClient.post(`/payments/confirm/${orderId}`);
    return response?.data ?? response;
  },

  /**
   * Xác thực kết quả trả về từ cổng VNPay Sandbox (kiểm tra chữ ký vnp_SecureHash & cập nhật trạng thái)
   * GET /api/payments/webhook
   */
  async verifyVnPayReturn(vnpParams = {}) {
    const response = await axiosClient.get('/payments/webhook', {
      params: vnpParams,
    });
    return response?.data ?? response;
  },

  /**
   * Lấy thông tin thanh toán theo mã đơn hàng
   * GET /api/payments/order/{orderId}
   */
  async getPaymentByOrderId(orderId) {
    const response = await axiosClient.get(`/payments/order/${orderId}`);
    return response?.data ?? response;
  },

  /**
   * Lấy thông tin thanh toán theo Payment ID
   * GET /api/payments/{id}
   */
  async getPaymentById(id) {
    const response = await axiosClient.get(`/payments/${id}`);
    return response?.data ?? response;
  },
};

export default paymentService;
