import { Star } from 'lucide-react';
import Skeleton from '../common/Skeleton.jsx';
import { formatDateTime } from '../../utils/formatters.js';

export default function ReviewList({
  reviews = [],
  reviewsLoading = false,
  reviewFilterRating = 'ALL',
  setReviewFilterRating,
  onOpenWriteReview,
}) {
  const filteredReviews =
    reviewFilterRating === 'ALL'
      ? reviews
      : reviews.filter((r) => r.rating === Number(reviewFilterRating));

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6">
      {/* Review Header Stats & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-extrabold text-accent">{avgRating}</span>
          <div>
            <div className="flex items-center text-warning">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(Number(avgRating))
                      ? 'fill-warning'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-[12px] text-ink-muted">
              ({reviews.length} lượt đánh giá thực tế)
            </span>
          </div>
        </div>

        {/* Filter Buttons & Write Review Button */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', '5', '4', '3'].map((starVal) => (
            <button
              key={starVal}
              type="button"
              onClick={() => setReviewFilterRating && setReviewFilterRating(starVal)}
              className={`px-3 py-1 rounded-md text-[12px] font-bold transition ${
                reviewFilterRating === starVal
                  ? 'bg-accent text-white shadow-xs'
                  : 'bg-surface-2 dark:bg-surface-2 text-ink-muted dark:text-slate-300 hover:text-ink'
              }`}
            >
              {starVal === 'ALL' ? 'Tất cả sao' : `${starVal} sao`}
            </button>
          ))}

          {onOpenWriteReview && (
            <button
              type="button"
              onClick={onOpenWriteReview}
              className="ml-auto px-4 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold transition shadow-xs"
            >
              Viết đánh giá
            </button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      {reviewsLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-md" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="space-y-5 divide-y divide-line-subtle">
          {filteredReviews.map((rev) => (
            <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent text-white font-bold text-xs flex items-center justify-center">
                    {(rev.user?.fullName || rev.userName || 'K')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-ink">
                      {rev.user?.fullName || rev.userName || 'Khách hàng thân thiết'}
                    </p>
                    <div className="flex items-center text-warning">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < rev.rating
                              ? 'fill-warning'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[11.5px] text-ink-subtle">
                  {formatDateTime(rev.createdAt)}
                </span>
              </div>

              <p className="text-[13px] text-ink-muted dark:text-slate-300 leading-relaxed">
                {rev.comment}
              </p>

              {/* Review Images */}
              {rev.images && rev.images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {rev.images.map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt={`Review photo ${i + 1}`}
                      className="w-16 h-16 rounded-md object-cover border border-line"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-ink-muted text-[13px]">
          Chưa có đánh giá nào cho sản phẩm này trong mục đã lọc.
        </div>
      )}
    </div>
  );
}
