import { useState, useRef } from 'react';
import { Zap, X } from 'lucide-react';
import { useChatbot } from '../../context/ChatbotContext';

export default function ChatbotLauncher({ onPositionChange }) {
  const { isOpen, toggle, unreadCount } = useChatbot();

  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
    hasMoved: false,
  });
  const buttonRef = useRef(null);

  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragRef.current = {
      isDown: true,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: rect.left,
      initialTop: rect.top,
      hasMoved: false,
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
        const buttonSize = 58;
        const maxLeft = window.innerWidth - buttonSize - 12;
        const maxTop = window.innerHeight - buttonSize - 12;

        const nextLeft = Math.max(12, Math.min(maxLeft, dragRef.current.initialLeft + dx));
        const nextTop = Math.max(12, Math.min(maxTop, dragRef.current.initialTop + dy));

        const nextPos = { left: nextLeft, top: nextTop };
        setPosition(nextPos);
        if (onPositionChange) onPositionChange(nextPos);
      }
    };

    const handlePointerUp = () => {
      if (dragRef.current.isDown) {
        dragRef.current.isDown = false;
        setTimeout(() => setIsDragging(false), 50);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
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
    : { right: '24px', bottom: '24px' };

  return (
    <aside
      aria-label="Trợ lý ảo hỗ trợ khách hàng"
      style={style}
      className="fixed z-40 flex flex-col items-end pointer-events-auto select-none print:hidden touch-none"
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
            {/* Logo Sân Nhà Sport Assistant */}
            <div className="w-8 h-8 rounded-full bg-white text-accent flex items-center justify-center shadow-inner">
              <Zap className="w-4 h-4 fill-accent stroke-accent" />
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
