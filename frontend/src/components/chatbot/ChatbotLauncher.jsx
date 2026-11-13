import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import BrandLogo from '../common/BrandLogo.jsx';
import { useChatbot } from '../../context/ChatbotContext';

const BUTTON_SIZE = 56; // kích thước button tròn = w-14 (px)
const EDGE_GAP = 12; // khoảng cách tối thiểu từ button đến mép màn hình khi đang kéo (px)
const SNAP_GAP = 24; // khoảng cách giữ lại so với viền trái/phải sau khi thả chuột (px)
const SNAP_MS = 220; // thời gian trượt về viền (ms)

export default function ChatbotLauncher({ onPositionChange }) {
  const { isOpen, toggle, unreadCount } = useChatbot();
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  // Viền đang bám: 'left' | 'right' (mặc định nút nằm ở viền phải)
  const sideRef = useRef('right');
  const snapTimerRef = useRef(null);
  const dragRef = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
    hasMoved: false,
    lastPos: null,
  });
  const buttonRef = useRef(null);

  const leftForSide = (side) =>
    side === 'left' ? SNAP_GAP : window.innerWidth - BUTTON_SIZE - SNAP_GAP;
  const clampTop = (top) =>
    Math.max(EDGE_GAP, Math.min(window.innerHeight - BUTTON_SIZE - EDGE_GAP, top));

  // Đổi kích thước cửa sổ: giữ nút bám đúng viền đang bám, không để tụt ra ngoài màn hình
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return prev;
        const next = { left: leftForSide(sideRef.current), top: clampTop(prev.top) };
        if (onPositionChange) onPositionChange(next);
        return next;
      });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(snapTimerRef.current);
    };
  }, [onPositionChange]);

  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    clearTimeout(snapTimerRef.current);
    setIsSnapping(false);

    dragRef.current = {
      isDown: true,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: rect.left,
      initialTop: rect.top,
      hasMoved: false,
      lastPos: null,
    };

    const handlePointerMove = (moveEvent) => {
      if (!dragRef.current.isDown) return;
      const dx = moveEvent.clientX - dragRef.current.startX;
      const dy = moveEvent.clientY - dragRef.current.startY;

      if (!dragRef.current.hasMoved && Math.hypot(dx, dy) > 5) {
        dragRef.current.hasMoved = true;
        setIsDragging(true);
      }

      if (dragRef.current.hasMoved) {
        // Đang kéo: đi theo chuột tự do để chọn độ cao
        const maxLeft = window.innerWidth - BUTTON_SIZE - EDGE_GAP;
        const nextLeft = Math.max(EDGE_GAP, Math.min(maxLeft, dragRef.current.initialLeft + dx));
        const nextTop = clampTop(dragRef.current.initialTop + dy);

        const nextPos = { left: nextLeft, top: nextTop };
        dragRef.current.lastPos = nextPos;
        setPosition(nextPos);
        if (onPositionChange) onPositionChange(nextPos);
      }
    };

    const handlePointerUp = () => {
      if (!dragRef.current.isDown) return;
      dragRef.current.isDown = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);

      const last = dragRef.current.lastPos;
      if (dragRef.current.hasMoved && last) {
        // Thả chuột: giữ nguyên độ cao (top), hút ngang về viền trái/phải gần nhất
        const centerX = last.left + BUTTON_SIZE / 2;
        sideRef.current = centerX < window.innerWidth / 2 ? 'left' : 'right';
        const snapped = { left: leftForSide(sideRef.current), top: last.top };
        setIsSnapping(true);
        setPosition(snapped);
        if (onPositionChange) onPositionChange(snapped);
        snapTimerRef.current = setTimeout(() => setIsSnapping(false), SNAP_MS);
      }
      setTimeout(() => setIsDragging(false), 50);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  const handleClick = (e) => {
    if (dragRef.current.hasMoved || isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    toggle();
  };

  const style = position
    ? { left: `${position.left}px`, top: `${position.top}px` }
    : { right: `${SNAP_GAP}px`, bottom: '24px' };

  return (
    <aside
      aria-label="Trợ lý ảo hỗ trợ khách hàng"
      style={style}
      className={`fixed z-40 flex flex-col items-end pointer-events-auto select-none print:hidden touch-none ${
        isSnapping ? 'transition-[left,top] duration-200 ease-out' : ''
      }`}
    >
      <button
        ref={buttonRef}
        type="button"
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        aria-label={isOpen ? 'Đóng cửa sổ trợ lý ảo' : 'Mở cửa sổ trợ lý ảo'}
        aria-expanded={isOpen}
        aria-controls="chatbot-panel"
        title="Bấm để mở chat • Giữ chuột để di chuyển vị trí"
        className={`relative flex items-center justify-center w-14 h-14 rounded-full bg-accent text-accent-contrast shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-150 focus:outline-hidden focus:ring-4 focus:ring-accent/30 ${
          isDragging ? 'cursor-grabbing scale-110 shadow-2xl' : 'cursor-grab'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
        ) : (
          <div className="flex flex-col items-center justify-center pointer-events-none">
            {/* Logo Delta Sport Assistant */}
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-inner">
              <BrandLogo variant="mark" className="w-5 h-5 object-contain" alt="Delta Sport" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-tight text-white mt-0.5">
              BOT
            </span>
          </div>
        )}

        {!isOpen && unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-danger text-white text-[11px] font-black flex items-center justify-center border-2 border-surface animate-bounce"
            aria-label={`${unreadCount} tin nhắn mới`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </aside>
  );
}
