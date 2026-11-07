import { orders as initialOrders } from '../mocks/orders.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const fakeDelay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

let mockOrders = [...initialOrders];

export const orderService = {
  async getOrders(params = {}) {
    if (USE_MOCK) {
      await fakeDelay();
      const { status, page = 0, size = 10, limit } = params;

      let filtered = [...mockOrders];
      if (status && status !== 'ALL') {
        filtered = filtered.filter((o) => o.status === status);
      }

      const totalElements = filtered.length;
      const pageSize = Number(size || limit || 10);
      const totalPages = Math.ceil(totalElements / pageSize) || 1;
      const pageNumber = Math.max(0, Math.min(Number(page ?? 0), Math.max(0, totalPages - 1)));
      const start = pageNumber * pageSize;
      const items = filtered.slice(start, start + pageSize);

      return {
        content: items,
        items,
        number: pageNumber,
        page: pageNumber,
        size: pageSize,
        limit: pageSize,
        totalElements,
        total: totalElements,
        totalPages,
        numberOfElements: items.length,
        first: pageNumber === 0,
        last: pageNumber >= totalPages - 1,
        empty: items.length === 0,
      };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get('/orders', { params });
  },

  async getOrderById(id) {
    if (USE_MOCK) {
      await fakeDelay(250);
      const order = mockOrders.find(
        (o) => String(o.id) === String(id) || o.orderCode === String(id)
      );
      if (!order) throw new Error('Không tìm thấy đơn hàng');
      return order;
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get(`/orders/${id}`);
  },

  async createOrder(orderData) {
    if (USE_MOCK) {
      await fakeDelay();
      const newId = Math.max(...mockOrders.map((o) => o.id), 0) + 1;
      const orderCode = `ORD-${2026000 + newId}`;
      const now = new Date().toISOString();

      const newOrder = {
        id: newId,
        orderCode,
        status: 'PENDING',
        subTotal: orderData.subTotal,
        discountAmount: orderData.discountAmount || 0,
        shippingFee: orderData.shippingFee || 0,
        taxAmount: 0,
        totalAmount: orderData.totalAmount,
        shippingAddressSnapshot: orderData.shippingAddressSnapshot || 'Địa chỉ nhận hàng',
        note: orderData.note || '',
        cancelReason: null,
        placedAt: now,
        confirmedAt: null,
        canceledAt: null,
        createdAt: now,
        updatedAt: now,
        userId: orderData.userId || 1,
        shippingAddressId: orderData.shippingAddressId || 1,
        couponId: orderData.couponId || null,
        shippingProviderShort: orderData.shippingProviderId === 2 ? 'GHTK' : 'GHN',
        trackingCode: `${orderData.shippingProviderId === 2 ? 'GHTK' : 'GHN'}-${Date.now().toString().slice(-8)}`,
        orderItems: orderData.orderItems || [],
        orderStatusHistories: [
          {
            id: newId * 10 + 1,
            orderId: newId,
            status: 'PENDING',
            note: 'Đơn hàng đã được khởi tạo thành công trên hệ thống',
            changedAt: now,
            changedBy: 1,
          },
        ],
        payments: [
          {
            id: newId * 10 + 1,
            orderId: newId,
            paymentMethod: orderData.paymentMethod || 'BANK_TRANSFER',
            paymentStatus: orderData.paymentMethod === 'BANK_TRANSFER' ? 'PAID' : 'PENDING',
            amount: orderData.totalAmount,
            transactionCode: `TXN-${Date.now()}`,
            payAt: orderData.paymentMethod === 'BANK_TRANSFER' ? now : null,
            providerResponse: 'Thành công',
          },
        ],
        shipments: [
          {
            id: newId * 10 + 1,
            orderId: newId,
            providerId: orderData.shippingProviderId || 1,
            trackingCode: `${orderData.shippingProviderId === 2 ? 'GHTK' : 'GHN'}-${Date.now().toString().slice(-8)}`,
            shipmentStatus: 'PENDING',
            shippedAt: null,
            deliveredAt: null,
          },
        ],
      };

      mockOrders.unshift(newOrder);
      return newOrder;
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.post('/orders', orderData);
  },

  async cancelOrder(id, reason = 'Khách hàng yêu cầu hủy') {
    if (USE_MOCK) {
      await fakeDelay();
      const order = mockOrders.find((o) => String(o.id) === String(id));
      if (!order) throw new Error('Không tìm thấy đơn hàng');
      if (order.status !== 'PENDING') {
        throw new Error('Chỉ có thể hủy đơn hàng đang ở trạng thái Chờ xác nhận (PENDING)');
      }
      order.status = 'CANCELED';
      order.cancelReason = reason;
      order.canceledAt = new Date().toISOString();
      order.updatedAt = new Date().toISOString();
      order.orderStatusHistories.push({
        id: Date.now(),
        orderId: order.id,
        status: 'CANCELED',
        note: `Lý do: ${reason}`,
        changedAt: new Date().toISOString(),
        changedBy: 1,
      });
      return order;
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.put(`/orders/${id}/cancel`, { reason });
  },

  async updateOrderStatus(id, newStatus, note = '') {
    if (USE_MOCK) {
      await fakeDelay();
      const order = mockOrders.find((o) => String(o.id) === String(id));
      if (!order) throw new Error('Không tìm thấy đơn hàng');
      order.status = newStatus;
      order.updatedAt = new Date().toISOString();
      if (newStatus === 'CONFIRMED') order.confirmedAt = new Date().toISOString();
      if (newStatus === 'CANCELED') order.canceledAt = new Date().toISOString();
      order.orderStatusHistories.push({
        id: Date.now(),
        orderId: order.id,
        status: newStatus,
        note: note || `Cập nhật trạng thái thành ${newStatus}`,
        changedAt: new Date().toISOString(),
        changedBy: 99, // Admin
      });
      return order;
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.put(`/orders/${id}/status`, { status: newStatus, note });
  },
};
