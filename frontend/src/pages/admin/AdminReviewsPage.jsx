import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Send,
  Package,
  Filter,
  ExternalLink,
  Pencil,
  RotateCcw,
  Check,
  Trash2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import AdminLayout from '../../layouts/AdminLayout';
import { reviewService } from '../../services/reviewService.js';

export default function AdminReviewsPage() {
  const {
    reviews: contextReviews = [],
    updateReviewStatus: contextUpdateReviewStatus,
    replyToReview: contextReplyToReview,
    removeReviewReply: contextRemoveReviewReply,
    openModal,
    showToast,
  } = useStore();

  const [reviews, setReviews] = useState(contextReviews);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [replyDrafts, setReplyDrafts] = useState({});
  const [editingReplyId, setEditingReplyId] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewService.getAllReviews();
      const list = Array.isArray(res) ? res : res.content || res.items || [];
      if (list.length > 0) {
        setReviews(list);
      } else if (contextReviews.length > 0) {
        setReviews(contextReviews);
      }
    } catch {
      if (contextReviews.length > 0) {
        setReviews(contextReviews);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const counts = {
    ALL: reviews.length,
    PENDING: reviews.filter((r) => r.status === 'PENDING').length,
    APPROVED: reviews.filter((r) => r.status === 'APPROVED').length,
    REJECTED: reviews.filter((r) => r.status === 'REJECTED').length,
  };

  const filtered = reviews.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (ratingFilter !== 'ALL' && r.rating !== Number(ratingFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const prodMatch = (r.productName || '').toLowerCase().includes(q);
      const custMatch = (r.customerName || r.userName || '').toLowerCase().includes(q);
      const commentMatch = (r.comment || '').toLowerCase().includes(q);
      return prodMatch || custMatch || commentMatch;
    }
    return true;
  });

  const handleUpdateStatus = async (id, status) => {
    try {
      await reviewService.updateReviewStatus(id, status);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      if (contextUpdateReviewStatus) {
        contextUpdateReviewStatus(id, status);
      }
      showToast?.(`Đã cập nhật trạng thái thành ${status}`);
    } catch (err) {
      showToast?.(err.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleSendReply = async (id) => {
    const text = replyDrafts[id];
    if (!text || !text.trim()) return;
    try {
      await reviewService.replyToReview(id, text.trim());
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                replyText: text.trim(),
                reply: { replyText: text.trim(), createdAt: new Date().toISOString() },
                status: 'APPROVED',
              }
            : r
        )
      );
      if (contextReplyToReview) {
        contextReplyToReview(id, text.trim());
      }
      setReplyDrafts((prev) => ({ ...prev, [id]: '' }));
      setEditingReplyId(null);
      showToast?.('Đã gửi phản hồi và duyệt đánh giá');
    } catch (err) {
      showToast?.(err.message || 'Lỗi khi gửi phản hồi');
    }
  };

  const handleStartEdit = (rev) => {
    const currentText = rev.replyText || rev.reply?.replyText || '';
    setReplyDrafts((prev) => ({ ...prev, [rev.id]: currentText }));
    setEditingReplyId(rev.id);
  };

  const handleCancelEdit = (id) => {
    setReplyDrafts((prev) => ({ ...prev, [id]: '' }));
    setEditingReplyId(null);
  };

  const handleRetractReply = async (id) => {
    try {
      await reviewService.removeReviewReply(id);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, replyText: null, reply: null, status: 'PENDING' }
            : r
        )
      );
      if (contextRemoveReviewReply) {
        contextRemoveReviewReply(id);
      }
      setEditingReplyId(null);
      setReplyDrafts((prev) => ({ ...prev, [id]: '' }));
      showToast?.('Đã thu hồi phản hồi');
    } catch {
      handleUpdateStatus(id, 'PENDING');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này?')) return;
    try {
      await reviewService.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      showToast?.('Đã xóa đánh giá thành công');
    } catch (err) {
      showToast?.(err.message || 'Lỗi khi xóa đánh giá');
    }
  };

  return (
    <AdminLayout
      searchPlaceholder="Tìm đánh giá theo tên sản phẩm, khách hàng, nội dung nhận xét..."
      onSearchChange={setSearch}
    >
      <div className="space-y-6 text-ink">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-extrabold text-ink flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              <span>Quản Lý Đánh Giá &amp; Phản Hồi Khách Hàng</span>
            </h1>
            <p className="text-[13px] text-ink-muted mt-0.5">
              Kiểm duyệt đánh giá, gửi tin nhắn phản hồi của Quản trị viên và tự động duyệt sang trạng thái{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">APPROVED</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() => openModal('review_modal')}
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Star className="w-4 h-4" />
            <span>Thử Nghiệm Modal Đánh Giá</span>
          </button>
        </div>

        {/* Filter Bar with Status Badges */}
        <div className="bg-surface rounded-lg border border-line p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'Tất cả trạng thái', count: counts.ALL },
              { id: 'PENDING', label: 'Chờ duyệt (PENDING)', count: counts.PENDING },
              { id: 'APPROVED', label: 'Đã duyệt (APPROVED)', count: counts.APPROVED },
              { id: 'REJECTED', label: 'Đã ẩn (REJECTED)', count: counts.REJECTED },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-bold transition cursor-pointer flex items-center gap-2 ${
                  statusFilter === st.id
                    ? 'bg-accent text-white shadow-xs'
                    : 'bg-surface-2 text-ink-muted hover:text-ink'
                }`}
              >
                <span>{st.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-extrabold ${
                    statusFilter === st.id
                      ? 'bg-white/20 text-white'
                      : st.id === 'PENDING' && st.count > 0
                        ? 'bg-amber-500 text-white'
                        : 'bg-page text-ink-muted'
                  }`}
                >
                  {st.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-ink-muted" />
            <span className="text-[12px] font-bold text-ink-muted">Lọc theo số sao:</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="h-8 px-2.5 rounded-md bg-page border border-line text-[12px] font-bold text-ink focus:outline-none focus:border-accent"
            >
              <option value="ALL">Tất cả (1★ - 5★)</option>
              <option value="5">5 Sao (Tuyệt vời)</option>
              <option value="4">4 Sao (Hài lòng)</option>
              <option value="3">3 Sao (Bình thường)</option>
              <option value="2">2 Sao (Chưa hài lòng)</option>
              <option value="1">1 Sao (Kém)</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-surface rounded-lg border border-line p-10 text-center text-ink-muted shadow-xs">
              Đang tải danh sách đánh giá...
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-surface rounded-lg border border-line p-10 text-center text-ink-muted shadow-xs">
              Không có đánh giá nào khớp với bộ lọc hiện tại.
            </div>
          ) : (
            filtered.map((rev) => {
              const productImg = rev.productImage || rev.image;
              const customerName = rev.customerName || rev.userName || 'Khách hàng';
              const hasReply = Boolean(rev.replyText || rev.reply?.replyText);
              const isEditing = editingReplyId === rev.id;

              return (
                <div
                  key={rev.id}
                  className="bg-surface rounded-lg border border-line p-5 space-y-4 shadow-xs transition hover:border-accent/40"
                >
                  {/* Top Bar: Customer & Product & Status */}
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-line">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md bg-surface-2 border border-line overflow-hidden shrink-0 flex items-center justify-center">
                        {productImg ? (
                          <img
                            src={productImg}
                            alt={rev.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-ink-subtle" />
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[14px] font-bold text-ink">
                            {rev.productName || 'Sản phẩm thể thao'}
                          </h3>
                          {rev.productId && (
                            <Link
                              to={`/product/${rev.productId}`}
                              className="text-[11.5px] font-bold text-accent hover:underline flex items-center gap-0.5"
                              title="Xem chi tiết sản phẩm"
                            >
                              <span>(Xem sản phẩm)</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                          {rev.orderCode && (
                            <span className="text-[11.5px] font-mono font-bold text-accent">
                              ({rev.orderCode})
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-ink-muted mt-0.5">
                          Phân loại: <span className="font-semibold text-ink">{rev.variant || 'Tiêu chuẩn'}</span> • Khách hàng:{' '}
                          <strong className="text-ink">{customerName}</strong>
                          {rev.customerEmail && ` (${rev.customerEmail})`} • {rev.createdAt?.slice(0, 10)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {rev.status === 'APPROVED' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đã duyệt (APPROVED)</span>
                        </span>
                      )}
                      {rev.status === 'PENDING' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>Chờ duyệt (PENDING)</span>
                        </span>
                      )}
                      {rev.status === 'REJECTED' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-bold flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>Đã ẩn (REJECTED)</span>
                        </span>
                      )}

                      {/* Quick Action Buttons */}
                      {rev.status !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(rev.id, 'APPROVED')}
                          className="px-3 py-1 rounded-md bg-accent hover:bg-accent-hover text-white text-[11.5px] font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                          title="Phê duyệt đánh giá ngay lập tức"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Duyệt</span>
                        </button>
                      )}
                      {rev.status !== 'REJECTED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(rev.id, 'REJECTED')}
                          className="px-3 py-1 rounded-md bg-surface-2 hover:bg-danger-soft text-ink-muted hover:text-danger border border-line text-[11.5px] font-bold transition cursor-pointer"
                          title="Ẩn đánh giá này khỏi cửa hàng"
                        >
                          Ẩn
                        </button>
                      )}
                      {rev.status === 'REJECTED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(rev.id, 'PENDING')}
                          className="px-3 py-1 rounded-md bg-surface-2 hover:bg-surface-3 text-ink border border-line text-[11.5px] font-bold transition cursor-pointer"
                          title="Chuyển về trạng thái chờ duyệt"
                        >
                          Khôi phục
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1 rounded-md bg-surface-2 hover:bg-danger-soft text-ink-muted hover:text-danger border border-line transition cursor-pointer"
                        title="Xóa đánh giá này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Rating & Comment Content */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= rev.rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-line'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[12px] font-bold text-ink">
                        {rev.rating}/5 Sao
                      </span>
                    </div>
                    <p className="text-[13px] text-ink leading-relaxed font-normal bg-page/40 p-3 rounded-md border border-line/60">
                      “{rev.comment}”
                    </p>

                    {rev.images && rev.images.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        {rev.images.map((img, i) => {
                          const isImg =
                            typeof img === 'string' &&
                            (img.startsWith('http') || img.startsWith('data:image'));
                          return (
                            <div
                              key={i}
                              className="w-16 h-16 rounded-md bg-surface-2 border border-line overflow-hidden flex items-center justify-center p-0.5"
                            >
                              {isImg ? (
                                <img
                                  src={img}
                                  alt={`Review ${i}`}
                                  className="w-full h-full object-cover rounded-sm"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-ink-subtle" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Admin Reply Section (review_replies) */}
                  {hasReply && !isEditing ? (
                    <div className="p-3.5 rounded-md bg-accent-soft border border-accent/20 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11.5px] font-bold text-accent flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Phản hồi từ Ban Quản Trị Cửa Hàng:</span>
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(rev)}
                            className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                            title="Sửa nội dung phản hồi"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Sửa</span>
                          </button>
                          <span className="text-ink-subtle text-[11px]">•</span>
                          <button
                            type="button"
                            onClick={() => handleRetractReply(rev.id)}
                            className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                            title="Thu hồi phản hồi và trả về trạng thái Chờ duyệt (PENDING)"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Thu hồi</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-[12.5px] text-ink leading-relaxed">
                        {rev.replyText || rev.reply?.replyText}
                      </p>
                      {rev.reply?.createdAt && (
                        <p className="text-[10.5px] text-ink-muted">
                          Thời gian: {new Date(rev.reply.createdAt).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={replyDrafts[rev.id] || ''}
                          onChange={(e) =>
                            setReplyDrafts((prev) => ({ ...prev, [rev.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSendReply(rev.id);
                            }
                          }}
                          placeholder="Nhập tin nhắn phản hồi của Admin (nhấn Enter hoặc bấm nút để gửi & duyệt)..."
                          className="flex-1 h-9 px-3 rounded-md bg-page border border-line text-[12.5px] text-ink focus:border-accent focus:outline-none placeholder:text-ink-muted"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendReply(rev.id)}
                          className="px-3.5 h-9 rounded-md bg-accent hover:bg-accent-hover text-white text-[12px] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isEditing ? 'Cập Nhật' : 'Gửi Phản Hồi'}</span>
                        </button>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleCancelEdit(rev.id)}
                            className="px-3 h-9 rounded-md bg-surface-2 hover:bg-surface-3 text-ink-muted hover:text-ink text-[12px] font-bold border border-line transition cursor-pointer shrink-0"
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-muted italic">
                        💡 Mẹo: Khi gửi phản hồi thành công, hệ thống sẽ tự động chuyển trạng thái đánh giá sang{' '}
                        <strong className="text-emerald-600 dark:text-emerald-400 not-italic">Đã duyệt (APPROVED)</strong>.
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
