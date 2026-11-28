/**
 * Tiện ích địa chỉ: ghép địa chỉ đầy đủ (bỏ cấp trống, ví dụ địa chỉ mới không có Quận/Huyện)
 * và chuẩn hóa chữ để tìm kiếm không dấu.
 */

/** Ghép "Số nhà, Phường, Quận, Tỉnh" từ địa chỉ có thể đặt tên trường kiểu cũ hoặc mới. */
export function formatFullAddress(addr) {
  if (!addr) return '';
  const parts = [addr.addressLine || addr.streetAddress, addr.ward, addr.district, addr.city || addr.province];
  return parts
    .map((p) => (p == null ? '' : String(p).trim()))
    .filter(Boolean)
    .join(', ');
}

/** Bỏ dấu, hạ chữ thường, đổi đ -> d để so khớp "ha noi" với "Hà Nội". */
export function normalizeText(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Bỏ tiền tố hành chính (tp., tỉnh, quận, phường, xã...) để so tên đã lưu với danh mục. */
export function stripAdminPrefix(text) {
  return normalizeText(text)
    .replace(/^(thanh pho|tp\.?|tinh|quan|q\.?|huyen|h\.?|thi xa|tx\.?|phuong|p\.?|xa|thi tran|tt\.?|dac khu)\s+/, '')
    .replace(/[^a-z0-9]/g, '');
}
