import { users as initialUsers } from '../mocks/users.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const fakeDelay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

let currentUser = initialUsers[0];

export const authService = {
  async login({ email, password }) {
    if (USE_MOCK) {
      await fakeDelay();
      const normalizedEmail = (email || '').trim().toLowerCase();
      let user = initialUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

      if (!user) {
        if (normalizedEmail.includes('admin')) {
          user = initialUsers.find((u) => u.role === 'ADMIN');
        } else if (normalizedEmail.includes('staff')) {
          user = initialUsers.find((u) => u.role === 'STAFF' && u.status === 'ACTIVE') ||
                 initialUsers.find((u) => u.role === 'STAFF');
        } else if (normalizedEmail.includes('toan')) {
          user = initialUsers.find((u) => u.email.toLowerCase().includes('toan'));
        } else {
          user = initialUsers.find((u) => u.role === 'CUSTOMER') || initialUsers[0];
        }
      }

      // Kiểm tra tài khoản back-office bị khóa
      if (user && (user.role === 'ADMIN' || user.role === 'STAFF') && user.status === 'LOCKED') {
        throw new Error('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
      }

      currentUser = user;
      localStorage.setItem('sport_user', JSON.stringify(user));
      localStorage.setItem('token', 'mock-jwt-token-sannha-sport-2026');
      return { user, token: 'mock-jwt-token-sannha-sport-2026' };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.post('/auth/login', { email, password });
  },

  async register(userData) {
    if (USE_MOCK) {
      await fakeDelay();
      const newUser = {
        id: Date.now(),
        email: userData.email,
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        gender: 'MALE',
        dateOfBirth: '2000-01-01',
        role: 'CUSTOMER',
        status: 'ACTIVE',
      };
      currentUser = newUser;
      localStorage.setItem('sport_user', JSON.stringify(newUser));
      return { user: newUser, token: 'mock-jwt-token-sannha-sport-2026' };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.post('/auth/register', userData);
  },

  async verifyOtp({ email, otp, purpose }) {
    if (USE_MOCK) {
      await fakeDelay();
      if (otp !== '123456') {
        throw new Error('Mã OTP không chính xác. Vui lòng nhập 123456 để thử nghiệm!');
      }
      return { success: true, message: 'Xác thực OTP thành công' };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.post('/auth/verify-otp', { email, otp, purpose });
  },

  async getCurrentUser() {
    if (USE_MOCK) {
      try {
        const saved = localStorage.getItem('sport_user');
        if (saved) return JSON.parse(saved);
      } catch {
        /* ignore JSON parse errors */
      }
      return currentUser;
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get('/auth/me');
  },

  async logout() {
    if (USE_MOCK) {
      localStorage.removeItem('sport_user');
      localStorage.removeItem('token');
      return { success: true };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.post('/auth/logout');
  },
};

export default authService;
