import { useState, useEffect, useTransition } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Filter,
  X,
  RotateCcw,
  Star,
  Check,
} from 'lucide-react';
import ProductCard from '../../components/common/ProductCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import { ProductCardSkeleton } from '../../components/common/Skeleton.jsx';
import { productService } from '../../services/productService.js';
import { useStore } from '../../context/StoreContext.jsx';

const PRICE_PRESETS = [
  { label: 'Tất cả mức giá', min: '', max: '' },
  { label: 'Dưới 500.000₫', min: '0', max: '500000' },
  { label: '500.000₫ - 1.500.000₫', min: '500000', max: '1500000' },
  { label: '1.500.000₫ - 3.000.000₫', min: '1500000', max: '3000000' },
  { label: 'Trên 3.000.000₫', min: '3000000', max: '' },
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'best_seller', label: 'Bán chạy nhất' },
  { value: 'price_asc', label: 'Giá: Thấp đến Cao' },
  { value: 'price_desc', label: 'Giá: Cao đến Thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
];

export default function CatalogPage() {
  const { categoriesList, brandsList } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();

  // Params from URL
  const query = searchParams.get('q') || '';
  const categoryIdParam = searchParams.get('categoryId') || '';
  const brandIdParam = searchParams.get('brandId') || '';
  const sportTypeParam = searchParams.get('sportType') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const ratingParam = searchParams.get('rating') || '';
  const sortParam = searchParams.get('sort') || 'popular';
  const pageParam = Number(searchParams.get('page')) || 0;

  // Local state for products response
  const [productsData, setProductsData] = useState({
    items: [],
    content: [],
    total: 0,
    totalElements: 0,
    page: 0,
    number: 0,
    limit: 12,
    size: 12,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Fetch products based on search params
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    productService
      .getProducts({
        q: query,
        categoryId: categoryIdParam,
        brandId: brandIdParam,
        sportType: sportTypeParam,
        minPrice: minPriceParam,
        maxPrice: maxPriceParam,
        rating: ratingParam,
        sort: sortParam,
        page: pageParam,
        limit: 12,
      })
      .then((res) => {
        if (isMounted) {
          setProductsData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    query,
    categoryIdParam,
    brandIdParam,
    sportTypeParam,
    minPriceParam,
    maxPriceParam,
    ratingParam,
    sortParam,
    pageParam,
  ]);

  // Update query params helper
  const updateParam = (key, value) => {
    startTransition(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === null || value === '' || value === undefined) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
        if (key !== 'page') {
          next.delete('page'); // Reset to page 1 on filter change
        }
        return next;
      });
    });
  };

  const handlePricePreset = (min, max) => {
    startTransition(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (min) next.set('minPrice', min);
        else next.delete('minPrice');
        if (max) next.set('maxPrice', max);
        else next.delete('maxPrice');
        next.delete('page');
        return next;
      });
    });
  };

  const resetAllFilters = () => {
    startTransition(() => {
      setSearchParams({});
    });
  };

  // Sidebar Filter Content component (reusable for Desktop and Mobile Drawer)
  const FilterContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <h2 className="text-[15px] font-bold text-ink flex items-center gap-2">
          <Filter className="w-4 h-4 text-accent" />
          <span>Bộ Lọc Tìm Kiếm</span>
        </h2>
        <button
          type="button"
          onClick={resetAllFilters}
          className="text-[12px] font-semibold text-accent hover:underline flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Thiết lập lại</span>
        </button>
      </div>

      {/* Danh Mục */}
      <div>
        <h3 className="text-[11.5px] font-bold uppercase text-ink-muted tracking-wider mb-2.5">
          Danh Mục Sản Phẩm
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => updateParam('categoryId', '')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] transition ${
                !categoryIdParam
                  ? 'bg-accent-soft dark:bg-accent/20 font-bold text-accent'
                  : 'text-ink dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-2'
              }`}
            >
              <span>Tất cả danh mục</span>
            </button>
          </li>
          {categoriesList.map((cat) => {
            const isSelected = String(cat.id) === categoryIdParam;
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => updateParam('categoryId', cat.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] transition ${
                    isSelected
                      ? 'bg-accent-soft font-bold text-accent'
                      : 'text-ink hover:bg-surface-2'
                  }`}
                >
                  <span>{cat.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Thương Hiệu */}
      <div className="pt-4 border-t border-line">
        <h3 className="text-[11.5px] font-bold uppercase text-ink-muted tracking-wider mb-2.5">
          Thương Hiệu
        </h3>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {brandsList.map((brand) => {
            const isChecked = String(brand.id) === brandIdParam;
            return (
              <label
                key={brand.id}
                className="flex items-center gap-2.5 text-[13px] text-ink dark:text-slate-200 cursor-pointer hover:text-accent select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => updateParam('brandId', isChecked ? '' : brand.id)}
                  className="rounded-sm border-line text-accent focus:ring-[#2f6bff]"
                />
                <span>{brand.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Khoảng Giá */}
      <div className="pt-4 border-t border-line">
        <h3 className="text-[11.5px] font-bold uppercase text-ink-muted tracking-wider mb-2.5">
          Khoảng Giá
        </h3>
        <div className="space-y-1.5">
          {PRICE_PRESETS.map((preset, idx) => {
            const isSelected =
              minPriceParam === preset.min && maxPriceParam === preset.max;
            return (
              <label
                key={idx}
                className="flex items-center gap-2 text-[12.5px] text-ink dark:text-slate-200 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="price_preset"
                  checked={isSelected}
                  onChange={() => handlePricePreset(preset.min, preset.max)}
                  className="text-accent focus:ring-[#2f6bff]"
                />
                <span>{preset.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Đánh Giá Tối Thiểu */}
      <div className="pt-4 border-t border-line">
        <h3 className="text-[11.5px] font-bold uppercase text-ink-muted tracking-wider mb-2.5">
          Đánh Giá Khách Hàng
        </h3>
        <div className="space-y-1">
          {[5, 4, 3].map((stars) => {
            const isSelected = ratingParam === String(stars);
            return (
              <button
                key={stars}
                type="button"
                onClick={() => updateParam('rating', isSelected ? '' : stars)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12.5px] transition ${
                  isSelected
                    ? 'bg-accent-soft dark:bg-accent/20 font-bold text-accent'
                    : 'text-ink dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-2'
                }`}
              >
                <div className="flex items-center text-warning">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < stars ? 'fill-[#f59e0b]' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span>{stars === 5 ? '5 sao' : `Từ ${stars} sao`}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1360px] w-full mx-auto px-4 md:px-6 py-4">
        {/* Breadcrumb Navigation */}
        <div className="text-[12.5px] text-ink-muted mb-4 flex items-center gap-1.5">
          <Link to="/" className="hover:text-accent">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="font-bold text-accent">Tất cả sản phẩm</span>
          {query && (
            <>
              <span>/</span>
              <span className="text-ink dark:text-slate-200">
                Tìm kiếm: "{query}"
              </span>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Desktop Left Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 bg-surface rounded-lg border border-line p-4 sticky top-[84px]">
            {FilterContent}
          </aside>

          {/* Right Product Grid Area */}
          <section className="lg:col-span-9 space-y-4">
            {/* Top Toolbar */}
            <div className="bg-surface rounded-lg border border-line p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Mobile Filter Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden px-3 py-1.5 rounded-md border border-line text-[13px] font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-200"
                >
                  <Filter className="w-4 h-4 text-accent" />
                  <span>Bộ lọc</span>
                </button>

                <p className="text-[13px] text-ink-muted">
                  Hiển thị <span className="font-bold text-ink">{productsData.total}</span> sản phẩm
                </p>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] text-ink-muted hidden sm:inline">
                  Sắp xếp theo:
                </span>
                <select
                  value={sortParam}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="h-8.5 px-3 rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line text-[13px] font-semibold text-ink dark:text-slate-200 focus:outline-none focus:border-accent"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : productsData.items.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {productsData.items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="pt-6">
                  <Pagination
                    page={productsData.number ?? productsData.page ?? 0}
                    totalPages={productsData.totalPages}
                    onPageChange={(p) => updateParam('page', p === 0 ? '' : p)}
                  />
                </div>
              </>
            ) : (
              <div className="bg-surface rounded-lg border border-line p-8">
                <EmptyState
                  title="Không tìm thấy sản phẩm phù hợp"
                  description="Hãy thử bỏ chọn bớt bộ lọc hoặc tìm kiếm với từ khóa khác."
                  actionText="Xóa bộ lọc"
                  onAction={resetAllFilters}
                />
              </div>
            )}
          </section>
        </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-surface h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-line">
                <h3 className="text-base font-bold text-ink">Bộ Lọc</h3>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-ink-subtle hover:text-ink"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {FilterContent}
            </div>

            <div className="pt-4 border-t border-line mt-6">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-2.5 rounded-md bg-accent hover:bg-accent-hover text-white text-[13px] font-bold shadow-xs transition"
              >
                Xem kết quả ({productsData.totalElements ?? productsData.total ?? 0})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
