import { useState, useEffect, useRef } from 'react';
import { X, UserPlus, UserCheck, Shield } from 'lucide-react';
import { useUI } from '../../context/UIContext.jsx';
import { useStaff } from '../../context/StaffContext.jsx';

export default function AdminStaffModal() {
  const { activeModal, modalPayload, closeModal, showToast } = useUI();
  const { addStaff, updateStaff } = useStaff();

  const isStaffModal = activeModal === 'admin_staff_modal' || activeModal === 'staffForm';
  const editStaff = modalPayload?.staff;
  const isEditMode = Boolean(editStaff) && modalPayload?.mode !== 'create';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameInputRef = useRef(null);

  useEffect(() => {
    if (isStaffModal) {
      setFormError('');
      if (editStaff && isEditMode) {
        setFullName(editStaff.name || editStaff.fullName || '');
        setEmail(editStaff.email || '');
        setPhoneNumber(editStaff.phone || editStaff.phoneNumber || '');
        setStatus(editStaff.status || 'ACTIVE');
        setPassword('');
      } else {
        setFullName('');
        setEmail('');
        setPhoneNumber('');
        setStatus('ACTIVE');
        setPassword('');
      }
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
    }
  }, [isStaffModal, editStaff, isEditMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isStaffModal) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStaffModal, closeModal]);

  if (!isStaffModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await updateStaff(editStaff.id, {
          name: fullName.trim(),
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phoneNumber.trim(),
          phoneNumber: phoneNumber.trim(),
          status,
        });
        showToast(`Đã cập nhật nhân viên "${fullName.trim()}" thành công`, 'success');
      } else {
        await addStaff({
          name: fullName.trim(),
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phoneNumber.trim(),
          phoneNumber: phoneNumber.trim(),
          status,
          password: password.trim() || 'Staff@123',
          role: 'STAFF',
        });
        showToast(`Đã thêm nhân viên mới "${fullName.trim()}" thành công`, 'success');
      }
      closeModal();
    } catch (err) {
      setFormError(err.message || 'Không thể lưu thông tin nhân viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-surface rounded-xl w-full max-w-[520px] shadow-2xl border border-line overflow-hidden text-ink animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-surface-2/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent-soft text-accent flex items-center justify-center shrink-0">
              {isEditMode ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-ink">
                {isEditMode ? 'Chỉnh Sửa Thông Tin Nhân Viên' : 'Thêm Nhân Viên Mới'}
              </h3>
              <p className="text-[11.5px] text-ink-muted">
                {isEditMode ? `Mã nhân viên: #${editStaff.id}` : 'Khởi tạo tài khoản nhân viên (STAFF) quản trị'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="w-8 h-8 rounded-md bg-surface-2 hover:bg-surface-3 text-ink-muted hover:text-ink flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-[12.5px] font-semibold">
              {formError}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-[12px] font-bold text-ink-muted mb-1">
              Họ và tên nhân viên <span className="text-danger">*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn An"
              className="w-full h-10 px-3 rounded-lg bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
              required
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[12px] font-bold text-ink-muted mb-1">
                Email công việc <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@sannha.vn"
                className="w-full h-10 px-3 rounded-lg bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-ink-muted mb-1">
                Số điện thoại liên hệ <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0905123456"
                className="w-full h-10 px-3 rounded-lg bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
                required
              />
            </div>
          </div>

          {/* Role (Fixed Read-only) & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[12px] font-bold text-ink-muted mb-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-accent" />
                <span>Vai trò hệ thống</span>
              </label>
              <input
                type="text"
                value="Nhân viên (STAFF)"
                disabled
                className="w-full h-10 px-3 rounded-lg bg-surface-2 border border-line text-[13px] text-ink-muted font-bold cursor-not-allowed select-none"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-ink-muted mb-1">
                Trạng thái hoạt động
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-page border border-line text-[13px] font-bold text-ink focus:outline-none focus:border-accent"
              >
                <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                <option value="LOCKED">Bị khóa (LOCKED)</option>
              </select>
            </div>
          </div>

          {/* Initial Password (Create only) */}
          {!isEditMode && (
            <div>
              <label className="block text-[12px] font-bold text-ink-muted mb-1">
                Mật khẩu khởi tạo <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự, có chữ và số"
                className="w-full h-10 px-3 rounded-lg bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
                required
              />
              <p className="text-[11px] text-ink-muted mt-1">
                Mật khẩu phải từ 8 ký tự trở lên, gồm ít nhất 1 chữ cái và 1 chữ số.
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-line flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-lg bg-surface border border-line hover:bg-surface-2 text-[12.5px] font-bold text-ink transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Đang lưu...' : isEditMode ? 'Lưu Thay Đổi' : 'Thêm Nhân Viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
