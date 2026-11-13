import { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { userService } from '../../../services/userService';
import AvatarUploader from '../../../components/account/AvatarUploader.jsx';

export default function ProfilePage() {
  const { user, setUser, showToast } = useStore();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [gender, setGender] = useState(user?.gender || 'MALE');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [saving, setSaving] = useState(false);

  // Mở trang → lấy hồ sơ mới nhất từ backend (GET /api/users/me)
  useEffect(() => {
    let cancelled = false;
    userService
      .getProfile()
      .then((profile) => {
        if (cancelled || !profile) return;
        setUser(profile);
        setFullName(profile.fullName || '');
        setGender(profile.gender || 'MALE');
        setDateOfBirth(profile.dateOfBirth || '');
      })
      .catch((err) => {
        if (!cancelled) showToast(err.message || 'Không tải được hồ sơ cá nhân', 'error');
      });
    return () => {
      cancelled = true;
    };
  }, [setUser, showToast]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Họ và tên không được để trống', 'error');
      return;
    }

    setSaving(true);
    try {
      const updated = await userService.updateProfile({
        fullName: fullName.trim(),
        gender,
        // Ngày sinh rỗng phải gửi undefined (chuỗi rỗng làm backend lỗi định dạng LocalDate)
        dateOfBirth: dateOfBirth || undefined,
      });
      setUser(updated);
      showToast('Đã lưu thông tin hồ sơ cá nhân thành công!', 'success');
    } catch (err) {
      showToast(err.message || 'Không thể lưu hồ sơ, vui lòng thử lại', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-line p-6 space-y-6 shadow-2xs">
      <div className="border-b border-line pb-4">
        <h2 className="text-[17px] font-bold text-ink">Hồ Sơ Của Tôi</h2>
        <p className="text-[12.5px] text-ink-muted">
          Quản lý thông tin hồ sơ để bảo mật và tối ưu trải nghiệm mua sắm
        </p>
      </div>

      <div className="max-w-xl">
        <AvatarUploader />
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-[12.5px] font-bold text-ink mb-1.5">
            Họ và tên
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-10 px-3.5 rounded-md bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12.5px] font-bold text-ink mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              disabled
              className="w-full h-10 px-3.5 rounded-md bg-surface-2 border border-line text-[13px] text-ink-muted cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-bold text-ink mb-1.5">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={user?.phoneNumber || ''}
              readOnly
              disabled
              className="w-full h-10 px-3.5 rounded-md bg-surface-2 border border-line text-[13px] text-ink-muted cursor-not-allowed"
            />
          </div>
        </div>
        <p className="text-[11.5px] text-ink-subtle -mt-2">
          Email và số điện thoại chỉ đổi được qua xác thực OTP nên không chỉnh sửa trực tiếp tại đây.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12.5px] font-bold text-ink mb-1.5">
              Giới tính
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full h-10 px-3.5 rounded-md bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
            >
              <option value="MALE">Nam (Male)</option>
              <option value="FEMALE">Nữ (Female)</option>
            </select>
          </div>

          <div>
            <label className="block text-[12.5px] font-bold text-ink mb-1.5">
              Ngày sinh
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full h-10 px-3.5 rounded-md bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-white text-[13px] font-bold shadow-xs transition disabled:opacity-60"
          >
            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
