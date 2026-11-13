import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { authService } from '../../services/authService.js';
import AuthBanner from '../../components/auth/AuthBanner.jsx';
import BrandLogo from '../../components/common/BrandLogo.jsx';


export default function LoginPage() {
  const { setUser, showToast } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const executeLogin = async (loginEmail, loginPassword) => {
    setError('');
    setLoading(true);
    try {
      const res = await authService.login({ email: loginEmail, password: loginPassword });
      setUser(res.user);
      showToast(`Đăng nhập thành công! Xin chào ${res.user.fullName || res.user.name}`, 'success');
      
      if (res.user.mustChangePassword) {
        // Tài khoản do Admin tạo, còn mật khẩu mặc định → bắt buộc đổi trước khi dùng
        navigate('/force-change-password', { replace: true });
      } else if (
        (res.user.role === 'ADMIN' || res.user.role === 'STAFF') &&
        (redirectUrl === '/' || redirectUrl === '/admin')
      ) {
        navigate('/admin');
      } else {
        navigate(redirectUrl);
      }
    } catch (err) {
      // Backend trả 403 khi tài khoản đăng ký xong nhưng chưa nhập OTP (trạng thái PENDING)
      if (err.status === 403 && /xác thực/i.test(err.message || '')) {
        showToast('Tài khoản chưa xác thực email. Vui lòng nhập mã OTP đã gửi tới email của bạn.', 'warning');
        navigate(`/verify-otp?email=${encodeURIComponent(loginEmail.trim())}&purpose=REGISTER`);
        return;
      }
      setError(err.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeLogin(email, password);
  };

  const handleContinueAsGuest = () => {
    localStorage.removeItem('sport_user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    showToast('Đang duyệt web với tư cách Khách vãng lai (Guest)', 'info');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-page flex flex-col text-ink transition-colors">
      {/* Top Header */}
      <header className="bg-surface border-b border-line h-16">
        <div className="max-w-[1360px] mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center" aria-label="Delta Sport - Trang chủ">
            <BrandLogo className="h-9 w-auto" />
          </Link>

          <Link
            to="/"
            className="text-[12.5px] font-bold text-accent hover:underline flex items-center gap-1"
          >
            <span>Duyệt cửa hàng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="bg-surface rounded-lg shadow-sm border border-line w-full max-w-[1020px] grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[640px]">
          {/* Left Brand Banner (5 cols) */}
          <AuthBanner variant="login" className="hidden lg:flex lg:col-span-5" />

          {/* Right Form Column (7 cols) */}
          <div className="lg:col-span-7 p-6 md:p-10 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-ink">
                  Đăng Nhập Tài Khoản
                </h1>
                <p className="text-[13px] text-ink-muted mt-1">
                  Nhập email và mật khẩu để tiếp tục mua sắm
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 text-danger text-[12px] font-medium">
                  {error}
                </div>
              )}

              {/* 3 Quick Role Logins Selection */}
              <div className="space-y-2">
                <p className="text-[11.5px] font-bold text-ink-subtle uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Hoặc duyệt web không cần đăng nhập:</span>
                </p>

                <div className="grid grid-cols-1 gap-2">
                  {/* Option 3: Guest */}
                  <button
                    type="button"
                    onClick={handleContinueAsGuest}
                    className="p-2.5 rounded-lg border border-line hover:border-ink-muted bg-surface-2/40 hover:bg-surface-2 text-left transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-surface-2 text-ink-muted flex items-center justify-center shrink-0 border border-line">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-bold text-ink truncate">
                          Duyệt web với tư cách Khách (Guest)
                        </p>
                        <p className="text-[11px] text-ink-muted truncate">
                          Chưa đăng nhập • Xem hàng, khi đặt đơn sẽ yêu cầu đăng nhập
                        </p>
                      </div>
                    </div>
                    <span className="text-[11.5px] font-bold text-ink-muted group-hover:text-ink shrink-0 ml-2">
                      Vào xem →
                    </span>
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-line w-full" />
                <span className="bg-surface px-3 text-[11px] font-bold text-ink-subtle uppercase tracking-wider absolute">
                  Hoặc đăng nhập thủ công
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email đăng nhập
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập email đăng nhập"
                      className="w-full h-10 pl-9 pr-3 rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line text-[13px] focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-300">
                      Mật khẩu
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11.5px] text-accent font-bold hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 pl-9 pr-10 rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line text-[13px] focus:outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10.5 rounded-md bg-accent hover:bg-accent-hover text-white text-[13.5px] font-bold shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="text-center text-[12.5px] text-ink-muted">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-accent font-bold hover:underline">
                  Đăng ký tài khoản mới
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
