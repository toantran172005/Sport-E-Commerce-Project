/**
 * Utility functions for Vietnamese localization, currency, dates and phone formatting.
 * Uses memoized Intl singletons for high performance.
 */

const currencyFormatter = new Intl.NumberFormat('vi-VN');

const deliveryDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'Asia/Ho_Chi_Minh',
});

/**
 * Định dạng tiền tệ Việt Nam (VND)
 */
export function formatCurrency(amount) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '0 ₫';
  return `${currencyFormatter.format(Math.round(amount))} ₫`;
}

/**
 * Định dạng ngày giờ chuẩn tiếng Việt với múi giờ cố định Asia/Ho_Chi_Minh
 */
export function formatDateTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return d.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Định dạng ngày (không kèm giờ) với múi giờ cố định Asia/Ho_Chi_Minh
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Định dạng ngày giao hàng dự kiến chuẩn tiếng Việt (Thứ..., dd/MM/yyyy)
 */
export function formatEstimatedDelivery(dateLike) {
  if (!dateLike) return '';
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(d.getTime())) return String(dateLike);
  return deliveryDateFormatter.format(d);
}

/**
 * Định dạng số điện thoại Việt Nam
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}
