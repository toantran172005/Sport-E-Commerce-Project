import { useState } from 'react';
import { KeyRound, ShieldCheck, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { userService } from '../../../services/userService';

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

export default function ChangePasswordPage() {
  const { showToast } = useStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
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
      await userService.changePassword({ oldPassword: currentPassword, newPassword });
      showToast('Cập nhật mật khẩu mới thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message || 'Không thể đổi mật khẩu, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-line p-6 space-y-5 shadow-2xs">
      <div className="border-b border-line pb-4">
        <h2 className="text-[17px] font-bold text-ink flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-accent" />
          <span>Đổi Mật Khẩu</span>
        </h2>
        <p className="text-[12.5px] text-ink-muted mt-0.5">
          Để bảo mật tài khoản, mật khẩu mới cần có ít nhất 8 ký tự và bao gồm cả chữ và số
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <PasswordField
          label="Mật khẩu hiện tại"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrentPw}
          onToggle={() => setShowCurrentPw(!showCurrentPw)}
          placeholder="Nhập mật khẩu hiện tại của bạn"
        />

        <div>
          <PasswordField
            label="Mật khẩu mới"
            value={newPassword}
            onChange={setNewPassword}
            show={showNewPw}
            onToggle={() => setShowNewPw(!showNewPw)}
            placeholder="Tối thiểu 8 ký tự, bao gồm cả chữ và số"
          />
          <p className="text-[11.5px] text-ink-subtle mt-1">
            Tiêu chuẩn bảo mật backend: từ 8-100 ký tự, chứa cả chữ cái và số.
          </p>
        </div>

        <PasswordField
          label="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirmPw}
          onToggle={() => setShowConfirmPw(!showConfirmPw)}
          placeholder="Nhập lại mật khẩu mới"
        />

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-white text-[13px] font-bold shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
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
        </div>
      </form>
    </div>
  );
}
