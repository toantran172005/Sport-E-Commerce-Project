import { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { userService } from '../../services/userService.js';
import Avatar from '../common/Avatar.jsx';
import AvatarCropModal from './AvatarCropModal.jsx';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PICK_BYTES = 10 * 1024 * 1024; // ảnh gốc chọn từ máy; ảnh gửi lên server đã được thu nhỏ còn vài chục KB

/**
 * Khối đổi ảnh đại diện ở trang hồ sơ: chọn ảnh → cắt/zoom → tải lên → cập nhật phiên đăng nhập
 * (header, menu tài khoản... đổi ảnh ngay và đồng bộ sang các tab khác).
 */
export default function AvatarUploader() {
  const { user, setUser, showToast } = useStore();
  const inputRef = useRef(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handlePick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // cho phép chọn lại đúng file vừa chọn
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      showToast('Ảnh phải có định dạng JPG, PNG hoặc WebP', 'error');
      return;
    }
    if (file.size > MAX_PICK_BYTES) {
      showToast('Ảnh tối đa 10 MB, vui lòng chọn ảnh nhỏ hơn', 'error');
      return;
    }
    setPendingFile(file);
  };

  const handleConfirm = async (blob) => {
    setUploading(true);
    try {
      const updated = await userService.uploadAvatar(blob);
      setUser(updated);
      setPendingFile(null);
      showToast('Đã cập nhật ảnh đại diện', 'success');
    } catch (err) {
      showToast(err.message || 'Không thể tải ảnh lên, vui lòng thử lại', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const updated = await userService.removeAvatar();
      setUser(updated);
      showToast('Đã xóa ảnh đại diện', 'success');
    } catch (err) {
      showToast(err.message || 'Không thể xóa ảnh, vui lòng thử lại', 'error');
    } finally {
      setRemoving(false);
    }
  };

  const busy = uploading || removing;

  return (
    <div className="flex items-center gap-5 pb-5 border-b border-line">
      <div className="relative shrink-0">
        <Avatar user={user} size={96} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label="Đổi ảnh đại diện"
          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent hover:bg-accent-hover text-white border-2 border-surface flex items-center justify-center shadow-xs transition disabled:opacity-60"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      <div className="min-w-0">
        <p className="text-[13.5px] font-bold text-ink">Ảnh đại diện</p>
        <p className="text-[12px] text-ink-muted mt-0.5">
          JPG, PNG hoặc WebP. Bạn có thể kéo và phóng to để chọn vùng hiển thị.
        </p>
        <div className="flex flex-wrap gap-2 mt-2.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="px-3.5 py-1.5 rounded-md border border-line bg-surface hover:bg-surface-2 text-[12.5px] font-semibold text-ink transition disabled:opacity-60"
          >
            Chọn ảnh
          </button>
          {user?.avatarUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className="px-3.5 py-1.5 rounded-md text-[12.5px] font-semibold text-danger hover:bg-danger-soft transition disabled:opacity-60 inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {removing ? 'Đang xóa...' : 'Xóa ảnh'}
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handlePick}
      />

      {pendingFile && (
        <AvatarCropModal
          file={pendingFile}
          saving={uploading}
          onCancel={() => setPendingFile(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
