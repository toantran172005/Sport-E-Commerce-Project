import { users as initialUsers } from '../mocks/users.js';
import { userAddresses as initialAddresses } from '../mocks/userAddresses.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const fakeDelay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

let mockUsers = [...initialUsers];
let mockAddresses = [...initialAddresses];

export const userService = {
  async getCustomers() {
    if (USE_MOCK) {
      await fakeDelay();
      return mockUsers.filter((u) => u.role === 'CUSTOMER');
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
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
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.put(`/users/${id}/toggle-status`);
  },

  async getUserAddresses(userId) {
    if (USE_MOCK) {
      await fakeDelay(150);
      return mockAddresses.filter((a) => !userId || a.userId === Number(userId));
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get(`/users/${userId}/addresses`);
  },

  async addAddress(addressData) {
    if (USE_MOCK) {
      await fakeDelay();
      const newId = Date.now();
      const newAddr = {
        ...addressData,
        id: newId,
        country: 'Vietnam',
        type: 'SHIPPING',
      };
      if (newAddr.isDefault) {
        mockAddresses.forEach((a) => (a.isDefault = false));
      }
      mockAddresses.push(newAddr);
      return newAddr;
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.post('/addresses', addressData);
  },

  async updateAddress(id, addressData) {
    if (USE_MOCK) {
      await fakeDelay();
      const index = mockAddresses.findIndex((a) => a.id === id);
      if (index === -1) throw new Error('Không tìm thấy địa chỉ');
      if (addressData.isDefault) {
        mockAddresses.forEach((a) => (a.isDefault = false));
      }
      mockAddresses[index] = { ...mockAddresses[index], ...addressData };
      return mockAddresses[index];
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.put(`/addresses/${id}`, addressData);
  },

  async deleteAddress(id) {
    if (USE_MOCK) {
      await fakeDelay();
      mockAddresses = mockAddresses.filter((a) => a.id !== id);
      return { success: true };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.delete(`/addresses/${id}`);
  },

  /** ADMIN: POST /api/admin/users/staff → { user, temporaryPassword } */
  async createStaff({ fullName, email, phoneNumber }) {
    if (USE_MOCK) {
      await fakeDelay();
      if (mockUsers.some((u) => u.email?.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email này đã được đăng ký');
      }
      const staff = {
        id: Date.now(),
        fullName,
        email,
        phoneNumber: phoneNumber || null,
        role: 'STAFF',
        status: 'ACTIVE',
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
      };
      mockUsers = [staff, ...mockUsers];
      return { user: staff, temporaryPassword: '11111' };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.post('/admin/users/staff', {
      fullName,
      email,
      phoneNumber: phoneNumber ? phoneNumber.replace(/\s+/g, '') : '',
    });
  },

  /** ADMIN: GET /api/admin/users?role=STAFF → PageResponse { content, page, size, totalElements, totalPages } */
  async getStaff({ keyword = '', page = 0, size = 10 } = {}) {
    if (USE_MOCK) {
      await fakeDelay(150);
      const kw = keyword.trim().toLowerCase();
      const all = mockUsers.filter(
        (u) =>
          u.role === 'STAFF' &&
          (!kw || `${u.email} ${u.fullName} ${u.phoneNumber || ''}`.toLowerCase().includes(kw))
      );
      const content = all.slice(page * size, page * size + size);
      return {
        content,
        page,
        size,
        totalElements: all.length,
        totalPages: Math.max(1, Math.ceil(all.length / size)),
      };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get('/admin/users', { params: { role: 'STAFF', keyword, page, size } });
  },

  /** GET /api/users/me */
  async getProfile() {
    if (USE_MOCK) {
      await fakeDelay(100);
      try {
        const saved = localStorage.getItem('sport_user');
        if (saved) return JSON.parse(saved);
      } catch {
        // bỏ qua dữ liệu hỏng
      }
      return mockUsers[0];
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get('/users/me');
  },

  /** PUT /api/users/me - chỉ sửa họ tên, ảnh, giới tính, ngày sinh (đổi email/SĐT phải qua OTP) */
  async updateProfile({ fullName, avatarUrl, gender, dateOfBirth }) {
    if (USE_MOCK) {
      await fakeDelay(200);
      let saved = null;
      try {
        saved = JSON.parse(localStorage.getItem('sport_user') || 'null');
      } catch {
        // bỏ qua dữ liệu hỏng
      }
      const updated = {
        ...(saved || mockUsers[0]),
        fullName,
        gender,
        ...(dateOfBirth ? { dateOfBirth } : {}),
        ...(avatarUrl ? { avatarUrl } : {}),
      };
      localStorage.setItem('sport_user', JSON.stringify(updated));
      return updated;
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.put('/users/me', { fullName, avatarUrl, gender, dateOfBirth });
  },

  async sendOtp(email, purpose = 'CHANGE_PASSWORD') {
    if (USE_MOCK) {
      await fakeDelay(200);
      return { success: true, message: `Mã OTP đã được gửi đến ${email}`, testOtp: '123456' };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.post('/auth/send-otp', { email, purpose });
  },

  /** POST /api/users/me/change-password (backend xác minh mật khẩu cũ, không dùng OTP) */
  async changePassword({ oldPassword, newPassword }) {
    if (USE_MOCK) {
      await fakeDelay(300);
      return { success: true, message: 'Đổi mật khẩu thành công!' };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.post('/users/me/change-password', { oldPassword, newPassword });
  },
};

export default userService;
