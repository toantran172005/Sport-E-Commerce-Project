import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { useRequireLogin } from '../../hooks/useRequireLogin.js';
import { formatCurrency } from '../../utils/formatters.js';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart, isInWishlist, toggleWishlist } = useStore();
  const requireLogin = useRequireLogin();
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);
  const currentPrice = product.salePrice || product.basePrice;
  const originalPrice = product.salePrice ? product.basePrice : null;
  const discountPercent =
    originalPrice && originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : null;

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    product.primaryImageUrl || 
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600';
    
  const brandName = product.brand?.name || product.brandName || 'Delta Sport';
  const categoryName = product.category?.name || product.categoryName || 'Đồ thể thao';

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (!requireLogin('Vui lòng đăng nhập để tiến hành đặt hàng')) return;
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (!requireLogin('Vui lòng đăng nhập để lưu sản phẩm yêu thích')) return;
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-surface rounded-lg border border-line hover:border-accent hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col overflow-hidden text-ink"
    >
      {/* Product Image Thumbnail */}
      <div className="relative aspect-square w-full bg-surface-2 overflow-hidden">
        {discountPercent && (
          <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md bg-danger text-white text-[11px] font-bold tracking-tight shadow-xs">
            -{discountPercent}%
          </span>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-surface/90 backdrop-blur-xs flex items-center justify-center text-ink-muted hover:text-danger shadow-xs transition"
        >
          <Heart
            className={`w-4 h-4 transition ${
              isWishlisted ? 'fill-danger text-danger' : 'text-ink-subtle'
            }`}
          />
        </button>

        {/* Image with graceful skeleton */}
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-surface-2 animate-pulse" />
        )}
      </div>

      {/* Card Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Brand & Category Breadcrumb */}
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider line-clamp-1">
            {brandName} • {categoryName}
          </div>

          {/* Product Name */}
          <Link
            to={`/products/${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="block text-[13.5px] font-bold text-ink group-hover:text-accent mt-1 line-clamp-2 transition leading-snug"
          >
            {product.name}
          </Link>
        </div>

        <div>
          {/* Rating & Sold count */}
          <div className="flex items-center gap-1.5 text-[11.5px] text-ink-muted mt-1">
            <div className="flex items-center gap-0.5 text-warning">
              <Star className="w-3.5 h-3.5 fill-warning" />
              <span className="font-bold text-ink">
                {product.avgRating?.toFixed(1) || '5.0'}
              </span>
            </div>
            <span>•</span>
            <span>Đã bán {product.soldCount || 0}</span>
          </div>

          {/* Price & Action Buttons */}
          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-line">
            <div className="flex flex-col min-w-0">
              <span className="text-[14.5px] font-bold text-accent truncate">
                {formatCurrency(currentPrice)}
              </span>
              {originalPrice && (
                <span className="text-[11px] text-ink-subtle line-through truncate">
                  {formatCurrency(originalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleQuickAdd}
                title="Thêm vào giỏ hàng"
                aria-label="Thêm vào giỏ hàng"
                className="w-8 h-8 rounded-md bg-accent-soft hover:bg-accent text-accent hover:text-white flex items-center justify-center transition shadow-2xs"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="px-2.5 h-8 rounded-md bg-accent hover:bg-accent-hover text-white text-[11.5px] font-bold transition shadow-2xs whitespace-nowrap"
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
