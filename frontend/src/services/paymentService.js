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
   * Thanh toán lại đơn đang chờ thanh toán: backend tạo link VNPay mới (mỗi link sống 15 phút,
   * còn đơn được giữ 24 giờ). Trả về URL cổng VNPay để chuyển hướng.
   */
  async getVnpayPaymentUrl(orderId) {
    const res = await this.createPayment({ orderId, method: 'BANK_TRANSFER', bankCode: 'NCB' });
    const url = res?.paymentUrl || res?.data?.paymentUrl;
    if (!url) {
      throw new Error('Không nhận được liên kết cổng thanh toán VNPay.');
    }
    return url;
  },

  /**
   * Xác nhận thanh toán THỦ CÔNG cho đơn hàng — chỉ STAFF/ADMIN được gọi (backend trả 403 với khách).
   * Thanh toán VNPay được ghi nhận TỰ ĐỘNG khi VNPay trả kết quả (return URL / IPN).
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
