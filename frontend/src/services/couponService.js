import { coupons as initialCoupons } from '../mocks/coupons.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const fakeDelay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

let mockCoupons = [...initialCoupons];

export const couponService = {
  async getCoupons(params = {}) {
    if (USE_MOCK) {
      await fakeDelay();
      const { activeOnly = false, page, size, limit } = params;
      let list = [...mockCoupons];
      if (activeOnly) {
        list = list.filter((c) => c.isActive);
      }

      if (page !== undefined || size !== undefined || limit !== undefined) {
        const totalElements = list.length;
        const pageSize = Number(size || limit || 10);
        const totalPages = Math.ceil(totalElements / pageSize) || 1;
        const pageNumber = Math.max(0, Math.min(Number(page ?? 0), Math.max(0, totalPages - 1)));
        const start = pageNumber * pageSize;
        const items = list.slice(start, start + pageSize);

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

      return list;
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get('/coupons', { params });
  },

  async applyCoupon(code, orderAmount = 0) {
    if (USE_MOCK) {
      await fakeDelay(250);
      const coupon = mockCoupons.find(
        (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
      );

      if (!coupon) {
        throw new Error('Mã giảm giá không hợp lệ hoặc đã hết hạn');
      }

      if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
        throw new Error(
          `Đơn hàng tối thiểu để áp dụng mã là ${coupon.minOrderAmount.toLocaleString('vi-VN')}₫`
        );
      }

      let discountAmount = 0;
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (orderAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
        }
      } else if (coupon.discountType === 'FIXED_AMOUNT') {
        discountAmount = coupon.discountValue;
      } else if (coupon.discountType === 'FREE_SHIPPING') {
        discountAmount = 30000;
      }

      return {
        coupon,
        discountAmount,
        message: 'Áp dụng mã giảm giá thành công!',
      };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.post('/coupons/apply', { code, orderAmount });
  },

  async toggleCouponStatus(id) {
    if (USE_MOCK) {
      await fakeDelay(150);
      const index = mockCoupons.findIndex((c) => c.id === id || c.code === id);
      if (index === -1) throw new Error('Không tìm thấy coupon');
      mockCoupons[index].isActive = !mockCoupons[index].isActive;
      return mockCoupons[index];
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.put(`/coupons/${id}/toggle`);
  },

  async createCoupon(data) {
    if (USE_MOCK) {
      await fakeDelay();
      const newId = Math.max(...mockCoupons.map((c) => c.id), 0) + 1;
      const newCoupon = {
        ...data,
        id: newId,
        code: data.code.toUpperCase(),
        usedCount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      mockCoupons.unshift(newCoupon);
      return newCoupon;
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.post('/coupons', data);
  },

  async updateCoupon(id, data) {
    if (USE_MOCK) {
      await fakeDelay();
      const index = mockCoupons.findIndex((c) => c.id === id || c.code === id);
      if (index === -1) throw new Error('Không tìm thấy coupon');
      mockCoupons[index] = {
        ...mockCoupons[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return mockCoupons[index];
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.put(`/coupons/${id}`, data);
  },

  async deleteCoupon(id) {
    if (USE_MOCK) {
      await fakeDelay();
      mockCoupons = mockCoupons.filter((c) => c.id !== id && c.code !== id);
      return { success: true };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.delete(`/coupons/${id}`);
  },
};

export default couponService;
