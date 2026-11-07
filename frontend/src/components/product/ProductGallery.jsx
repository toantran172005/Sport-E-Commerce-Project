import { formatCurrency } from '../../utils/formatters.js';

export default function ProductGallery({
  images = [],
  activeImageIdx = 0,
  setActiveImageIdx,
  productName = '',
  originalPrice = null,
  savedAmount = 0,
}) {
  return (
    <div className="space-y-3">
      {/* Main Visual Image */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-line bg-surface-2 dark:bg-surface-2">
        <img
          src={images[activeImageIdx] || images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'}
          alt={productName}
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
        />
        {originalPrice && savedAmount > 0 && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-danger text-white text-[11.5px] font-bold shadow-sm">
            Tiết kiệm {formatCurrency(savedAmount)}
          </span>
        )}
      </div>

      {/* Thumbnail Carousel / Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2.5">
          {images.map((imgUrl, idx) => {
            const isActive = activeImageIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIdx && setActiveImageIdx(idx)}
                className={`aspect-square rounded-md overflow-hidden border transition ${
                  isActive
                    ? 'border-2 border-accent shadow-xs'
                    : 'border-line opacity-75 hover:opacity-100'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
