import axiosClient from "../api/axiosClient.js";

export const orderService = {
  async placeOrder(orderData) {
    const payload = {
      // Backend lấy user từ JWT; trường này chỉ để tương thích, không còn mặc định user giả
      userId: orderData.userId ? Number(orderData.userId) : null,
      shippingAddressId: Number(orderData.shippingAddressId),
      paymentMethod: orderData.paymentMethod || "COD",
      note: orderData.note || "",
      shippingProviderCode:
        orderData.shippingProviderCode ||
        (orderData.shippingProviderId === 2 ? "GHTK" : "GHN"),
      couponId: orderData.couponId ? Number(orderData.couponId) : null,
    };

    if (
      orderData.cartItemIds &&
      Array.isArray(orderData.cartItemIds) &&
      orderData.cartItemIds.length > 0
    ) {
      payload.cartItemIds = orderData.cartItemIds.map(Number);
    } else if (orderData.items) {
      payload.items = {
        variantId: Number(orderData.items.variantId),
        quantity: Number(orderData.items.quantity || 1),
      };
    } else if (orderData.orderItems && orderData.orderItems.length > 0) {
      const first = orderData.orderItems[0];
      payload.items = {
        variantId: Number(first.variantId || first.id || 1),
        quantity: Number(first.quantity || 1),
      };
    }

    const response = await axiosClient.post("/orders/place-order", payload);
    return response.data || response;
  },

  async updateOrderStatus(arg1, arg2, arg3, arg4) {
    let orderId, newStatus, note, cancelledReason;

    if (typeof arg1 === "object" && arg1 !== null) {
      orderId = arg1.orderId || arg1.id;
      newStatus = arg1.newStatus || arg1.status;
      note = arg1.note;
      cancelledReason = arg1.cancelledReason;
    } else {
      orderId = arg1;
      newStatus = arg2;
      note = arg3;
      cancelledReason = arg4;
    }

    const payload = {
      orderId: Number(orderId),
      newStatus: String(newStatus),
      note: note || "",
      cancelledReason: cancelledReason || "",
    };

    const response = await axiosClient.patch(
      "/orders/update-order-status",
      payload,
    );
    return response.data || response;
  },

  async cancelOrder(orderId, reason = "Khách hàng yêu cầu hủy đơn") {
    try {
      const response = await axiosClient.post(`/orders/${orderId}/cancel`, {
        reason,
      });
      return response.data || response;
    } catch {
      return this.updateOrderStatus({
        orderId,
        newStatus: "CANCELED",
        cancelledReason: reason,
      });
    }
  },

  async getOrderById(id) {
    const response = await axiosClient.get(`/orders/${id}`);
    return response.data || response;
  },
};

export default orderService;
