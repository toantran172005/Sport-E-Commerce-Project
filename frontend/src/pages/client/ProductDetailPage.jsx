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
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import ProductCard from '../../components/common/ProductCard.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import { productService } from '../../services/productService.js';
import { reviewService } from '../../services/reviewService.js';
import { useStore } from '../../context/StoreContext.jsx';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user, showToast, addToCart, wishlistIds, toggleWishlist, openModal } = useStore();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Variant selection
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewFilterRating, setReviewFilterRating] = useState('ALL');
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Related products
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Fetch product detail
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

        // Fetch related products
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
        console.error(err);
        if (isMounted) setLoading(false);
      });

    // Fetch reviews
    setReviewsLoading(true);
    reviewService
      .getReviewsByProduct(id)
      .then((res) => {
        if (isMounted) {
          setReviews(res);
          setReviewsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setReviewsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Variant đang chọn
  const activeVariant = useMemo(() => {
    if (!product || !product.variants) return null;
    return (
      product.variants.find((v) => v.id === selectedVariantId) ||
      product.variants[0]
    );
  }, [product, selectedVariantId]);

  const currentPrice =
    activeVariant?.salePrice ||
    activeVariant?.price ||
    product?.salePrice ||
    product?.basePrice ||
    0;
  const originalPrice =
    activeVariant?.salePrice
      ? activeVariant.price
      : product?.salePrice
      ? product?.basePrice
      : null;
  const savedAmount = originalPrice ? originalPrice - currentPrice : 0;
  const maxStock = activeVariant?.stock ?? 20;
  const isOutOfStock = maxStock <= 0;

  const isWishlisted = product ? wishlistIds.includes(product.id) : false;

  // Gallery images
  const images = useMemo(() => {
    if (!product || !product.images || product.images.length === 0) {
      return ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'];
    }
    return product.images.map((img) => img.imageUrl);
  }, [product]);

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity, activeVariant);
    if (!user) {
      showToast('Vui lòng đăng nhập để tiến hành đặt hàng');
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, activeVariant);
  };

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (reviewFilterRating === 'ALL') return reviews;
    return reviews.filter((r) => r.rating === Number(reviewFilterRating));
  }, [reviews, reviewFilterRating]);

  if (loading) {
    return (
      <div className="max-w-[1360px] w-full mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-md" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-20 text-center">
        <h2 className="text-xl font-bold mb-2 text-ink">Không tìm thấy sản phẩm</h2>
        <Link to="/products" className="text-accent font-bold hover:underline">
          Quay lại danh mục sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] w-full mx-auto px-4 md:px-6 py-5 space-y-10">
        {/* Breadcrumb */}
        <div className="text-[12.5px] text-ink-muted flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-accent">
            Trang chủ
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-accent">
            Sản phẩm
          </Link>
          <span>/</span>
          <Link
            to={`/products?categoryId=${product.categoryId}`}
            className="hover:text-accent"
          >
            {product.category?.name || 'Thể thao'}
          </Link>
          <span>/</span>
          <span className="font-bold text-accent">{product.name}</span>
        </div>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Gallery (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {/* Main Visual Image */}
            <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-line bg-surface-2 dark:bg-surface-2">
              <img
                src={images[activeImageIdx] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
              />
              {originalPrice && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-danger text-white text-[11.5px] font-bold shadow-sm">
                  Tiết kiệm {formatCurrency(savedAmount)}
                </span>
              )}
            </div>

            {/* Thumbnail Carousel / Grid */}
            <div className="grid grid-cols-4 gap-2.5">
              {images.map((imgUrl, idx) => {
                const isActive = activeImageIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
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
                  <Star className="w-4 h-4 fill-warning" />
                  <span className="font-bold text-ink dark:text-slate-200 ml-1">
                    {product.avgRating?.toFixed(1) || '5.0'}
                  </span>
                </div>
                <span>•</span>
                <span>{reviews.length || product.reviewCount} đánh giá</span>
                <span>•</span>
                <span>Đã bán {product.soldCount}</span>
              </div>
            </div>

            {/* Price Strip Box */}
            <div className="p-4 rounded-lg bg-surface border border-line flex flex-wrap items-baseline gap-3">
              <span className="text-2xl md:text-3xl font-extrabold text-accent">
                {formatCurrency(currentPrice)}
              </span>
              {originalPrice && (
                <span className="text-base text-ink-subtle line-through">
                  {formatCurrency(originalPrice)}
                </span>
              )}
              {activeVariant && (
                <span className="text-[12px] text-ink-muted ml-auto font-mono">
                  Mã SKU: {activeVariant.sku}
                </span>
              )}
            </div>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-bold text-ink dark:text-slate-200">
                    Chọn Biến Thể (Size / Màu):
                  </p>
                  <span className="text-[12px] font-medium text-success">
                    Còn {maxStock} sản phẩm trong kho
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariantId === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-3.5 py-2 rounded-md text-[13px] font-semibold border transition ${
                          isSelected
                            ? 'border-2 border-accent bg-accent-soft dark:bg-accent/20 text-accent'
                            : 'border-line bg-surface text-slate-700 dark:text-slate-300 hover:border-accent'
                        }`}
                      >
                        <span>{v.size}</span>
                        {v.color && <span className="opacity-75"> · {v.color}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                  disabled={quantity >= maxStock}
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
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
                <span>{isOutOfStock ? 'Hết Hàng' : 'Thêm Vào Giỏ'}</span>
              </button>

              {/* Buy Now Button */}
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="flex-1 min-w-[160px] h-11 rounded-md bg-accent hover:bg-accent-hover text-white text-[13.5px] font-bold shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isOutOfStock ? 'Tạm Hết Hàng' : 'Mua Ngay'}
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    showToast('Vui lòng đăng nhập để lưu sản phẩm yêu thích');
                    navigate(`/login?redirect=/products/${id}`);
                    return;
                  }
                  toggleWishlist(product.id);
                }}
                className={`w-11 h-11 rounded-md border flex items-center justify-center transition ${
                  isWishlisted
                    ? 'border-danger bg-red-50 dark:bg-red-950/20 text-danger'
                    : 'border-line bg-surface text-slate-500 hover:text-danger'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? 'fill-danger' : ''}`}
                />
              </button>
            </div>

            {/* Service Commitments Box */}
            <div className="p-4 rounded-lg bg-surface border border-line grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-[12px] font-bold">Giao hàng nhanh</p>
                  <p className="text-[11px] text-ink-subtle">Nhận hàng trong 2-3 ngày</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-success" />
                <div>
                  <p className="text-[12px] font-bold">Cam kết chính hãng</p>
                  <p className="text-[11px] text-ink-subtle">Đền 200% nếu hàng giả</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-[12px] font-bold">Đổi trả 7 ngày</p>
                  <p className="text-[11px] text-ink-subtle">Miễn phí đổi size</p>
                </div>
              </div>
            </div>

            {/* Description Paragraph */}
            <div className="pt-2">
              <h3 className="text-[15px] font-bold text-ink mb-2">
                Mô Tả Sản Phẩm
              </h3>
              <p className="text-[13px] text-ink-muted dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* ProductAttributes Table */}
            {product.attributes && product.attributes.length > 0 && (
              <div className="pt-2">
                <h3 className="text-[15px] font-bold text-ink mb-2.5">
                  Thông Số Kỹ Thuật
                </h3>
                <div className="rounded-md overflow-hidden border border-line">
                  {product.attributes.map((attr, idx) => (
                    <div
                      key={attr.id || idx}
                      className={`grid grid-cols-12 px-4 py-2.5 text-[12.5px] ${
                        idx % 2 === 0
                          ? 'bg-page dark:bg-surface-2/40'
                          : 'bg-surface'
                      }`}
                    >
                      <div className="col-span-5 text-ink-muted font-medium">
                        {attr.attributeName}
                      </div>
                      <div className="col-span-7 font-bold text-ink">
                        {attr.attributeValue}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <section className="bg-surface rounded-lg border border-line p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
            <div>
              <h2 className="text-[18px] font-bold text-ink flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-accent" />
                <span>Đánh Giá Từ Khách Hàng</span>
              </h2>
              <div className="flex items-center gap-2 text-[13px] mt-1 text-ink-muted">
                <span className="text-xl font-extrabold text-warning">
                  {product.avgRating?.toFixed(1) || '5.0'} / 5.0
                </span>
                <span>({reviews.length} lượt đánh giá thực tế)</span>
              </div>
            </div>

            {/* Filter Buttons & Write Review Button */}
            <div className="flex flex-wrap items-center gap-2">
              {['ALL', '5', '4', '3'].map((starVal) => (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setReviewFilterRating(starVal)}
                  className={`px-3 py-1 rounded-md text-[12px] font-bold transition ${
                    reviewFilterRating === starVal
                      ? 'bg-accent text-white shadow-xs'
                      : 'bg-surface-2 dark:bg-surface-2 text-ink-muted dark:text-slate-300 hover:text-ink'
                  }`}
                >
                  {starVal === 'ALL' ? 'Tất cả sao' : `${starVal} sao`}
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  openModal('review_modal', {
                    productId: product.id,
                    productName: product.name,
                  })
                }
                className="ml-auto px-4 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold transition shadow-xs"
              >
                Viết đánh giá
              </button>
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
                        K
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-ink">
                          Khách hàng thân thiết
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
                    <div className="flex gap-2 pt-1">
                      {rev.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Ảnh đánh giá"
                          className="w-16 h-16 rounded-md object-cover border border-line"
                        />
                      ))}
                    </div>
                  )}

                  {/* Review Reply from Shop */}
                  {rev.reply && (
                    <div className="mt-3 p-3 rounded-md bg-page dark:bg-surface-2/50 border-l-3 border-accent space-y-1">
                      <p className="text-[12px] font-bold text-accent flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Phản hồi từ Sân Nhà Sport</span>
                      </p>
                      <p className="text-[12.5px] text-ink-muted dark:text-slate-300 leading-relaxed">
                        {rev.reply.replyText}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[13px] text-ink-subtle py-6">
              Chưa có đánh giá nào cho mức sao này
            </p>
          )}
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-[18px] font-bold text-ink">
              Sản Phẩm Tương Tự
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
