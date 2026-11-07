const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const fakeDelay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const paymentService = {
  /**
   * Tạo yêu cầu thanh toán (VNPay / COD)
   * POST /api/payments/create
   */
  async createPayment({ orderId, method = 'BANK_TRANSFER', bankCode = '' }) {
    if (USE_MOCK) {
      await fakeDelay(350);
      const isBank = method === 'BANK_TRANSFER' || method === 'VNPAY';
      const paymentUrl = isBank
        ? `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=ORD-${orderId}&vnp_Amount=1000000`
        : null;

      return {
        paymentId: Date.now(),
        orderId,
        orderCode: `ORD-${orderId}`,
        method: isBank ? 'BANK_TRANSFER' : 'COD',
        status: 'PENDING',
        paymentUrl,
        message: isBank
          ? 'Tạo yêu cầu thanh toán VNPay thành công. Vui lòng hoàn tất giao dịch.'
          : 'Đặt hàng thành công với hình thức thanh toán khi nhận hàng (COD).',
      };
    }

    const { default: axiosClient } = await import('../api/axiosClient.js');
    const response = await axiosClient.post('/payments/create', {
      orderId,
      method,
      bankCode: bankCode || undefined,
    });
    return response.data || response;
  },

  /**
   * Lấy thông tin thanh toán theo mã đơn hàng
   * GET /api/payments/order/{orderId}
   */
  async getPaymentByOrderId(orderId) {
    if (USE_MOCK) {
      await fakeDelay(150);
      return {
        paymentId: 1,
        orderId,
        orderCode: `ORD-${orderId}`,
        amount: 1265000,
        method: 'BANK_TRANSFER',
        status: 'PAID',
        transactionCode: 'TXN-9999',
        paidAt: new Date().toISOString(),
      };
    }

    const { default: axiosClient } = await import('../api/axiosClient.js');
    const response = await axiosClient.get(`/payments/order/${orderId}`);
    return response.data || response;
  },

  /**
   * Lấy thông tin thanh toán theo Payment ID
   * GET /api/payments/{id}
   */
  async getPaymentById(id) {
    if (USE_MOCK) {
      await fakeDelay(150);
      return {
        paymentId: id,
        method: 'BANK_TRANSFER',
        status: 'PAID',
      };
    }

    const { default: axiosClient } = await import('../api/axiosClient.js');
    const response = await axiosClient.get(`/payments/${id}`);
    return response.data || response;
  },
};

export default paymentService;
