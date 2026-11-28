import { useEffect, useRef } from 'react';
import { onLiveRefresh } from '../utils/liveRefresh.js';

/**
 * Chạy handler mỗi khi server báo nhóm dữ liệu `topic` đã thay đổi (qua SSE).
 * Tab đang ẩn thì hoãn đến khi người dùng quay lại để không tải thừa.
 */
export function useLiveRefresh(topic, handler, debounceMs = 600) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    let pending = false;
    const run = () => {
      if (document.visibilityState === 'visible') {
        handlerRef.current?.();
      } else {
        pending = true;
      }
    };
    const onVisible = () => {
      if (pending && document.visibilityState === 'visible') {
        pending = false;
        handlerRef.current?.();
      }
    };
    const off = onLiveRefresh(topic, run, debounceMs);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      off();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [topic, debounceMs]);
}

export default useLiveRefresh;
