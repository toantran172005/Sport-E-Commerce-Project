import { formatCurrency } from '../../utils/formatters.js';

export default function ProductGallery({
  images = [],
  activeImageIdx = 0,
  setActiveImageIdx,
  onImageSelect,
  productName = '',
  originalPrice = null,
  savedAmount = 0,
}) {
  const handleThumbnailClick = (idx, url) => {
    if (setActiveImageIdx) setActiveImageIdx(idx);
    if (onImageSelect) onImageSelect(idx, url);
  };

  const currentImg = images[activeImageIdx] || images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600';

  return (
    <div className="space-y-3">
      {/* Main Visual Image */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-line bg-surface-2 dark:bg-surface-2 shadow-xs group">
        <img
          src={currentImg}
          alt={productName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600';
          }}
        />
        {originalPrice && savedAmount > 0 && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-danger text-white text-[11.5px] font-bold shadow-sm">
            Tiết kiệm {formatCurrency(savedAmount)}
          </span>
        )}
      </div>

      {/* Thumbnail Carousel / Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
          {images.map((imgUrl, idx) => {
            const isActive = activeImageIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleThumbnailClick(idx, imgUrl)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-150 ${
                  isActive
                    ? 'border-accent ring-2 ring-accent/30 shadow-xs scale-[1.02]'
                    : 'border-line opacity-75 hover:opacity-100 hover:border-slate-400'
                }`}
                title={`Xem ảnh ${idx + 1}`}
              >
                <img
                  src={imgUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200';
                  }}
                />
                {isActive && (
                  <span className="absolute inset-0 border-2 border-accent rounded-md pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
