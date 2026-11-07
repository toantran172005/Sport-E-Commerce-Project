import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  PackageCheck,
  Tag,
  MessageSquare,
  Info,
  CheckCheck,
  Clock,
  Check,
  X,
} from 'lucide-react';
import { useNotification, useUI } from '../../context';
import { formatDateTime } from '../../utils/formatters.js';

export default function NotificationsDropdown() {
  const { notifications, markAllNotificationsRead, markNotificationAsRead } = useNotification();
  const { isNotificationsOpen, setIsNotificationsOpen } = useUI();

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isDetailOpen) {
          setIsDetailOpen(false);
        } else if (isNotificationsOpen) {
          setIsNotificationsOpen(false);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDetailOpen, isNotificationsOpen, setIsNotificationsOpen]);

  // Lock body scroll when detail modal is open
  useEffect(() => {
    if (!isDetailOpen) return undefined;
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isDetailOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ORDER_UPDATE':
      case 'NEW_ORDER':
        return <PackageCheck className="w-4 h-4 text-accent" />;
      case 'PROMOTION':
        return <Tag className="w-4 h-4 text-danger" />;
      case 'REVIEW_REPLY':
        return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-ink-muted" />;
    }
  };

  const getNotificationMeta = (type) => {
    switch (type) {
      case 'ORDER_UPDATE':
      case 'NEW_ORDER':
        return {
          label: 'Đơn hàng',
          badge: 'bg-accent-soft text-accent border border-accent/20',
          iconBox: 'bg-accent-soft text-accent',
        };
      case 'PROMOTION':
        return {
          label: 'Khuyến mãi',
          badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
          iconBox: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        };
      case 'REVIEW_REPLY':
        return {
          label: 'Đánh giá',
          badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
          iconBox: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        };
      default:
        return {
          label: 'Hệ thống',
          badge: 'bg-surface-2 text-ink-muted border border-line',
          iconBox: 'bg-surface-2 text-ink-muted',
        };
    }
  };

  const handleItemClick = (item) => {
    // Đánh dấu đã đọc thông báo này
    markNotificationAsRead(item.id);
    setSelectedNotification({ ...item, isRead: true });
    // Đóng dropdown popover và mở modal chi tiết (tuyệt đối không điều hướng)
    setIsNotificationsOpen(false);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedNotification(null);
  };

  return (
    <>
      {/* Notifications Popover Dropdown */}
      {isNotificationsOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsNotificationsOpen(false)}
          />

          <div className="absolute right-0 top-[calc(100%+8px)] w-[380px] max-w-[92vw] bg-surface rounded-lg shadow-xl border border-line z-50 overflow-hidden animate-in fade-in duration-150 text-ink">
            {/* Header */}
            <div className="px-4 py-3 border-b border-line flex items-center justify-between bg-surface-2/30">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-ink">Thông Báo</h3>
                {unreadCount > 0 && (
                  <span className="bg-accent text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="text-[12px] font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Đã đọc tất cả</span>
              </button>
            </div>

            {/* Notification items list */}
            <div className="divide-y divide-line max-h-[380px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((item) => {
                  const isUnread = !item.isRead;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`px-4 py-3 flex items-start gap-2.5 cursor-pointer transition ${
                        isUnread
                          ? 'bg-accent-soft/30 hover:bg-accent-soft/60 text-ink'
                          : 'bg-surface/50 text-ink-muted opacity-65 hover:opacity-100 hover:bg-surface-2'
                      }`}
                    >
                      {/* Chấm tròn đỏ viền mờ phát sáng cho thông báo chưa đọc */}
                      <span className="mt-1.5 flex h-2 w-2 shrink-0 items-center justify-center">
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)] ring-4 ring-danger/20" />
                        )}
                      </span>

                      {/* Icon */}
                      <div className="w-8 h-8 rounded-md bg-surface border border-line flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {getNotificationIcon(item.type)}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-[13px] line-clamp-1 ${
                            isUnread ? 'font-bold text-ink' : 'font-medium text-ink-muted'
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-[12px] text-ink-muted line-clamp-2 mt-0.5 leading-relaxed">
                          {item.content}
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-1.5">
                          <span className="text-[10.5px] text-ink-subtle flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDateTime(item.createdAt)}</span>
                          </span>
                          {isUnread && (
                            <span className="text-[10px] font-extrabold text-danger bg-danger/10 px-1.5 py-0.2 rounded-full">
                              Mới
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-[13px] text-ink-subtle">
                  Không có thông báo nào
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal Chi Tiết Thông Báo (Chỉ có duy nhất 1 nút Xác nhận, không điều hướng) */}
      {isDetailOpen &&
        selectedNotification &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
            onClick={handleCloseDetail}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Chi tiết thông báo"
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-lg shadow-2xl border border-line w-full max-w-md overflow-hidden text-ink animate-in zoom-in-95 duration-150"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-line flex items-start justify-between gap-3 bg-surface-2/30">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-line ${
                      getNotificationMeta(selectedNotification.type).iconBox
                    }`}
                  >
                    {getNotificationIcon(selectedNotification.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                          getNotificationMeta(selectedNotification.type).badge
                        }`}
                      >
                        {getNotificationMeta(selectedNotification.type).label}
                      </span>
                      <span className="text-[11px] text-ink-subtle flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDateTime(selectedNotification.createdAt)}</span>
                      </span>
                    </div>
                    <h3 className="text-[15px] font-extrabold text-ink leading-snug">
                      {selectedNotification.title}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseDetail}
                  className="p-1.5 rounded-md text-ink-subtle hover:text-ink hover:bg-surface-2 transition cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 max-h-[50vh] overflow-y-auto">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-subtle mb-2">
                  Nội dung chi tiết
                </p>
                <div className="p-4 rounded-md bg-page border border-line text-[13px] leading-relaxed text-ink whitespace-pre-line">
                  {selectedNotification.content}
                </div>
              </div>

              {/* Modal Footer - CHỈ CÓ DUY NHẤT 1 NÚT XÁC NHẬN */}
              <div className="p-4 border-t border-line bg-surface-2/20 flex justify-end">
                <button
                  type="button"
                  onClick={handleCloseDetail}
                  className="px-5 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-[13px] font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Xác nhận</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
