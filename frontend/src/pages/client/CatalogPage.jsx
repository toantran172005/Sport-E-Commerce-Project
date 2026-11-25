import { useState, useTransition, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Filter,
  X,
  RotateCcw,
  Star,
  Check,
} from 'lucide-react';
import { ProductCard } from '../../components/product';
import { EmptyState, Pagination } from '../../components/common';
import { ProductCardSkeleton } from '../../components/common/Skeleton.jsx';
import { useStore } from '../../context/StoreContext.jsx';

const PAGE_SIZE = 12;

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

function normalizeVn(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

function effectivePrice(p) {
  const sale = Number(p.salePrice ?? 0);
  const base = Number(p.basePrice ?? 0);
  return sale > 0 && sale < base ? sale : base;
}

function collectCategoryIds(categoryId, categoriesList = []) {
  if (!categoryId) return new Set();
  const targetId = Number(categoryId);
  const ids = new Set([targetId]);
  const queue = [targetId];
  while (queue.length > 0) {
    const parentId = queue.shift();
    for (const cat of categoriesList) {
      const pId = cat.parentId ?? cat.parent?.id ?? null;
      if (pId !== null && Number(pId) === parentId && !ids.has(Number(cat.id))) {
        ids.add(Number(cat.id));
        queue.push(Number(cat.id));
      }
    }
  }
  return ids;
}

function collectCategoryNames(validIds, categoriesList = []) {
  const names = new Set();
  for (const cat of categoriesList) {
    if (validIds.has(Number(cat.id)) && cat.name) {
      names.add(normalizeVn(cat.name));
    }
  }
  return names;
}

export default function CatalogPage() {
  const { categoriesList, brandsList, products, catalogLoading } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();

  const query = searchParams.get('q') || '';
  const categoryIdParam = searchParams.get('categoryId') || '';
  const brandIdParam = searchParams.get('brandId') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const ratingParam = searchParams.get('rating') || '';
  const sortParam = searchParams.get('sort') || 'popular';
  const pageParam = Math.max(0, Number(searchParams.get('page')) || 0);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Context-First: Lọc và sắp xếp trực tiếp từ products trong StoreContext (0ms phản hồi)
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];

    let list = [...products];

    // 1. Lọc theo Danh mục (hỗ trợ gom cây danh mục cha - con và so khớp cả ID lẫn tên)
    if (categoryIdParam) {
      const validCatIds = collectCategoryIds(categoryIdParam, categoriesList);
      const validCatNames = collectCategoryNames(validCatIds, categoriesList);

      list = list.filter((p) => {
        const pCatId = Number(p.categoryId || p.category?.id || 0);
        if (pCatId && validCatIds.has(pCatId)) return true;

        const pCatName = normalizeVn(
          p.categoryName || p.category?.name || (typeof p.category === 'string' ? p.category : '')
        );
        if (pCatName && validCatNames.has(pCatName)) return true;

        return false;
      });
    }

    // 2. Lọc theo Thương hiệu
    if (brandIdParam) {
      list = list.filter((p) => {
        const pBrandId = String(p.brandId || p.brand?.id || '');
        return pBrandId === String(brandIdParam);
      });
    }

    // 3. Lọc theo Khoảng giá
    if (minPriceParam !== '' || maxPriceParam !== '') {
      const min = minPriceParam !== '' ? Number(minPriceParam) : 0;
      const max = maxPriceParam !== '' ? Number(maxPriceParam) : Infinity;
      list = list.filter((p) => {
        const price = effectivePrice(p);
        return price >= min && price <= max;
      });
    }

    // 4. Lọc theo Đánh giá sao
    if (ratingParam !== '') {
      const minRating = Number(ratingParam);
      list = list.filter((p) => (Number(p.avgRating) || 0) >= minRating);
    }

    // 5. Lọc theo Từ khóa tìm kiếm q
    if (query.trim()) {
      const kw = normalizeVn(query);
      list = list.filter((p) => {
        const name = normalizeVn(p.name);
        const desc = normalizeVn(p.description);
        const catName = normalizeVn(p.categoryName || p.category?.name);
        const brandName = normalizeVn(p.brandName || p.brand?.name);
        return (
          name.includes(kw) ||
          desc.includes(kw) ||
          catName.includes(kw) ||
          brandName.includes(kw)
        );
      });
    }

    // 6. Sắp xếp danh sách
    switch (sortParam) {
      case 'price_asc':
        list.sort((a, b) => effectivePrice(a) - effectivePrice(b));
        break;
      case 'price_desc':
        list.sort((a, b) => effectivePrice(b) - effectivePrice(a));
        break;
      case 'newest':
        list.sort((a, b) => {
          const timeB = new Date(b.createdAt || 0).getTime() || Number(b.id || 0);
          const timeA = new Date(a.createdAt || 0).getTime() || Number(a.id || 0);
          return timeB - timeA;
        });
        break;
      case 'best_seller':
        list.sort((a, b) => (Number(b.soldCount) || 0) - (Number(a.soldCount) || 0));
        break;
      case 'rating':
        list.sort((a, b) => (Number(b.avgRating) || 0) - (Number(a.avgRating) || 0));
        break;
      case 'popular':
      default:
        list.sort((a, b) => {
          const soldDiff = (Number(b.soldCount) || 0) - (Number(a.soldCount) || 0);
          if (soldDiff !== 0) return soldDiff;
          return Number(b.id || 0) - Number(a.id || 0);
        });
        break;
    }

    return list;
  }, [
    products,
    categoriesList,
    categoryIdParam,
    brandIdParam,
    minPriceParam,
    maxPriceParam,
    ratingParam,
    query,
    sortParam,
  ]);

  // Phân trang 12 sản phẩm / trang
  const totalElements = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));
  const currentPage = Math.max(0, Math.min(pageParam, totalPages - 1));

  const pagedProducts = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

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
          next.delete('page');
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

  const selectedCategoryObj = useMemo(() => {
    if (!categoryIdParam) return null;
    return categoriesList.find((c) => String(c.id) === categoryIdParam);
  }, [categoriesList, categoryIdParam]);

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
          className="text-[12px] font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
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
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] transition cursor-pointer ${
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
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] transition cursor-pointer ${
                    isSelected
                      ? 'bg-accent-soft dark:bg-accent/20 font-bold text-accent'
                      : 'text-ink dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-2'
                  }`}
                >
                  <span>{cat.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-accent" />}
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
        <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <li>
            <button
              type="button"
              onClick={() => updateParam('brandId', '')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] transition cursor-pointer ${
                !brandIdParam
                  ? 'bg-accent-soft dark:bg-accent/20 font-bold text-accent'
                  : 'text-ink dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-2'
              }`}
            >
              <span>Tất cả thương hiệu</span>
            </button>
          </li>
          {brandsList.map((brand) => {
            const isSelected = String(brand.id) === brandIdParam;
            return (
              <li key={brand.id}>
                <button
                  type="button"
                  onClick={() => updateParam('brandId', brand.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] transition cursor-pointer ${
                    isSelected
                      ? 'bg-accent-soft dark:bg-accent/20 font-bold text-accent'
                      : 'text-ink dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-2'
                  }`}
                >
                  <span>{brand.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-accent" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Mức Giá */}
      <div className="pt-4 border-t border-line">
        <h3 className="text-[11.5px] font-bold uppercase text-ink-muted tracking-wider mb-2.5">
          Mức Giá
        </h3>
        <div className="space-y-1">
          {PRICE_PRESETS.map((preset, idx) => {
            const isSelected =
              minPriceParam === preset.min && maxPriceParam === preset.max;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePricePreset(preset.min, preset.max)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-[12.5px] transition cursor-pointer ${
                  isSelected
                    ? 'bg-accent-soft dark:bg-accent/20 font-bold text-accent'
                    : 'text-ink dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-2'
                }`}
              >
                {preset.label}
              </button>
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
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12.5px] transition cursor-pointer ${
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
        <span className="font-bold text-accent">
          {selectedCategoryObj ? selectedCategoryObj.name : 'Tất cả sản phẩm'}
        </span>
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
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-line text-[13px] font-semibold text-ink bg-page hover:bg-surface-2 cursor-pointer"
              >
                <Filter className="w-4 h-4 text-accent" />
                <span>Bộ lọc</span>
              </button>
              <p className="text-[13px] text-ink-muted">
                Tìm thấy{' '}
                <strong className="text-ink font-bold">{totalElements}</strong>{' '}
                sản phẩm
              </p>
            </div>

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
          {catalogLoading && products.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : pagedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {pagedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <div className="pt-6">
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
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
                  className="p-1 text-ink-subtle hover:text-ink cursor-pointer"
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
                className="w-full py-2.5 rounded-md bg-accent hover:bg-accent-hover text-white text-[13px] font-bold shadow-xs transition cursor-pointer"
              >
                Xem kết quả ({totalElements})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
