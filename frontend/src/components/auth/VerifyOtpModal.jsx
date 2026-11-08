import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, X, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { authService } from '../../services/authService.js';
import { USE_MOCK } from '../../config/env.js';

export default function VerifyOtpModal() {
  const { activeModal, modalPayload, closeModal, showToast, user, setUser } = useStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRefs = useRef([]);

  useEffect(() => {
    if (activeModal === 'verify_otp_modal') {
      setOtp(['', '', '', '', '', '']);
      setError('');
      setCountdown(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [activeModal]);

  useEffect(() => {
    if (activeModal !== 'verify_otp_modal') return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeModal]);

  if (activeModal !== 'verify_otp_modal') return null;

  const email = modalPayload?.email || user?.email || 'toantran@gmail.com';

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

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số OTP');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await authService.verifyOtp({ email, otp: fullOtp, purpose: 'REGISTER' });
      if (res.user) setUser(res.user);
      showToast('Xác thực mã OTP thành công!');
      closeModal();
    } catch (err) {
      setError(err.message || 'Mã OTP không chính xác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-surface rounded-lg w-full max-w-[460px] p-6 shadow-2xl border border-line relative animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={closeModal}
          className="w-8 h-8 rounded-md bg-surface-2 dark:bg-surface-2 text-slate-500 hover:text-slate-700 flex items-center justify-center absolute top-4 right-4 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-accent-soft dark:bg-accent/20 text-accent mx-auto flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-ink">
              Xác Thực Mã OTP
            </h2>
            <p className="text-[12.5px] text-ink-muted mt-1">
              Mã xác thực đã được gửi tới email <br />
              <strong className="text-ink dark:text-slate-200">{email}</strong>
            </p>
            {USE_MOCK && (
              <p className="text-[11.5px] text-accent font-medium mt-1">
                (Mã OTP mẫu: <strong>123456</strong>)
              </p>
            )}
          </div>

          {error && (
            <div className="p-2.5 rounded-md bg-red-50 dark:bg-red-950/30 text-danger text-[12px] font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="flex justify-center gap-2">
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
                  className="w-10 h-11 text-center text-lg font-bold rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line focus:outline-none focus:border-accent"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length < 6}
              className="w-full h-10 rounded-md bg-accent hover:bg-accent-hover text-white text-[13px] font-bold shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <span>{loading ? 'Đang xác thực...' : 'Xác Nhận'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-[12px] text-ink-subtle">
            {countdown > 0 ? (
              <span>Gửi lại sau {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await authService.resendOtp({ email, purpose: 'REGISTER' });
                    setCountdown(60);
                    showToast('Đã gửi lại mã OTP về email của bạn');
                  } catch (err) {
                    setError(err.message || 'Không thể gửi lại mã OTP');
                  }
                }}
                className="text-accent font-bold hover:underline"
              >
                Gửi lại mã OTP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
