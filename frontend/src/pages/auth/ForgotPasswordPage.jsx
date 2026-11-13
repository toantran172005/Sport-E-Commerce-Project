import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import BrandLogo from '../../components/common/BrandLogo.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { authService } from '../../services/authService.js';
import AuthBanner from '../../components/auth/AuthBanner.jsx';

export default function ForgotPasswordPage() {
  const { showToast } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      showToast('Mã OTP xác thực đã được gửi về email của bạn!', 'success');
      navigate(`/verify-otp?email=${encodeURIComponent(email)}&purpose=RESET_PASSWORD`);
    } catch (err) {
      setError(err.message || 'Lỗi khi gửi yêu cầu');
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

          <Link
            to="/login"
            className="text-[12.5px] font-bold text-accent hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại đăng nhập</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="bg-surface rounded-lg shadow-sm border border-line w-full max-w-[540px] lg:max-w-[1020px] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          <AuthBanner variant="recovery" className="hidden lg:flex lg:col-span-5" />
          <div className="lg:col-span-7 p-6 md:p-10 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto space-y-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-ink">
              Quên Mật Khẩu?
            </h1>
            <p className="text-[13px] text-ink-muted mt-1">
              Nhập email đã đăng ký của bạn. Chúng tôi sẽ gửi mã xác thực OTP để thiết lập mật khẩu mới.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 text-danger text-[12px] font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email nhận mã OTP
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="toantran@gmail.com"
                  className="w-full h-10 pl-9 pr-3 rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line text-[13px] focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full h-10 rounded-md bg-accent hover:bg-accent-hover text-white text-[13px] font-bold shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <span>{loading ? 'Đang gửi mã...' : 'Gửi Mã Xác Thực OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-[12.5px] text-ink-muted hover:text-accent"
            >
              Nhớ mật khẩu? <span className="font-bold text-accent">Đăng nhập ngay</span>
            </Link>
          </div>
        </div>
        </div>
        </div>
      </main>
    </div>
  );
}
