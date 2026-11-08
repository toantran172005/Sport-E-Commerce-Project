import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  ShieldCheck,
  RefreshCw,
  Star,
  Check,
  Truck,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { ProductCard, ProductGallery, ProductVariants } from '../../components/product';
import { ReviewList } from '../../components/review';
import { Skeleton } from '../../components/common';
import { productService } from '../../services/productService.js';
import { reviewService } from '../../services/reviewService.js';
import { useStore } from '../../context/StoreContext.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user, showToast, addToCart, isInWishlist, toggleWishlist, openModal } = useStore();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [reviews, setReviews] = useState([]);
  const [reviewFilterRating, setReviewFilterRating] = useState('ALL');
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    productService
      .getProductById(id)
      .then((data) => {
        if (!isMounted) return;
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariantId(data.variants[0].id);
        }
        setLoading(false);

        productService
          .getProducts({
            categoryId: data.categoryId,
            limit: 4,
          })
          .then((res) => {
            if (isMounted) {
              setRelatedProducts(res.items.filter((p) => p.id !== data.id));
            }
          })
          .catch(() => {});
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoading(false);
        showToast(err.response?.data?.message || 'Không thể tải chi tiết sản phẩm');
      });

    setReviewsLoading(true);
    reviewService
      .getReviewsByProduct(id)
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : res.items || res.content || [];
        setReviews(list);
        setReviewsLoading(false);
      })
      .catch(() => {
        if (isMounted) setReviewsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, showToast]);

  const currentVariant = useMemo(() => {
    if (!product || !product.variants) return null;
    return (
      product.variants.find((v) => v.id === selectedVariantId) ||
      product.variants[0] ||
      null
    );
  }, [product, selectedVariantId]);

  const currentPrice = currentVariant
    ? currentVariant.salePrice || currentVariant.price || product?.salePrice || product?.basePrice
    : product?.salePrice || product?.basePrice;

  const originalPrice = currentVariant
    ? currentVariant.salePrice
      ? currentVariant.price
      : product?.salePrice
        ? product?.basePrice
        : null
    : product?.salePrice
      ? product?.basePrice
      : null;

  const savedAmount =
    originalPrice && originalPrice > currentPrice ? originalPrice - currentPrice : 0;

  const maxStock = currentVariant ? currentVariant.stock ?? 20 : 20;
  const isOutOfStock = maxStock <= 0;

  const isWishlisted = product ? isInWishlist(product.id) : false;

  const images = useMemo(() => {
    if (!product?.images || product.images.length === 0) {
      return ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'];
    }
    return product.images.map((img) => img.imageUrl || img);
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(
      {
        ...product,
        selectedVariant: currentVariant,
        variantId: currentVariant?.id,
        price: currentPrice,
        originalPrice,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(
      {
        ...product,
        selectedVariant: currentVariant,
        variantId: currentVariant?.id,
        price: currentPrice,
        originalPrice,
      },
      quantity
    );
    if (!user) {
      showToast('Vui lòng đăng nhập để tiến hành đặt hàng');
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-[1360px] w-full mx-auto px-4 md:px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <Skeleton className="aspect-square w-full rounded-lg" />
          </div>
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1360px] w-full mx-auto px-4 md:px-6 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-ink">Không tìm thấy sản phẩm</h2>
        <p className="text-ink-muted text-sm">Sản phẩm này có thể đã ngừng kinh doanh hoặc đường dẫn không đúng.</p>
        <Link
          to="/products"
          className="inline-block px-5 py-2.5 rounded-md bg-accent text-white font-bold text-sm shadow-xs hover:bg-accent-hover transition"
        >
          Khám phá sản phẩm khác
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] w-full mx-auto px-4 md:px-6 py-6 space-y-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[12.5px] text-ink-muted">
        <Link to="/" className="hover:text-accent">Trang chủ</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-accent">Sản phẩm</Link>
        <span>/</span>
        <Link to={`/products?category=${product.categoryId || ''}`} className="hover:text-accent">
          {product.category?.name || 'Thể thao'}
        </Link>
        <span>/</span>
        <span className="font-bold text-accent">{product.name}</span>
      </div>

      {/* Product Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Gallery (5 cols) */}
        <div className="lg:col-span-5">
          <ProductGallery
            images={images}
            activeImageIdx={activeImageIdx}
            setActiveImageIdx={setActiveImageIdx}
            productName={product.name}
            originalPrice={originalPrice}
            savedAmount={savedAmount}
          />
        </div>

        {/* Right Product Buy Box & Specs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Brand, Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-accent-soft dark:bg-accent/20 text-accent text-[11px] font-bold uppercase tracking-wider">
              {product.brand?.name || 'Chính hãng'}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-success text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Bảo hành chính hãng 12 tháng</span>
            </span>
          </div>

          {/* Product Title & Rating */}
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-ink leading-snug">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 text-[12.5px] mt-2 text-ink-muted">
              <div className="flex items-center text-warning">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.round(product.avgRating || 5)
                        ? 'fill-warning'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-ink">
                {product.avgRating?.toFixed(1) || '5.0'}
              </span>
              <span>·</span>
              <span>{reviews.length || product.reviewCount} đánh giá</span>
              <span>·</span>
              <span className="text-success font-semibold">Đã bán 120+</span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-lg bg-surface border border-line flex items-baseline gap-3">
            <span className="text-2xl md:text-3xl font-black text-accent">
              {formatCurrency(currentPrice)}
            </span>
            {originalPrice && originalPrice > currentPrice && (
              <>
                <span className="text-sm md:text-base text-ink-subtle line-through">
                  {formatCurrency(originalPrice)}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-danger-soft text-danger">
                  -
                  {Math.round(
                    ((originalPrice - currentPrice) / originalPrice) * 100
                  )}
                  %
                </span>
              </>
            )}
          </div>

          {/* Variants Selector */}
          <ProductVariants
            variants={product.variants}
            selectedVariantId={selectedVariantId}
            setSelectedVariantId={setSelectedVariantId}
            maxStock={maxStock}
          />

          {/* Quantity & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Quantity Input */}
            <div className="h-11 px-2 rounded-md bg-surface border border-line flex items-center gap-3">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded text-base font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                -
              </button>
              <span className="w-8 text-center text-[14px] font-bold">
                {quantity}
              </span>
              <button
                type="button"
                disabled={false}
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 rounded text-base font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="flex-1 min-w-[160px] h-11 rounded-md border border-accent bg-surface hover:bg-accent-soft text-accent text-[13.5px] font-bold flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Thêm Vào Giỏ</span>
            </button>

            {/* Buy Now Button */}
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className="flex-1 min-w-[160px] h-11 rounded-md bg-accent hover:bg-accent-hover text-white text-[13.5px] font-bold shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              <span>Mua Ngay</span>
            </button>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className={`w-11 h-11 rounded-md border flex items-center justify-center transition shrink-0 ${
                isWishlisted
                  ? 'border-danger/30 bg-danger-soft text-danger'
                  : 'border-line bg-surface text-ink-muted hover:border-danger hover:text-danger'
              }`}
              title={isWishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? 'fill-danger text-danger' : ''}`}
              />
            </button>
          </div>

          {/* Commitments & Shipping Perquisites */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-line text-[12px] text-ink-muted">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-accent shrink-0" />
              <span>Giao nhanh toàn quốc 2-3 ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-accent shrink-0" />
              <span>Đổi trả miễn phí trong 7 ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
              <span>Cam kết 100% chính hãng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Technical Specifications */}
      <div className="bg-surface rounded-lg border border-line p-6 space-y-4 shadow-2xs">
        <h2 className="text-[17px] font-extrabold text-ink pb-3 border-b border-line">
          Thông Tin Chi Tiết Sản Phẩm
        </h2>
        <div className="prose dark:prose-invert max-w-none text-[13.5px] leading-relaxed text-slate-700 dark:text-slate-300">
          <p>{product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}</p>
        </div>

        {/* ProductAttributes Table */}
        {product.attributes && Object.keys(product.attributes).length > 0 && (
          <div className="pt-4 border-t border-line">
            <h3 className="text-[14px] font-bold text-ink mb-3">
              Thông số kỹ thuật
            </h3>
            <div className="max-w-xl border border-line rounded-md overflow-hidden text-[12.5px]">
              {Object.entries(product.attributes).map(([k, val], idx) => (
                <div
                  key={k}
                  className={`flex py-2 px-3 ${
                    idx % 2 === 0 ? 'bg-surface' : 'bg-surface-2'
                  }`}
                >
                  <span className="w-1/3 font-bold text-ink-muted">{k}</span>
                  <span className="w-2/3 text-ink">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Customer Reviews Section */}
      <section className="bg-surface rounded-lg border border-line p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-accent" />
          <h2 className="text-[18px] font-bold text-ink">Đánh Giá Từ Khách Hàng</h2>
        </div>
        <ReviewList
          reviews={reviews}
          reviewsLoading={reviewsLoading}
          reviewFilterRating={reviewFilterRating}
          setReviewFilterRating={setReviewFilterRating}
          onOpenWriteReview={() =>
            openModal('review_modal', {
              productId: product.id,
              productName: product.name,
            })
          }
        />
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-[18px] font-extrabold text-ink">
            Sản Phẩm Cùng Danh Mục
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
