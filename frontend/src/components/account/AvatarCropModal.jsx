import { useEffect, useRef, useState } from 'react';
import { X, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';

const BOX = 280; // cạnh khung cắt hiển thị (px)
const OUTPUT = 512; // cạnh ảnh vuông xuất ra (px)
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Khung cắt ảnh đại diện: kéo để di chuyển, thanh trượt / cuộn chuột / nút +- để phóng to.
 * Phần nằm trong vòng tròn là vùng được giữ lại. Xác nhận → trả về Blob JPEG vuông 512x512.
 */
export default function AvatarCropModal({ file, saving = false, onCancel, onConfirm }) {
  const [url, setUrl] = useState('');
  const [img, setImg] = useState(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // vị trí góc trên-trái của ảnh so với khung
  const [error, setError] = useState('');
  const drag = useRef(null);

  // Đọc ảnh, đặt vừa khung (phủ kín cạnh ngắn) và căn giữa
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    let cancelled = false;
    image.onload = () => {
      if (cancelled) return;
      const base = BOX / Math.min(image.naturalWidth, image.naturalHeight);
      setImg(image);
      setUrl(objectUrl);
      setZoom(MIN_ZOOM);
      setOffset({
        x: (BOX - image.naturalWidth * base) / 2,
        y: (BOX - image.naturalHeight * base) / 2,
      });
    };
    image.onerror = () => {
      if (!cancelled) setError('Không đọc được ảnh này, vui lòng chọn ảnh khác');
    };
    image.src = objectUrl;
    return () => {
      cancelled = true;
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  // Khóa cuộn trang nền khi mở khung; Esc để đóng
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape' && !saving) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [saving, onCancel]);

  const natW = img?.naturalWidth ?? 1;
  const natH = img?.naturalHeight ?? 1;
  const baseScale = BOX / Math.min(natW, natH);
  const scale = baseScale * zoom;
  const dispW = natW * scale;
  const dispH = natH * scale;

  // Ảnh luôn phải phủ kín khung (không để lộ khoảng trống)
  const clampOffset = (o, w, h) => ({ x: clamp(o.x, BOX - w, 0), y: clamp(o.y, BOX - h, 0) });

  const changeZoom = (next) => {
    const z = clamp(next, MIN_ZOOM, MAX_ZOOM);
    if (!img || z === zoom) return;
    const newScale = baseScale * z;
    // Giữ nguyên điểm đang nằm ở tâm khung khi phóng to/thu nhỏ
    const cx = (BOX / 2 - offset.x) / scale;
    const cy = (BOX / 2 - offset.y) / scale;
    setZoom(z);
    setOffset(
      clampOffset({ x: BOX / 2 - cx * newScale, y: BOX / 2 - cy * newScale }, natW * newScale, natH * newScale)
    );
  };

  const handlePointerDown = (e) => {
    if (!img || saving) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const handlePointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    setOffset(clampOffset({ x: d.ox + e.clientX - d.x, y: d.oy + e.clientY - d.y }, dispW, dispH));
  };
  const endDrag = () => {
    drag.current = null;
  };

  const handleConfirm = () => {
    if (!img || saving) return;
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, OUTPUT, OUTPUT);
    ctx.imageSmoothingQuality = 'high';

    // Vùng của ảnh gốc đang nằm trong khung cắt
    const size = BOX / scale;
    const sx = clamp(-offset.x / scale, 0, natW - size);
    const sy = clamp(-offset.y / scale, 0, natH - size);
    ctx.drawImage(img, sx, sy, size, size, 0, 0, OUTPUT, OUTPUT);

    canvas.toBlob(
      (blob) => {
        if (blob) onConfirm(blob);
        else setError('Không xử lý được ảnh, vui lòng thử ảnh khác');
      },
      'image/jpeg',
      0.9
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chỉnh sửa ảnh đại diện"
        className="w-full max-w-sm bg-surface rounded-lg border border-line shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
          <h3 className="text-[15px] font-bold text-ink">Chỉnh sửa ảnh đại diện</h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            aria-label="Đóng"
            className="p-1.5 rounded-md text-ink-muted hover:bg-surface-2 transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div
            className="relative mx-auto overflow-hidden rounded-lg bg-black touch-none select-none cursor-grab active:cursor-grabbing"
            style={{ width: BOX, height: BOX }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onWheel={(e) => changeZoom(zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1))}
          >
            {img && (
              <img
                src={url}
                alt=""
                draggable={false}
                className="absolute max-w-none pointer-events-none"
                style={{ left: offset.x, top: offset.y, width: dispW, height: dispH }}
              />
            )}
            {!img && !error && (
              <div className="absolute inset-0 flex items-center justify-center text-white/70">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
            {/* Vòng tròn: phần bên ngoài được làm tối để thấy vùng sẽ hiển thị */}
            <div
              className="absolute inset-0 rounded-full border-2 border-white/90 pointer-events-none"
              style={{ boxShadow: '0 0 0 999px rgba(0, 0, 0, 0.55)' }}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => changeZoom(zoom - 0.25)}
              disabled={!img || saving}
              aria-label="Thu nhỏ"
              className="p-1.5 rounded-md text-ink-muted hover:bg-surface-2 transition disabled:opacity-50"
            >
              <ZoomOut className="w-4.5 h-4.5" />
            </button>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step="0.01"
              value={zoom}
              disabled={!img || saving}
              onChange={(e) => changeZoom(Number(e.target.value))}
              aria-label="Phóng to / thu nhỏ"
              className="flex-1 accent-accent"
            />
            <button
              type="button"
              onClick={() => changeZoom(zoom + 0.25)}
              disabled={!img || saving}
              aria-label="Phóng to"
              className="p-1.5 rounded-md text-ink-muted hover:bg-surface-2 transition disabled:opacity-50"
            >
              <ZoomIn className="w-4.5 h-4.5" />
            </button>
          </div>

          {error ? (
            <p className="text-[12px] text-danger text-center">{error}</p>
          ) : (
            <p className="text-[11.5px] text-ink-subtle text-center">
              Kéo ảnh để di chuyển, kéo thanh trượt hoặc cuộn chuột để phóng to.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-line bg-surface-2/40">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 rounded-md border border-line text-[13px] font-semibold text-ink hover:bg-surface-2 transition disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!img || saving}
            className="px-5 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-[13px] font-bold shadow-xs transition disabled:opacity-60 inline-flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Đang tải lên...' : 'Lưu ảnh'}
          </button>
        </div>
      </div>
    </div>
  );
}
