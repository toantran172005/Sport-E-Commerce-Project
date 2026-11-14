import { useState } from 'react';

/** Chữ cái đầu của họ và tên (vd "Phan Chí Toàn" → "PT"; một từ → 1 chữ). */
function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Ảnh lưu trên Cloudinary: chèn phép biến đổi vào URL để trình duyệt chỉ tải đúng kích thước cần
 * (cắt vuông, tối đa 2x kích thước hiển thị cho màn hình retina, định dạng và chất lượng tự động).
 */
function optimizeUrl(url, size) {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  const px = [64, 128, 256, 512].find((s) => s >= size * 2) ?? 512;
  return url.replace('/upload/', `/upload/c_fill,w_${px},h_${px},f_auto,q_auto/`);
}

/**
 * Ảnh đại diện dùng chung. Chưa có ảnh (hoặc ảnh lỗi) thì hiện chữ cái đầu của tên.
 *
 *   <Avatar user={user} size={40} />
 *   <Avatar src={review.user.avatarUrl} name={review.user.fullName} size={32} />
 */
export default function Avatar({ user, src, name, size = 40, className = '' }) {
  const rawUrl = src !== undefined ? src : user?.avatarUrl;
  const label = name ?? user?.fullName ?? user?.name ?? '';
  const [failedUrl, setFailedUrl] = useState(null);

  const url = rawUrl ? optimizeUrl(rawUrl, size) : null;
  const dimension = { width: size, height: size };

  if (url && failedUrl !== url) {
    return (
      <img
        src={url}
        alt={label || 'Ảnh đại diện'}
        style={dimension}
        className={`rounded-full object-cover shrink-0 bg-surface-2 ${className}`}
        draggable={false}
        onError={() => setFailedUrl(url)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={label || 'Ảnh đại diện'}
      style={{ ...dimension, fontSize: Math.max(10, Math.round(size * 0.4)) }}
      className={`rounded-full bg-accent text-white font-bold flex items-center justify-center shrink-0 select-none ${className}`}
    >
      {getInitials(label)}
    </div>
  );
}
