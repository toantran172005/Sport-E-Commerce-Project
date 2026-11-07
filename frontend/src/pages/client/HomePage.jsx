import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import ProductCard from '../../components/common/ProductCard.jsx';
import { useStore } from '../../context/StoreContext.jsx';

export default function HomePage() {
  const { products, categoriesList } = useStore();
  const navigate = useNavigate();

  // 6 danh mục phẳng dạng thẻ chữ (Text Card Grid)
  const mainCategories = useMemo(() => {
    return categoriesList.slice(0, 6);
  }, [categoriesList]);

  // Khối sản phẩm mới nhất (New Arrivals)
  const newArrivals = useMemo(() => {
    return [...products].sort((a, b) => b.id - a.id).slice(0, 4);
  }, [products]);

  // Khối sản phẩm bán chạy nhất (Best Sellers)
  const bestSellers = useMemo(() => {
    return [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 8);
  }, [products]);

  return (
    <div className="max-w-[1360px] w-full mx-auto px-4 md:px-6 py-6 space-y-8">
        {/* 1. Hero tĩnh đơn giản chuẩn TMĐT quốc tế */}
        <div className="rounded-lg bg-gradient-to-r from-[#0a0f20] to-[#1e2950] text-white p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-white/5">
          <div className="space-y-4 max-w-xl z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-accent/20 text-[#8fb0ff] text-[12px] font-bold uppercase tracking-wider border border-accent/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chính Hãng 100% · Mùa Giải 2026</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
              Trang Thiết Bị Thể Thao Cho Người Chơi Thực Thụ
            </h1>
            <p className="text-[13.5px] text-slate-300 leading-relaxed">
              Trải nghiệm các dòng vợt cầu lông, giày chạy bộ, trang phục thi đấu đạt chuẩn thi đấu từ Yonex, Nike, Adidas, Wilson.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/products"
                className="px-5 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-white text-[13px] font-bold transition shadow-xs flex items-center gap-2"
              >
                <span>Khám phá ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products?categoryId=1"
                className="px-5 py-2.5 rounded-md bg-white/10 hover:bg-white/15 text-white text-[13px] font-bold transition border border-white/10"
              >
                Vợt Cầu Lông & Tennis
              </Link>
            </div>
          </div>

          <div className="hidden lg:block relative w-[340px] h-[220px] rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80"
              alt="Sport Equipment"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <p className="text-xs text-white font-medium">Bộ sưu tập giày đinh sân cỏ & giày marathon 2026</p>
            </div>
          </div>
        </div>

        {/* 2. Lưới danh mục dạng thẻ chữ (Text Card Grid) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-bold text-ink">
                Danh Mục Sản Phẩm
              </h2>
              <p className="text-[12px] text-ink-muted">
                Phân loại theo môn thể thao và mục đích thi đấu
              </p>
            </div>
            <Link
              to="/products"
              className="text-[12.5px] font-bold text-accent hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {mainCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigate(`/products?categoryId=${cat.id}`)}
                className="p-3 rounded-md bg-surface border border-line hover:border-accent hover:shadow-xs transition text-center flex flex-col items-center justify-center gap-1.5 group cursor-pointer"
              >
                <span className="text-[13px] font-bold text-ink group-hover:text-accent line-clamp-1">
                  {cat.name}
                </span>
                <span className="text-[10.5px] text-ink-subtle line-clamp-1">
                  Chính hãng
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 3. Khối Sản Phẩm Mới (New Arrivals) - Không có tabs lọc danh mục */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="text-[18px] font-extrabold text-ink">
                Sản Phẩm Mới Về
              </h2>
            </div>
            <Link
              to="/products?sort=newest"
              className="text-[12.5px] font-bold text-accent hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 4. Khối Sản Phẩm Bán Chạy (Best Sellers) */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-warning" />
              <h2 className="text-[18px] font-extrabold text-ink">
                Bán Chạy Nhất Tuần
              </h2>
            </div>
            <Link
              to="/products?sort=best_seller"
              className="text-[12.5px] font-bold text-accent hover:underline flex items-center gap-1"
            >
              <span>Xem thêm</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
  );
}
