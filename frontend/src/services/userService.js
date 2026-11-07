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

  async sendOtp(email, purpose = 'CHANGE_PASSWORD') {
    if (USE_MOCK) {
      await fakeDelay(200);
      return { success: true, message: `Mã OTP đã được gửi đến ${email}`, testOtp: '123456' };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.post('/auth/send-otp', { email, purpose });
  },

  async changePassword({ oldPassword, newPassword, otp }) {
    if (USE_MOCK) {
      await fakeDelay(300);
      if (otp !== '123456') {
        throw new Error('Mã OTP không chính xác. Mã thử nghiệm là 123456.');
      }
      return { success: true, message: 'Đổi mật khẩu thành công!' };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.post('/users/change-password', { oldPassword, newPassword, otp });
  },
};

export default userService;
