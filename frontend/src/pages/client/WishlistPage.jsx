import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { ProductCard } from "../../components/product";
import { EmptyState, Skeleton } from "../../components/common";
import { useStore } from "../../context/StoreContext.jsx";
import { wishlistService } from "../../services/wishlistService.js";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export default function WishlistPage() {
  const { products, wishlistIds } = useStore();
  const [apiWishlistProducts, setApiWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!USE_MOCK) {
      setLoading(true);
      wishlistService
        .getWishlist()
        .then((res) => {
          if (Array.isArray(res) && res.length > 0) {
            // Map WishlistResponse to Product structure compatible with ProductCard
            const mapped = res.map((item) => ({
              id: item.productId || item.id,
              name: item.productName || item.name,
              slug: item.productSlug || item.slug,
              basePrice: item.basePrice || item.price,
              salePrice: item.salePrice,
              images: item.imageUrl ? [{ imageUrl: item.imageUrl, isPrimary: true }] : [],
              avgRating: item.avgRating || 5.0,
              reviewCount: item.reviewCount || 0,
            }));
            setApiWishlistProducts(mapped);
          }
        })
        .catch(() => {})
        .finally(() => {
          setLoading(false);
        });
    }
  }, [wishlistIds]);

  const localWishlistProducts = products.filter((p) => wishlistIds.includes(p.id));
  const displayProducts = !USE_MOCK && apiWishlistProducts.length > 0
    ? apiWishlistProducts
    : localWishlistProducts;

  return (
    <div className="max-w-340 w-full mx-auto px-4 md:px-6 py-6 space-y-6 text-ink">
      {/* Breadcrumb */}
      <div className="text-[12.5px] text-ink-muted flex items-center gap-1.5">
        <Link to="/" className="hover:text-accent transition">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="font-bold text-accent">Danh sách yêu thích</span>
      </div>

      {/* Title */}
      <div className="flex items-center gap-3 pb-3 border-b border-line">
        <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-500 flex items-center justify-center border border-rose-200 dark:border-rose-900/40">
          <Heart className="w-5 h-5 fill-rose-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">Sản Phẩm Yêu Thích</h1>
          <p className="text-[12px] text-ink-muted">
            Đã lưu {displayProducts.length} sản phẩm vào danh sách quan tâm
          </p>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : displayProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-surface rounded-lg border border-line p-8 shadow-xs">
          <EmptyState
            title="Danh sách yêu thích đang trống"
            description="Hãy bấm vào biểu tượng trái tim trên các sản phẩm thể thao bạn yêu thích để lưu lại và theo dõi nhé!"
            actionText="Khám phá sản phẩm ngay"
            actionLink="/products"
            icon={Heart}
          />
        </div>
      )}
    </div>
  );
}
