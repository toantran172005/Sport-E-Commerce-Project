import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { authService } from '../../services/authService.js';
import { USE_MOCK } from '../../config/env.js';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/;
const EMPTY_OTP = ['', '', '', '', '', ''];

export default function VerifyOtpPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const purpose = searchParams.get('purpose') || 'REGISTER';
  const isReset = purpose === 'RESET_PASSWORD';

  const { setUser, showToast } = useStore();
  const navigate = useNavigate();

  const [otp, setOtp] = useState(EMPTY_OTP);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate(isReset ? '/forgot-password' : '/register', { replace: true });
      return undefined;
    }
    inputRefs.current[0]?.focus();
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [email, isReset, navigate]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d+$/.test(data)) {
      const newOtp = data.split('');
      while (newOtp.length < 6) newOtp.push('');
      setOtp(newOtp);
      inputRefs.current[Math.min(data.length, 5)]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số OTP');
      return;
    }

    if (isReset) {
      if (newPassword.length < 8 || !PASSWORD_REGEX.test(newPassword)) {
        setError('Mật khẩu mới phải từ 8 ký tự và gồm cả chữ và số');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        return;
      }
    }

    setError('');
    setLoading(true);
    try {
      if (isReset) {
        // Backend xác thực OTP và đổi mật khẩu trong CÙNG một request
        await authService.resetPassword({ email, otp: fullOtp, newPassword });
        showToast('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
        navigate('/login');
      } else {
        // Xác thực đăng ký thành công → backend kích hoạt tài khoản và trả luôn token (tự đăng nhập)
        const res = await authService.verifyOtp({ email, otp: fullOtp, purpose });
        if (res.user) setUser(res.user);
        showToast('Xác thực thành công! Tài khoản đã được kích hoạt.');
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Mã OTP không chính xác');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      await authService.resendOtp({ email, purpose });
      setCountdown(60);
      setOtp(EMPTY_OTP);
      inputRefs.current[0]?.focus();
      showToast('Đã gửi lại mã OTP mới về email của bạn');
    } catch (err) {
      setError(err.message || 'Không thể gửi lại mã OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex flex-col text-ink transition-colors">
      <header className="bg-surface border-b border-line h-16">
        <div className="max-w-340 mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-accent text-white flex items-center justify-center">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="text-[18px] font-extrabold tracking-tight">SÂN NHÀ SPORT</span>
          </Link>

          <Link
            to="/login"
            className="text-[12.5px] font-bold text-accent hover:underline"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="bg-surface rounded-lg shadow-sm border border-line w-full max-w-115 p-6 md:p-8 space-y-6 text-center">
          <div className="w-14 h-14 rounded-full bg-accent-soft dark:bg-accent/20 text-accent mx-auto flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-xl md:text-2xl font-bold text-ink">
              {isReset ? 'Đặt Lại Mật Khẩu' : 'Xác Thực Mã OTP'}
            </h1>
            <p className="text-[13px] text-ink-muted mt-1.5 leading-relaxed">
              Mã xác thực 6 chữ số đã được gửi tới email <br />
              <strong className="text-ink dark:text-slate-200">{email}</strong>
            </p>
            {USE_MOCK ? (
              <p className="text-[11.5px] text-accent font-medium mt-1">
                (Mã OTP mẫu thử nghiệm: <strong>123456</strong>)
              </p>
            ) : (
              <p className="text-[11.5px] text-ink-subtle mt-1">
                Không thấy email? Hãy kiểm tra cả hộp thư Spam.
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 text-danger text-[12px] font-medium text-left">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            {/* 6 Digit Inputs */}
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-12 text-center text-xl font-bold rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line focus:outline-none focus:border-accent focus:ring-1 focus:ring-[#2f6bff]"
                />
              ))}
            </div>

            {isReset && (
              <div className="space-y-3 text-left">
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Từ 8 ký tự, gồm chữ và số"
                    className="w-full h-10 px-3 rounded-md bg-page dark:bg-surface-2 border border-line text-[13px] focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full h-10 px-3 rounded-md bg-page dark:bg-surface-2 border border-line text-[13px] focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.join('').length < 6}
              className="w-full h-10 rounded-md bg-accent hover:bg-accent-hover text-white text-[13.5px] font-bold shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <span>
                {loading
                  ? 'Đang xử lý...'
                  : isReset
                    ? 'Đổi Mật Khẩu'
                    : 'Xác Nhận & Tiếp Tục'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Resend Timer */}
          <div className="pt-2 text-[12.5px] text-ink-muted">
            {countdown > 0 ? (
              <span>Gửi lại mã sau <strong>{countdown}s</strong></span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-accent font-bold hover:underline flex items-center gap-1 mx-auto disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{resending ? 'Đang gửi...' : 'Gửi lại mã OTP'}</span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
