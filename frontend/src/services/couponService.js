import axiosClient from '../api/axiosClient.js';

export const couponService = {
  /**
   * Lấy danh sách mã giảm giá từ DB
   * GET /api/coupons?activeOnly=true|false
   */
  async getCoupons(params = {}) {
    const res = await axiosClient.get('/coupons', { params });
    const data = res?.data ?? res;
    return Array.isArray(data) ? data : data?.content || data?.items || [];
  },

  /**
   * Lấy thông tin chi tiết mã giảm giá theo code
   * GET /api/coupons/{code}
   */
  async getCouponByCode(code) {
    const res = await axiosClient.get(`/coupons/${encodeURIComponent(code.trim().toUpperCase())}`);
    return res?.data ?? res;
  },

  /**
   * Kiểm tra điều kiện và tính số tiền giảm giá
   * POST /api/coupons/apply
   */
  async applyCoupon(code, orderAmount = 0) {
    const res = await axiosClient.post('/coupons/apply', {
      code: code.trim().toUpperCase(),
      orderAmount: Number(orderAmount) || 0,
    });
    const data = res?.data ?? res;
    const couponObj = data?.coupon || {
      id: data?.couponId,
      code: data?.code,
      discountType: data?.discountType,
      discountValue: data?.discountValue,
      minOrderAmount: data?.minOrderAmount ?? 0,
      maxDiscountAmount: data?.maxDiscountAmount,
      isActive: true,
    };

    return {
      ...data,
      coupon: couponObj,
      discountAmount: data?.discountAmount ?? 0,
      message: data?.message || 'Áp dụng mã giảm giá thành công!',
    };
  },

  /**
   * Bật / Tắt trạng thái hoạt động của mã giảm giá (Admin/Staff)
   * PUT /api/coupons/{id}/toggle
   */
  async toggleCouponStatus(id) {
    const res = await axiosClient.put(`/coupons/${id}/toggle`);
    return res?.data ?? res;
  },

  /**
   * Tạo mã giảm giá mới (Admin/Staff)
   * POST /api/coupons
   */
  async createCoupon(data) {
    const payload = {
      code: (data.code || '').trim().toUpperCase(),
      discountType: data.discountType || 'FIXED_AMOUNT',
      discountValue: Number(data.discountValue ?? data.discount ?? 0),
      minOrderAmount: Number(data.minOrderAmount ?? data.minOrder ?? 0),
      maxDiscountAmount:
        data.maxDiscountAmount !== undefined && data.maxDiscountAmount !== null && data.maxDiscountAmount !== ''
          ? Number(data.maxDiscountAmount)
          : null,
      usageLimit: Number(data.usageLimit ?? 100),
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive !== false,
    };
    const res = await axiosClient.post('/coupons', payload);
    return res?.data ?? res;
  },

  /**
   * Cập nhật mã giảm giá (Admin/Staff)
   * PUT /api/coupons/{id}
   */
  async updateCoupon(id, data) {
    const payload = {
      code: (data.code || '').trim().toUpperCase(),
      discountType: data.discountType || 'FIXED_AMOUNT',
      discountValue: Number(data.discountValue ?? data.discount ?? 0),
      minOrderAmount: Number(data.minOrderAmount ?? data.minOrder ?? 0),
      maxDiscountAmount:
        data.maxDiscountAmount !== undefined && data.maxDiscountAmount !== null && data.maxDiscountAmount !== ''
          ? Number(data.maxDiscountAmount)
          : null,
      usageLimit: Number(data.usageLimit ?? 100),
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive !== false,
    };
    const res = await axiosClient.put(`/coupons/${id}`, payload);
    return res?.data ?? res;
  },

  /**
   * Xóa mã giảm giá (Admin/Staff)
   * DELETE /api/coupons/{id}
   */
  async deleteCoupon(id) {
    const res = await axiosClient.delete(`/coupons/${id}`);
    return res?.data ?? res;
  },
};

export default couponService;
