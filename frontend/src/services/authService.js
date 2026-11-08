import axiosClient from '../api/axiosClient.js';
import { users as initialUsers } from '../mocks/users.js';
import { USE_MOCK } from '../config/env.js';

const fakeDelay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
const MOCK_TOKEN = 'mock-jwt-token-sannha-sport-2026';
const MOCK_OTP = '123456';

let currentUser = initialUsers[0];
let pendingMockUser = null; // mock: user vừa đăng ký, chờ xác thực OTP

// Backend trả AuthResponse: { accessToken, refreshToken, tokenType, expiresIn, user }
function saveSession({ accessToken, refreshToken, user }) {
  localStorage.setItem('token', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  if (user) localStorage.setItem('sport_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('sport_user');
}

export const authService = {
  /** POST /api/auth/login → lưu access + refresh token, trả { user, token } */
  async login({ email, password }) {
    if (USE_MOCK) {
      await fakeDelay();
      const normalizedEmail = email.trim().toLowerCase();
      let user = initialUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (!user) {
        if (normalizedEmail.includes('admin')) {
          user = initialUsers.find((u) => u.role === 'ADMIN');
        } else if (normalizedEmail.includes('staff')) {
          user = initialUsers.find((u) => u.role === 'STAFF');
        } else if (normalizedEmail.includes('toan')) {
          user = initialUsers.find((u) => u.email.toLowerCase().includes('toan'));
        } else {
          user = initialUsers.find((u) => u.role === 'CUSTOMER') || initialUsers[0];
        }
      }
      currentUser = user;
      localStorage.setItem('sport_user', JSON.stringify(user));
      localStorage.setItem('token', MOCK_TOKEN);
      return { user, token: MOCK_TOKEN };
    }

    const data = await axiosClient.post('/auth/login', { email: email.trim(), password });
    saveSession(data);
    return { user: data.user, token: data.accessToken };
  },

  /**
   * POST /api/auth/register
   * Backend chỉ tạo tài khoản PENDING và gửi OTP qua email, KHÔNG trả token.
   * Token chỉ được cấp sau khi verifyOtp thành công.
   */
  async register(userData) {
    if (USE_MOCK) {
      await fakeDelay();
      pendingMockUser = {
        id: Date.now(),
        email: userData.email,
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber,
        avatarUrl: null,
        gender: 'MALE',
        dateOfBirth: '2000-01-01',
        role: 'CUSTOMER',
        status: 'ACTIVE',
      };
      return { email: userData.email };
    }

    const email = userData.email.trim();
    await axiosClient.post('/auth/register', {
      fullName: userData.fullName.trim(),
      email,
      // Backend chỉ nhận 9-15 chữ số, bỏ khoảng trắng người dùng gõ ("0912 345 678")
      phoneNumber: (userData.phoneNumber || '').replace(/\s+/g, ''),
      password: userData.password,
    });
    return { email };
  },

  /**
   * POST /api/auth/verify-otp (chỉ dùng cho purpose REGISTER)
   * Thành công → backend kích hoạt tài khoản và trả luôn token → tự đăng nhập.
   */
  async verifyOtp({ email, otp, purpose = 'REGISTER' }) {
    if (USE_MOCK) {
      await fakeDelay();
      if (otp !== MOCK_OTP) {
        throw new Error(`Mã OTP không chính xác. Vui lòng nhập ${MOCK_OTP} để thử nghiệm!`);
      }
      if (purpose !== 'REGISTER') return { success: true };
      const user = pendingMockUser || initialUsers[0];
      currentUser = user;
      localStorage.setItem('sport_user', JSON.stringify(user));
      localStorage.setItem('token', MOCK_TOKEN);
      return { success: true, user, token: MOCK_TOKEN };
    }

    const data = await axiosClient.post('/auth/verify-otp', { email, otp, purpose });
    if (data?.accessToken) {
      saveSession(data);
      return { success: true, user: data.user, token: data.accessToken };
    }
    return { success: true };
  },

  /** POST /api/auth/resend-otp (backend giới hạn 60 giây/lần, quá sớm trả 429) */
  async resendOtp({ email, purpose = 'REGISTER' }) {
    if (USE_MOCK) {
      await fakeDelay(200);
      return { success: true };
    }
    await axiosClient.post('/auth/resend-otp', { email, purpose });
    return { success: true };
  },

  /** POST /api/auth/forgot-password → luôn trả OK dù email có tồn tại hay không (chống dò email) */
  async forgotPassword(email) {
    if (USE_MOCK) {
      await fakeDelay(300);
      return { success: true };
    }
    await axiosClient.post('/auth/forgot-password', { email });
    return { success: true };
  },

  /** POST /api/auth/reset-password → xác thực OTP + đổi mật khẩu, backend thu hồi mọi refresh token */
  async resetPassword({ email, otp, newPassword }) {
    if (USE_MOCK) {
      await fakeDelay(300);
      if (otp !== MOCK_OTP) throw new Error(`Mã OTP không chính xác. Vui lòng nhập ${MOCK_OTP} để thử nghiệm!`);
      return { success: true };
    }
    await axiosClient.post('/auth/reset-password', { email, otp, newPassword });
    return { success: true };
  },

  /** GET /api/users/me → thông tin user theo access token hiện tại */
  async getCurrentUser() {
    if (USE_MOCK) {
      try {
        const saved = localStorage.getItem('sport_user');
        if (saved) return JSON.parse(saved);
      } catch {
        // bỏ qua dữ liệu hỏng
      }
      return currentUser;
    }

    const user = await axiosClient.get('/users/me');
    localStorage.setItem('sport_user', JSON.stringify(user));
    return user;
  },

  /** POST /api/auth/logout → thu hồi refresh token; luôn xóa phiên phía client dù API lỗi */
  async logout() {
    if (USE_MOCK) {
      clearSession();
      return { success: true };
    }

    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) await axiosClient.post('/auth/logout', { refreshToken });
    } catch {
      // bỏ qua: dù API lỗi vẫn phải đăng xuất phía client
    } finally {
      clearSession();
    }
    return { success: true };
  },
};

export default authService;
