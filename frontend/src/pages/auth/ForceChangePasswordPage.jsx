import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck, RefreshCw, Eye, EyeOff, LogOut } from 'lucide-react';
import BrandLogo from '../../components/common/BrandLogo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { userService } from '../../services/userService.js';
import { authService } from '../../services/authService.js';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/;

function PasswordField({ label, value, onChange, show, onToggle, placeholder }) {
  return (
    <div>
      <label className="block text-[12.5px] font-bold text-ink mb-1.5">
        {label} <span className="text-danger">*</span>
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 pl-3.5 pr-10 rounded-md bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink cursor-pointer"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

/**
 * Màn hình bắt buộc đổi mật khẩu ở lần đăng nhập đầu tiên
 * (tài khoản nhân viên do Admin tạo với mật khẩu mặc định).
 */
export default function ForceChangePasswordPage() {
  const { user, setUser } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) return <Navigate to="/login" replace />;
  if (!user.mustChangePassword) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8 || newPassword.length > 100) {
      showToast('Mật khẩu mới phải từ 8 đến 100 ký tự', 'error');
      return;
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      showToast('Mật khẩu mới phải chứa cả chữ cái và số', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp', 'error');
      return;
    }
    if (currentPassword === newPassword) {
      showToast('Mật khẩu mới không được trùng với mật khẩu mặc định', 'error');
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword({ oldPassword: currentPassword, newPassword });
      setUser({ ...user, mustChangePassword: false });
      showToast('Đổi mật khẩu thành công! Chào mừng bạn đến với hệ thống.', 'success');
      navigate(user.role === 'ADMIN' || user.role === 'STAFF' ? '/admin' : '/', { replace: true });
    } catch (err) {
      showToast(err.message || 'Không thể đổi mật khẩu, vui lòng thử lại', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    authService.logout().catch(() => {});
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4">
      <div className="w-full max-w-md bg-surface rounded-lg border border-line p-7 shadow-2xs space-y-5">
        <BrandLogo className="h-9 w-auto" />

        <div className="border-b border-line pb-4">
          <h1 className="text-[19px] font-bold text-ink flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-accent" />
            <span>Đổi mật khẩu lần đầu</span>
          </h1>
          <p className="text-[12.5px] text-ink-muted mt-1">
            Xin chào <b>{user.fullName || user.email}</b>, tài khoản của bạn đang dùng mật khẩu mặc định do quản trị
            viên cấp. Vui lòng đặt mật khẩu mới để tiếp tục sử dụng hệ thống.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            label="Mật khẩu hiện tại (mặc định)"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            onToggle={() => setShowCurrent(!showCurrent)}
            placeholder="Mật khẩu mặc định được quản trị viên cung cấp"
          />
          <div>
            <PasswordField
              label="Mật khẩu mới"
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              onToggle={() => setShowNew(!showNew)}
              placeholder="Tối thiểu 8 ký tự, gồm cả chữ và số"
            />
            <p className="text-[11.5px] text-ink-subtle mt-1">Từ 8-100 ký tự, chứa cả chữ cái và số.</p>
          </div>
          <PasswordField
            label="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            onToggle={() => setShowConfirm(!showConfirm)}
            placeholder="Nhập lại mật khẩu mới"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-md bg-accent hover:bg-accent-hover text-white text-[13px] font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang cập nhật...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Xác Nhận Đổi Mật Khẩu</span>
              </>
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-1.5 text-[12.5px] font-bold text-ink-muted hover:text-ink cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
