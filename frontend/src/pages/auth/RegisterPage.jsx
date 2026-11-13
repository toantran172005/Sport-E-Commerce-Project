import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { authService } from '../../services/authService.js';
import AuthBanner from '../../components/auth/AuthBanner.jsx';
import BrandLogo from '../../components/common/BrandLogo.jsx';

export default function RegisterPage() {
  const { showToast } = useStore();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 8 || !/^(?=.*[A-Za-z])(?=.*\d).+$/.test(password)) {
      setError('Mật khẩu phải từ 8 ký tự và gồm cả chữ và số');
      return;
    }

    setLoading(true);
    try {
      // Backend tạo tài khoản ở trạng thái PENDING và gửi OTP qua email (chưa cấp token)
      await authService.register({ fullName, email, phoneNumber, password });
      showToast('Đã gửi mã OTP tới email của bạn. Nhập mã để kích hoạt tài khoản.', 'success');
      navigate(`/verify-otp?email=${encodeURIComponent(email)}&purpose=REGISTER`);
    } catch (err) {
      setError(err.message || 'Lỗi khi đăng ký tài khoản');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex flex-col text-ink transition-colors">
      <header className="bg-surface border-b border-line h-16">
        <div className="max-w-[1360px] mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center" aria-label="Delta Sport - Trang chủ">
            <BrandLogo className="h-9 w-auto" />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="bg-surface rounded-lg shadow-sm border border-line w-full max-w-[540px] lg:max-w-[1020px] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          <AuthBanner variant="register" className="hidden lg:flex lg:col-span-5" />
          <div className="lg:col-span-7 p-6 md:p-10 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-ink">
              Đăng Ký Tài Khoản Mới
            </h1>
            <p className="text-[13px] text-ink-muted mt-1">
              Trở thành thành viên để tích lũy điểm và nhận ưu đãi độc quyền
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 text-danger text-[12px] font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Họ và tên *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full h-9.5 pl-9 pr-3 rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line text-[13px] focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ban@example.com"
                    className="w-full h-9.5 pl-9 pr-3 rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line text-[13px] focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Số điện thoại *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full h-9.5 pl-9 pr-3 rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line text-[13px] focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Từ 8 ký tự, gồm chữ và số"
                    className="w-full h-9.5 pl-9 pr-3 rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line text-[13px] focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Xác nhận mật khẩu *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full h-9.5 pl-9 pr-3 rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line text-[13px] focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-md bg-accent hover:bg-accent-hover text-white text-[13.5px] font-bold shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <span>{loading ? 'Đang khởi tạo tài khoản...' : 'Đăng Ký & Nhận Mã OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <p className="text-[12.5px] text-center text-ink-muted">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-accent hover:underline">
              Đăng nhập
            </Link>
          </p>

          <p className="text-[12px] text-center text-ink-subtle">
            Bằng việc đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của Delta Sport.
          </p>
        </div>
        </div>
        </div>
      </main>
    </div>
  );
}
