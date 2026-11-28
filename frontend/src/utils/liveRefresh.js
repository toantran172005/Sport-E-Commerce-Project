/**
 * Kênh nội bộ phía trình duyệt: khi server báo qua SSE rằng một nhóm dữ liệu (orders, refunds...) vừa đổi,
 * NotificationContext phát tín hiệu ở đây và các nơi cần dữ liệu đó tự tải lại.
 * Gộp (debounce) các tín hiệu dồn dập để một loạt thay đổi chỉ gây một lần tải lại.
 */
const bus = new EventTarget();

export function emitLiveRefresh(topic) {
  if (!topic) return;
  bus.dispatchEvent(new CustomEvent('refresh', { detail: String(topic) }));
}

/** Đăng ký nhận tín hiệu của một nhóm dữ liệu; trả về hàm hủy đăng ký. */
export function onLiveRefresh(topic, handler, debounceMs = 600) {
  let timer = null;
  const listener = (e) => {
    if (e.detail !== topic) return;
    clearTimeout(timer);
    timer = setTimeout(handler, debounceMs);
  };
  bus.addEventListener('refresh', listener);
  return () => {
    clearTimeout(timer);
    bus.removeEventListener('refresh', listener);
  };
}
