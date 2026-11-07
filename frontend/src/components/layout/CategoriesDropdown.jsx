import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Layers,
  ArrowRight,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export default function CategoriesDropdown() {
  const { isCategoriesOpen, setIsCategoriesOpen, categoriesList, products } = useStore();
  const [activeCatId, setActiveCatId] = useState(categoriesList[0]?.id || 1);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isCategoriesOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCategoriesOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCategoriesOpen, setIsCategoriesOpen]);

  if (!isCategoriesOpen) return null;

  const currentCategory =
    categoriesList.find((c) => c.id === activeCatId) || categoriesList[0] || {};

  // Lấy 4 sản phẩm tiêu biểu thuộc danh mục này
  const categoryProducts = products
    .filter((p) => p.categoryId === currentCategory.id)
    .slice(0, 4);

  const handleSelectCategory = (catId = null) => {
    setIsCategoriesOpen(false);
    if (catId) {
      navigate(`/products?categoryId=${catId}`);
    } else {
      navigate('/products');
    }
  };

  const handleSelectProduct = (productId) => {
    setIsCategoriesOpen(false);
    navigate(`/products/${productId}`);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-40 top-[64px]"
        onClick={() => setIsCategoriesOpen(false)}
      />

      {/* Mega Menu Container - Căn giữa trang web dưới Header */}
      <div
        ref={containerRef}
        className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+4px)] w-[980px] max-w-[95vw] bg-surface rounded-lg shadow-2xl border border-line z-50 overflow-hidden grid grid-cols-12 animate-in fade-in duration-150 text-ink"
      >
        {/* Left Column: Danh sách danh mục chính (col-span-4) */}
        <div className="col-span-4 bg-surface-2/60 border-r border-line p-3 flex flex-col justify-between">
          <div className="space-y-1">
            <p className="px-3 py-1.5 text-[11px] font-bold text-ink-subtle uppercase tracking-wider">
              Danh Mục Sản Phẩm
            </p>
            {categoriesList.map((cat) => {
              const isActive = currentCategory.id === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onMouseEnter={() => setActiveCatId(cat.id)}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[13px] font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-accent text-white shadow-xs'
                      : 'text-ink hover:bg-surface hover:text-accent'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Layers className={`w-4 h-4 ${isActive ? 'text-white' : 'text-accent'}`} />
                    <span>{cat.name}</span>
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-ink-subtle'}`} />
                </button>
              );
            })}
          </div>

          <div className="pt-3 mt-2 border-t border-line px-2">
            <button
              type="button"
              onClick={() => handleSelectCategory(null)}
              className="text-[12.5px] font-bold text-accent hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>Xem tất cả sản phẩm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Chi tiết danh mục & Sản phẩm tiêu biểu (col-span-8) */}
        <div className="col-span-8 p-5 flex flex-col justify-between bg-surface">
          <div>
            {/* Header chi tiết danh mục */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-line">
              <div>
                <h4 className="text-[16px] font-extrabold text-ink">
                  {currentCategory.name}
                </h4>
                <p className="text-[12px] text-ink-muted">
                  {currentCategory.description || 'Trang thiết bị và phụ kiện thể thao chính hãng'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSelectCategory(currentCategory.id)}
                className="text-[12.5px] font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Xem tất cả {currentCategory.name}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Lưới sản phẩm tiêu biểu của danh mục */}
            <div className="grid grid-cols-2 gap-3">
              {categoryProducts.length > 0 ? (
                categoryProducts.map((p) => {
                  const img =
                    p.images?.[0]?.imageUrl ||
                    p.image ||
                    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400';
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p.id)}
                      className="p-2.5 rounded-lg border border-line hover:border-accent bg-surface-2/40 hover:bg-surface text-left transition group cursor-pointer flex items-center gap-3"
                    >
                      <img
                        src={img}
                        alt={p.name}
                        className="w-14 h-14 rounded-md object-cover bg-page shrink-0 border border-line"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-bold text-ink group-hover:text-accent line-clamp-1">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-ink-subtle mt-0.5">
                          {p.brand?.name || 'Sân Nhà'}
                        </p>
                        <p className="text-[12px] font-extrabold text-accent mt-1">
                          {formatCurrency(p.salePrice || p.basePrice)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 py-8 text-center text-[13px] text-ink-subtle flex flex-col items-center justify-center gap-2">
                  <Package className="w-8 h-8 text-ink-subtle" />
                  <span>Khám phá các sản phẩm nổi bật thuộc danh mục {currentCategory.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Banner chân menu */}
          <div className="mt-5 p-3.5 rounded-lg bg-surface-2 border border-line flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-accent-soft text-accent flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-[12.5px] font-bold text-ink">
                  Cam kết hàng chính hãng 100%
                </p>
                <p className="text-[11px] text-ink-muted">
                  Bảo hành đổi trả nhanh chóng trong 7 ngày trên toàn quốc
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSelectCategory(currentCategory.id)}
              className="px-3.5 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-[12px] font-bold transition shadow-xs cursor-pointer"
            >
              Xem ngay
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
