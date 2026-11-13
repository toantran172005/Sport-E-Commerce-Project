import axiosClient from '../api/axiosClient.js';

export const userService = {
  // ---- Quản trị người dùng & Nhân viên (gọi API thật qua JWT) ----
  async getCustomers({ keyword = '', page = 0, size = 10 } = {}) {
    return axiosClient.get('/admin/users', { params: { role: 'CUSTOMER', keyword, page, size } });
  },

  async toggleUserStatus(id) {
    return axiosClient.put(`/admin/users/${id}/toggle-status`);
  },

  async getStaffMembers({ keyword = '', page = 0, size = 10 } = {}) {
    return axiosClient.get('/admin/users', { params: { role: 'STAFF', keyword, page, size } });
  },

  async createStaff({ fullName, email, phoneNumber }) {
    return axiosClient.post('/admin/users/staff', {
      fullName,
      email,
      phoneNumber: phoneNumber ? phoneNumber.replace(/\s+/g, '') : '',
    });
  },

  async updateStaff(id, data) {
    return axiosClient.put(`/admin/users/staff/${id}`, data);
  },

  async setStaffStatus(id, status) {
    return axiosClient.patch(`/admin/users/staff/${id}/status`, { status });
  },

  async deleteStaff(id) {
    return axiosClient.delete(`/admin/users/staff/${id}`);
  },

  // Alias tương thích
  async createAdminStaff(data) {
    return this.createStaff(data);
  },

  async getStaff(params) {
    return this.getStaffMembers(params);
  },

  // ===== ADDRESS MANAGEMENT =====
  /** GET /api/users/me/addresses */
  async getMyAddresses() {
    return axiosClient.get('/users/me/addresses');
  },

  async getUserAddresses(userId) {
    return axiosClient.get(`/users/${userId}/addresses`);
  },

  /** POST /api/users/me/addresses (địa chỉ đầu tiên tự động là mặc định) */
  async addAddress({ recipientName, phoneNumber, addressLine, ward, district, city, isDefault }) {
    return axiosClient.post('/users/me/addresses', {
      recipientName,
      phoneNumber: (phoneNumber || '').replace(/\s+/g, ''),
      addressLine,
      ward,
      district,
      city,
      isDefault: Boolean(isDefault),
    });
  },

  /** PUT /api/users/me/addresses/{id} (isDefault=true để chuyển mặc định; không thể bỏ mặc định trực tiếp) */
  async updateAddress(id, { recipientName, phoneNumber, addressLine, ward, district, city, isDefault }) {
    return axiosClient.put(`/users/me/addresses/${id}`, {
      recipientName,
      phoneNumber: (phoneNumber || '').replace(/\s+/g, ''),
      addressLine,
      ward,
      district,
      city,
      isDefault: isDefault ? true : null,
    });
  },

  /** PATCH /api/users/me/addresses/{id}/default */
  async setDefaultAddress(id) {
    return axiosClient.patch(`/users/me/addresses/${id}/default`);
  },

  /** DELETE /api/users/me/addresses/{id} (409 nếu địa chỉ đang gắn với đơn hàng) */
  async deleteAddress(id) {
    await axiosClient.delete(`/users/me/addresses/${id}`);
    return { success: true };
  },

  // ---- Hồ sơ cá nhân ----
  /** GET /api/users/me */
  async getProfile() {
    return axiosClient.get('/users/me');
  },

  /** PUT /api/users/me - chỉ sửa họ tên, giới tính, ngày sinh (đổi email/SĐT phải qua OTP, đổi ảnh dùng uploadAvatar) */
  async updateProfile({ fullName, gender, dateOfBirth }) {
    const updated = await axiosClient.put('/users/me', { fullName, gender, dateOfBirth });
    // Giữ bản lưu cục bộ khớp với server để F5 không hiện dữ liệu cũ
    localStorage.setItem('sport_user', JSON.stringify(updated));
    return updated;
  },

  /**
   * POST /api/users/me/avatar (multipart, trường "file") → trả về hồ sơ đã cập nhật.
   * Phải ghi đè Content-Type: axiosClient mặc định là JSON nên nếu không axios sẽ biến FormData thành JSON.
   */
  async uploadAvatar(blob) {
    const form = new FormData();
    form.append('file', blob, 'avatar.jpg');
    return axiosClient.post('/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
  },

  /** DELETE /api/users/me/avatar → trả về hồ sơ đã cập nhật (avatarUrl = null) */
  async removeAvatar() {
    return axiosClient.delete('/users/me/avatar');
  },

  /** POST /api/users/me/change-password (backend xác minh mật khẩu cũ, không dùng OTP) */
  async changePassword({ oldPassword, newPassword }) {
    return axiosClient.post('/users/me/change-password', { oldPassword, newPassword });
  },
};

export default userService;
