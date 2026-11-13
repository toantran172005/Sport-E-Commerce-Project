import axiosClient from '../api/axiosClient.js';
import { users as initialUsers } from '../mocks/users.js';
import { USE_MOCK } from '../config/env.js';

const fakeDelay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

// Chỉ còn dùng cho 2 chức năng quản trị chưa có API backend (danh sách khách hàng, khóa/mở khóa).
// Mọi thứ liên quan hồ sơ, mật khẩu, sổ địa chỉ, nhân viên đều gọi API thật.
const mockUsers = [...initialUsers];

export const userService = {
  // ---- Quản trị (backend CHƯA có API: vẫn theo cờ VITE_USE_MOCK) ----
  async getCustomers() {
    if (USE_MOCK) {
      await fakeDelay();
      return mockUsers.filter((u) => u.role === 'CUSTOMER');
    }
    return axiosClient.get('/users/customers');
  },

  async toggleUserStatus(id) {
    if (USE_MOCK) {
      await fakeDelay(150);
      const index = mockUsers.findIndex((u) => u.id === id);
      if (index === -1) throw new Error('Không tìm thấy người dùng');
      mockUsers[index].status = mockUsers[index].status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
      return mockUsers[index];
    }
    return axiosClient.put(`/users/${id}/toggle-status`);
  },

  // ---- Sổ địa chỉ của chính người dùng đang đăng nhập (user lấy từ JWT, không truyền userId) ----
  /** GET /api/users/me/addresses → mặc định lên đầu */
  async getMyAddresses() {
    return axiosClient.get('/users/me/addresses');
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

  // ---- Nhân viên (ADMIN) ----
  /** ADMIN: POST /api/admin/users/staff → { user, temporaryPassword } */
  async createStaff({ fullName, email, phoneNumber }) {
    return axiosClient.post('/admin/users/staff', {
      fullName,
      email,
      phoneNumber: phoneNumber ? phoneNumber.replace(/\s+/g, '') : '',
    });
  },

  /** ADMIN: GET /api/admin/users?role=STAFF → PageResponse { content, page, size, totalElements, totalPages } */
  async getStaff({ keyword = '', page = 0, size = 10 } = {}) {
    return axiosClient.get('/admin/users', { params: { role: 'STAFF', keyword, page, size } });
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
