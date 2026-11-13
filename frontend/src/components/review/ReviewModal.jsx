import { useState, useRef } from 'react';
import { Star, X, Image as ImageIcon, UploadCloud, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { reviewService } from '../../services/reviewService.js';

const QUICK_TAGS = [
  'Đúng mô tả 100%',
  'Đóng gói rất kỹ càng',
  'Giao hàng nhanh chóng',
  'Chất lượng vượt mong đợi',
  'Độ hoàn thiện cao',
];

export default function ReviewModal() {
  const { activeModal, modalPayload, closeModal, showToast, user } = useStore();
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['Đúng mô tả 100%', 'Đóng gói rất kỹ càng']);
  const [comment, setComment] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (activeModal !== 'review_modal') return null;

  const productId = modalPayload?.productId || 1;
  const productName = modalPayload?.productName || 'Sản phẩm thể thao';

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn file hình ảnh (JPG, PNG, WebP)!', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Kích thước ảnh tối đa là 5MB!', 'error');
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Vui lòng nhập nhận xét của bạn', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullComment = selectedTags.length > 0
        ? `[${selectedTags.join(', ')}] ${comment.trim()}`
        : comment.trim();

      const images = imagePreview ? [imagePreview] : [];

      await reviewService.createReview({
        productId,
        userId: user?.id || 1,
        rating,
        comment: fullComment,
        images,
      });

      showToast('Cảm ơn bạn đã gửi đánh giá! Đánh giá sẽ được hiển thị sau khi duyệt.', 'success');
      closeModal();
    } catch (err) {
      showToast(err.message || 'Lỗi khi gửi đánh giá', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-surface rounded-lg w-full max-w-[540px] shadow-2xl border border-line overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <Star className="w-5 h-5 text-warning fill-[#f59e0b]" />
              <span>Đánh Giá Sản Phẩm</span>
            </h2>
            <p className="text-[12px] text-ink-subtle mt-0.5">
              Chia sẻ cảm nhận thực tế của bạn về sản phẩm này
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="w-8 h-8 rounded-md bg-surface-2 dark:bg-surface-2 text-slate-500 hover:text-slate-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-md bg-page dark:bg-surface-2/50 border border-line">
            <p className="text-[11.5px] font-bold text-ink-subtle uppercase tracking-wider">
              Sản phẩm
            </p>
            <p className="text-[13.5px] font-bold text-ink mt-0.5">
              {productName}
            </p>
          </div>

          {/* Star selector */}
          <div>
            <label className="block text-[13px] font-bold text-ink dark:text-slate-200 mb-1.5">
              Chất lượng tổng quan:
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'fill-[#f59e0b] text-warning'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-[12.5px] font-bold text-warning">
                {rating === 5 ? 'Tuyệt vời (5 sao)' : `${rating} sao`}
              </span>
            </div>
          </div>

          {/* Quick tags */}
          <div>
            <label className="block text-[12.5px] font-bold text-ink dark:text-slate-200 mb-1.5">
              Điểm nổi bật:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-md text-[11.5px] font-bold border transition ${
                      isSelected
                        ? 'border-accent bg-accent-soft dark:bg-accent/20 text-accent'
                        : 'border-line text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment text */}
          <div>
            <label className="block text-[12.5px] font-bold text-ink dark:text-slate-200 mb-1.5">
              Chi tiết đánh giá của bạn: <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ về độ êm, độ vừa vặn, trải nghiệm khi thi đấu thực tế..."
              className="w-full p-3 rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line text-[12.5px] focus:outline-none focus:border-accent"
            />
          </div>

          {/* File Image Upload */}
          <div>
            <label className="block text-[12px] font-semibold text-ink-muted mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Ảnh chụp thực tế (chọn file từ máy):</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="flex items-center gap-3 p-2.5 rounded-lg border border-line bg-page">
                <img
                  src={imagePreview}
                  alt="Ảnh thực tế"
                  className="w-14 h-14 object-cover rounded-md border border-line shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-ink truncate">
                    {selectedImage?.name || 'Ảnh đánh giá'}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    {selectedImage ? `${(selectedImage.size / 1024).toFixed(1)} KB` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1.5 rounded-md hover:bg-danger-soft text-ink-muted hover:text-danger transition cursor-pointer"
                  title="Xóa ảnh này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-lg border-2 border-dashed border-line hover:border-accent bg-page hover:bg-surface-2 transition flex items-center justify-center gap-2 text-ink-muted hover:text-accent cursor-pointer text-[12px] font-bold"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Chọn ảnh thực tế từ thiết bị (JPG, PNG, WebP)</span>
              </button>
            )}
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-md bg-surface border border-line text-slate-700 dark:text-slate-300 text-[12.5px] font-bold hover:bg-slate-50 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="px-5 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold shadow-xs transition disabled:opacity-50"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
