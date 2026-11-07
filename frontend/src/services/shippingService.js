import axiosClient from "../api/axiosClient.js";

export const DEFAULT_SHIPPING_PROVIDERS = [
  {
    id: 1,
    name: "Giao Hàng Nhanh (GHN Express)",
    code: "GHN",
    baseFee: 30000,
    isActive: true,
  },
  {
    id: 2,
    name: "Giao Hàng Tiết Kiệm (GHTK)",
    code: "GHTK",
    baseFee: 25000,
    isActive: true,
  },
];

export const shippingService = {
  async getShippingProviders() {
    try {
      const response = await axiosClient.get("/shipments/shipping-providers");
      let list = response?.data ?? response;
      if (list && Array.isArray(list.data)) {
        list = list.data;
      }
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
      return DEFAULT_SHIPPING_PROVIDERS;
    } catch (err) {
      console.warn("Không kết nối được API đơn vị vận chuyển, dùng danh sách mặc định:", err);
      return DEFAULT_SHIPPING_PROVIDERS;
    }
  },

  async calculateShipping({
    providerCode = "GHN",
    addressId,
    city,
    subTotal = 0,
  }) {
    try {
      const params = {
        providerCode: providerCode.toUpperCase(),
        subTotal,
      };
      if (addressId) params.addressId = addressId;
      if (city) params.city = city;

      const response = await axiosClient.get("/shipments/calculate", {
        params,
      });
      return response?.data || response;
    } catch (err) {
      console.warn("Lỗi tính phí ship:", err);
      return {
        shippingFee: subTotal >= 1000000 ? 0 : 30000,
        estimatedDeliveryDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      };
    }
  },
};

export default shippingService;
