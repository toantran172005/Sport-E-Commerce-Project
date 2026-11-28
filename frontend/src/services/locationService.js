import axiosClient from '../api/axiosClient.js';

/**
 * Danh mục Tỉnh/Thành - Quận/Huyện - Phường/Xã lấy từ Giao Hàng Nhanh qua backend (/api/locations).
 * scheme: 'NEW' (Tỉnh > Phường/Xã, từ 01/07/2025) hoặc 'OLD' (Tỉnh > Quận/Huyện > Phường/Xã).
 * Kết quả được nhớ trong bộ nhớ trình duyệt để mở lại form không phải tải lại.
 */
const memo = new Map();

async function cached(key, loader) {
  if (memo.has(key)) return memo.get(key);
  const promise = loader().catch((err) => {
    memo.delete(key); // không nhớ lỗi để lần sau thử lại
    throw err;
  });
  memo.set(key, promise);
  return promise;
}

export const locationService = {
  getProvinces(scheme = 'NEW') {
    return cached(`P:${scheme}`, () => axiosClient.get('/locations/provinces', { params: { scheme } }));
  },

  /** Chỉ dùng cho địa chỉ OLD */
  getDistricts(provinceId) {
    return cached(`D:${provinceId}`, () => axiosClient.get('/locations/districts', { params: { provinceId } }));
  },

  /** OLD: theo districtId. NEW: theo provinceId. */
  getWards({ scheme = 'NEW', provinceId, districtId }) {
    const params = scheme === 'NEW' ? { scheme, provinceId } : { scheme, districtId };
    const key = scheme === 'NEW' ? `W:NEW:${provinceId}` : `W:OLD:${districtId}`;
    return cached(key, () => axiosClient.get('/locations/wards', { params }));
  },
};
