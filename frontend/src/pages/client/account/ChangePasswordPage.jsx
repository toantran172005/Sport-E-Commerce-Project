import { useState, useEffect } from 'react';
import { KeyRound, ShieldCheck, Mail, ArrowLeft, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { userService } from '../../../services/userService';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export default function ChangePasswordPage() {
  const { user, showToast } = useStore();
  const [step, setStep] = useState(1); // 1: Password Form, 2: OTP Verification
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Timer for OTP resend countdown
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  const targetEmail = user?.email || 'customer@example.com';

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 100) {
      showToast('Mật khẩu mới phải từ 8 đến 100 ký tự');
      return;
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      showToast('Mật khẩu mới phải chứa cả chữ cái và số');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp');
      return;
    }
    if (currentPassword === newPassword) {
      showToast('Mật khẩu mới không được trùng với mật khẩu hiện tại');
      return;
    }

    setIsLoading(true);
    try {
      await userService.sendOtp(targetEmail, 'CHANGE_PASSWORD');
      showToast(`Đã gửi mã xác thực OTP tới ${targetEmail}`);
      setStep(2);
      setCountdown(60);
      setCanResend(false);
      setOtp('');
    } catch (err) {
      showToast(err.message || 'Không thể gửi mã OTP, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isLoading) return;
    setIsLoading(true);
    try {
      await userService.sendOtp(targetEmail, 'CHANGE_PASSWORD');
      showToast(`Đã gửi lại mã OTP tới ${targetEmail}`);
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      showToast(err.message || 'Không thể gửi lại mã OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      showToast('Vui lòng nhập đủ 6 chữ số mã OTP');
      return;
    }

    setIsLoading(true);
    try {
      await userService.changePassword({
        oldPassword: currentPassword,
        newPassword,
        otp: otp.trim(),
      });
      showToast('Cập nhật mật khẩu mới thành công!');
      // Reset form and back to step 1
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
      setStep(1);
    } catch (err) {
      showToast(err.message || 'Mã OTP không hợp lệ hoặc đã hết hạn');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-line p-6 space-y-5 shadow-2xs">
      <div className="border-b border-line pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[17px] font-bold text-ink flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-accent" />
            <span>Đổi Mật Khẩu</span>
          </h2>
          <p className="text-[12.5px] text-ink-muted mt-0.5">
            {step === 1
              ? 'Để bảo mật tài khoản, mật khẩu mới cần có ít nhất 8 ký tự và bao gồm cả chữ và số'
              : 'Xác thực bảo mật 2 lớp qua mã OTP gửi tới email của bạn'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] font-bold">
          <span
            className={`px-2.5 py-1 rounded-full ${
              step === 1 ? 'bg-accent text-white' : 'bg-surface-2 text-ink-muted'
            }`}
          >
            1. Mật khẩu
          </span>
          <span className="text-ink-subtle">→</span>
          <span
            className={`px-2.5 py-1 rounded-full ${
              step === 2 ? 'bg-accent text-white' : 'bg-surface-2 text-ink-muted'
            }`}
          >
            2. Xác nhận OTP
          </span>
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={handleStep1Submit} className="space-y-4 max-w-md">
          {/* Mật khẩu hiện tại */}
          <div>
            <label className="block text-[12.5px] font-bold text-ink mb-1.5">
              Mật khẩu hiện tại <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại của bạn"
                className="w-full h-10 pl-3.5 pr-10 rounded-md bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink cursor-pointer"
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mật khẩu mới */}
          <div>
            <label className="block text-[12.5px] font-bold text-ink mb-1.5">
              Mật khẩu mới <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPw ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự, bao gồm cả chữ và số"
                className="w-full h-10 pl-3.5 pr-10 rounded-md bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink cursor-pointer"
              >
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11.5px] text-ink-subtle mt-1">
              Tiêu chuẩn bảo mật backend: từ 8-100 ký tự, chứa cả chữ cái và số.
            </p>
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div>
            <label className="block text-[12.5px] font-bold text-ink mb-1.5">
              Xác nhận mật khẩu mới <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPw ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full h-10 pl-3.5 pr-10 rounded-md bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink cursor-pointer"
              >
                {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-white text-[13px] font-bold shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang gửi mã OTP...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Tiếp tục & Gửi mã OTP</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleStep2Submit} className="space-y-4 max-w-md animate-in fade-in duration-200">
          <div className="p-3.5 rounded-md bg-accent-soft/40 border border-accent/20 text-ink space-y-1.5">
            <div className="flex items-center gap-2 text-[13px] font-bold text-accent">
              <Mail className="w-4 h-4" />
              <span>Xác nhận mã bảo mật OTP</span>
            </div>
            <p className="text-[12px] text-ink-muted">
              Mã xác thực 6 số đã được gửi tới email: <strong>{targetEmail}</strong>
            </p>
            <div className="pt-1 text-[11.5px] text-ink-subtle flex items-center justify-between">
              <span>Mã OTP thử nghiệm nhanh:</span>
              <code className="px-2 py-0.5 rounded bg-surface border border-line font-bold text-accent">
                123456
              </code>
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-bold text-ink mb-1.5">
              Nhập mã OTP (6 chữ số) <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              maxLength={6}
              required
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full h-11 px-3.5 rounded-md bg-page border border-line text-center text-[18px] tracking-[6px] font-bold text-ink focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center justify-between text-[12px]">
            <span className="text-ink-muted">
              {countdown > 0 ? (
                <span>Gửi lại mã sau {countdown}s</span>
              ) : (
                <span>Chưa nhận được mã?</span>
              )}
            </span>
            <button
              type="button"
              disabled={!canResend || isLoading}
              onClick={handleResendOtp}
              className="font-bold text-accent hover:underline disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Gửi lại mã OTP</span>
            </button>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
              }}
              className="px-4 py-2.5 rounded-md border border-line hover:bg-surface-2 text-ink text-[13px] font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="flex-1 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-white text-[13px] font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Xác Nhận Đổi Mật Khẩu</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
