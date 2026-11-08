import { useState } from 'react';
import { useStore } from '../../../context/StoreContext';

export default function ProfilePage() {
  const { user, setUser, showToast } = useStore();

  const [fullName, setFullName] = useState(user?.fullName || user?.name || 'Trần Thanh Toàn');
  const [email, setEmail] = useState(user?.email || 'toantran@gmail.com');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || user?.phone || '0912 345 678');
  const [gender, setGender] = useState(user?.gender || 'MALE');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '1998-05-15');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUser((prev) => ({
      ...prev,
      fullName,
      name: fullName,
      email,
      phoneNumber,
      phone: phoneNumber,
      gender,
      dateOfBirth,
    }));
    showToast('Đã lưu thông tin hồ sơ cá nhân thành công!');
  };

  return (
    <div className="bg-surface rounded-lg border border-line p-6 space-y-6 shadow-2xs">
      <div className="border-b border-line pb-4">
        <h2 className="text-[17px] font-bold text-ink">Hồ Sơ Của Tôi</h2>
        <p className="text-[12.5px] text-ink-muted">
          Quản lý thông tin hồ sơ để bảo mật và tối ưu trải nghiệm mua sắm
        </p>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3.5 rounded-md bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-bold text-ink mb-1.5">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full h-10 px-3.5 rounded-md bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
            />
          </div>
        </div>

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
              <option value="OTHER">Khác (Other)</option>
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
            className="px-6 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-white text-[13px] font-bold shadow-xs transition"
          >
            Lưu Thay Đổi
          </button>
        </div>
      </form>
    </div>
  );
}
