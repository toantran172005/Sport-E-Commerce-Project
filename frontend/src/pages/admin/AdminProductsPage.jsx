import { useState } from 'react';
import {
  Package,
  Layers,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  FileQuestion,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import AdminLayout from '../../layouts/AdminLayout';
import { formatCurrency } from '../../utils/formatters';

export default function AdminProductsPage() {
  const {
    products,
    categoriesList,
    brandsList,
    openModal,
    setProductStatus,
    toggleProductStatus,
    deleteProductById,
    deleteCategory,
    deleteBrand,
  } = useStore();

  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'categories' | 'brands'
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredProducts = products.filter((p) => {
    if (
      categoryFilter !== 'ALL' &&
      String(p.categoryId) !== categoryFilter &&
      p.category !== categoryFilter
    ) {
      return false;
    }
    if (
      brandFilter !== 'ALL' &&
      String(p.brandId) !== brandFilter &&
      p.brand !== brandFilter
    ) {
      return false;
    }
    const currentStatus = p.status || (p.isActive ? 'ACTIVE' : 'DRAFT');
    if (statusFilter !== 'ALL') {
      if (statusFilter !== currentStatus) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalVariants = products.reduce(
    (sum, p) => sum + (p.variants?.length || 1),
    0
  );
  const lowStockCount = products.filter((p) => {
    const stock = p.stock ?? p.variants?.reduce((s, v) => s + (v.stock || 0), 0) ?? 0;
    return stock <= 10;
  }).length;

  const handleDeleteCategory = (cat) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`)) {
      deleteCategory(cat.id);
    }
  };

  const handleDeleteBrand = (b) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thương hiệu "${b.name}"?`)) {
      deleteBrand(b.id);
    }
  };

  const handleDeleteProduct = (product) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
      deleteProductById(product.id);
    }
  };

  const getStatusBadge = (product) => {
    const currentStatus = product.status || (product.isActive ? 'ACTIVE' : 'DRAFT');

    switch (currentStatus) {
      case 'DRAFT':
        return (
          <button
            type="button"
            onClick={() => setProductStatus(product.id, 'ACTIVE')}
            title="Nhấp để chuyển sang Đang bán (ACTIVE)"
            className="px-2.5 py-1 rounded text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1 cursor-pointer transition hover:bg-amber-500/20"
          >
            <FileQuestion className="w-3.5 h-3.5" />
            <span>Bản nháp</span>
          </button>
        );
      case 'ACTIVE':
        return (
          <button
            type="button"
            onClick={() => setProductStatus(product.id, 'DRAFT')}
            title="Nhấp để chuyển về Bản nháp (DRAFT)"
            className="px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 cursor-pointer transition hover:bg-emerald-500/20"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Hoạt động</span>
          </button>
        );
      case 'OUT_OF_STOCK':
        return (
          <button
            type="button"
            onClick={() => toggleProductStatus(product.id)}
            title="Nhấp để đổi trạng thái"
            className="px-2.5 py-1 rounded text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1 cursor-pointer transition hover:bg-rose-500/20"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Hết hàng</span>
          </button>
        );
      case 'DISCONTINUED':
      default:
        return (
          <button
            type="button"
            onClick={() => setProductStatus(product.id, 'ACTIVE')}
            title="Nhấp để kích hoạt lại sản phẩm"
            className="px-2.5 py-1 rounded text-[11px] font-bold bg-surface-2 text-ink-muted border border-line flex items-center gap-1 cursor-pointer transition hover:bg-surface"
          >
            <span>Ngừng bán</span>
          </button>
        );
    }
  };

  return (
    <AdminLayout
      searchPlaceholder="Tìm tên sản phẩm, mã SKU, thương hiệu..."
      onSearchChange={setSearch}
    >
      <div className="space-y-6 text-ink">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-extrabold text-ink flex items-center gap-2">
              <Package className="w-6 h-6 text-accent" />
              <span>Quản Lý Sản Phẩm, Biến Thể &amp; Danh Mục</span>
            </h1>
            <p className="text-[13px] text-ink-muted mt-0.5">
              Quản trị bảng <code className="font-bold text-accent">products</code>,{' '}
              <code className="font-bold text-accent">product_variants</code>,{' '}
              <code className="font-bold text-accent">categories</code> &amp;{' '}
              <code className="font-bold text-accent">brands</code>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openModal('admin_product_modal')}
              className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold shadow-xs flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Sản Phẩm Mới</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-surface rounded-lg border border-line p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[11px] font-extrabold uppercase text-ink-muted">
                TỔNG SẢN PHẨM (PRODUCTS)
              </p>
              <p className="text-[20px] font-extrabold text-ink mt-1">
                {products.length} sản phẩm
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface rounded-lg border border-line p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[11px] font-extrabold uppercase text-ink-muted">
                BIẾN THỂ SKU (VARIANTS)
              </p>
              <p className="text-[20px] font-extrabold text-accent mt-1">
                {totalVariants} mã SKU
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface rounded-lg border border-line p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[11px] font-extrabold uppercase text-ink-muted">
                CẢNH BÁO TỒN KHO THẤP
              </p>
              <p className="text-[20px] font-extrabold text-danger mt-1">
                {lowStockCount} sản phẩm
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-danger-soft text-danger flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface rounded-lg border border-line p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[11px] font-extrabold uppercase text-ink-muted">
                DANH MỤC &amp; THƯƠNG HIỆU
              </p>
              <p className="text-[20px] font-extrabold text-ink mt-1">
                {categoriesList.length} DM • {brandsList.length} Brand
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-line gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`pb-3 px-4 text-[13px] font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'products'
                ? 'border-accent text-accent'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            Danh Sách Sản Phẩm &amp; Biến Thể ({filteredProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`pb-3 px-4 text-[13px] font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'categories'
                ? 'border-accent text-accent'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            Quản Lý Danh Mục ({categoriesList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('brands')}
            className={`pb-3 px-4 text-[13px] font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'brands'
                ? 'border-accent text-accent'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            Quản Lý Thương Hiệu ({brandsList.length})
          </button>
        </div>

        {/* TAB 1: PRODUCTS LIST */}
        {activeTab === 'products' && (
          <div className="bg-surface rounded-lg border border-line overflow-hidden shadow-xs">
            {/* Filter controls */}
            <div className="p-4 border-b border-line flex flex-wrap items-center justify-between gap-3 bg-surface-2/40">
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-9 px-3 rounded-md bg-page border border-line text-[12.5px] font-bold text-ink focus:outline-none focus:border-accent"
                >
                  <option value="ALL">Danh mục: Tất cả</option>
                  {categoriesList.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="h-9 px-3 rounded-md bg-page border border-line text-[12.5px] font-bold text-ink focus:outline-none focus:border-accent"
                >
                  <option value="ALL">Thương hiệu: Tất cả</option>
                  {brandsList.map((b) => (
                    <option key={b.id} value={String(b.id)}>
                      {b.name}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-3 rounded-md bg-page border border-line text-[12.5px] font-bold text-ink focus:outline-none focus:border-accent"
                >
                  <option value="ALL">Trạng thái: Tất cả</option>
                  <option value="DRAFT">Bản nháp (DRAFT)</option>
                  <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
                  <option value="OUT_OF_STOCK">Hết hàng (OUT_OF_STOCK)</option>
                  <option value="DISCONTINUED">Ngừng bán (DISCONTINUED)</option>
                </select>
              </div>

              <span className="text-[12.5px] text-ink-muted">
                Hiển thị <strong className="text-ink">{filteredProducts.length}</strong>{' '}
                sản phẩm
              </span>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-surface-2 text-[11px] font-extrabold uppercase text-ink-muted border-b border-line">
                    <th className="py-3 px-3">SẢN PHẨM</th>
                    <th className="py-3 px-3">DANH MỤC / BRAND</th>
                    <th className="py-3 px-3">BIẾN THỂ &amp; SKU</th>
                    <th className="py-3 px-3">GIÁ BÁN</th>
                    <th className="py-3 px-3">TỒN KHO</th>
                    <th className="py-3 px-3">ĐÃ BÁN / ĐÁNH GIÁ</th>
                    <th className="py-3 px-3">TRẠNG THÁI</th>
                    <th className="py-3 px-3 text-right">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredProducts.map((product) => {
                    const primaryImg =
                      product.images?.[0]?.imageUrl ||
                      product.images?.[0]?.url ||
                      product.image;
                    const stock = product.stock ?? product.variants?.reduce((s, v) => s + (v.stock || 0), 0) ?? 20;
                    const isLowStock = stock <= 10;

                    return (
                      <tr key={product.id} className="hover:bg-surface-2/60 transition">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-md bg-surface-2 border border-line overflow-hidden shrink-0 flex items-center justify-center">
                              {primaryImg ? (
                                <img
                                  src={primaryImg}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-6 h-6 text-ink-subtle" />
                              )}
                            </div>
                            <div className="min-w-0 max-w-[220px]">
                              <p className="font-bold text-ink line-clamp-1">
                                {product.name}
                              </p>
                              <p className="text-[11px] text-ink-subtle mt-0.5">
                                Slug: /{product.slug} • Môn: {product.sportType}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-accent-soft text-accent text-[11px] font-bold">
                            {product.brand?.name || product.brand || 'Sân Nhà'}
                          </span>
                          <p className="text-[12px] text-ink-muted mt-1">
                            {product.category?.name || product.category || 'Thể thao'}
                          </p>
                        </td>

                        <td className="py-3 px-3">
                          <p className="font-bold text-ink">{product.sku || product.variants?.[0]?.sku || 'SKU-STD'}</p>
                          <p className="text-[11.5px] text-ink-muted">
                            {product.variants?.length || 1} biến thể
                          </p>
                        </td>

                        <td className="py-3 px-3">
                          <p className="font-bold text-accent">
                            {formatCurrency(product.price || product.basePrice)}
                          </p>
                          {product.salePrice && (
                            <p className="text-[11px] text-ink-subtle line-through">
                              {formatCurrency(product.basePrice)}
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`font-bold ${
                              isLowStock ? 'text-danger' : 'text-ink'
                            }`}
                          >
                            {stock} chiếc
                          </span>
                          {isLowStock && (
                            <span className="block text-[10px] text-danger font-bold">
                              Sắp hết!
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <p className="font-semibold text-ink">
                            Đã bán: <strong>{product.soldCount || 0}</strong>
                          </p>
                          <p className="text-[11.5px] text-amber-500 font-bold">
                            ★ {product.avgRating?.toFixed(1) || '5.0'}
                          </p>
                        </td>

                        <td className="py-3 px-3">
                          {getStatusBadge(product)}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                openModal('admin_product_modal', { product })
                              }
                              className="p-1.5 rounded-md hover:bg-surface-2 text-ink-muted hover:text-accent transition cursor-pointer"
                              title="Chỉnh sửa sản phẩm"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product)}
                              className="p-1.5 rounded-md hover:bg-danger-soft text-ink-muted hover:text-danger transition cursor-pointer"
                              title="Xóa sản phẩm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES (Matching Image 1 & Image 6) */}
        {activeTab === 'categories' && (
          <div className="bg-surface rounded-lg border border-line p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <p className="text-[13px] text-ink-muted">
                Quản lý cây danh mục (CategoryController —{' '}
                <code className="font-bold text-accent">/api/categories</code>)
              </p>
              <button
                type="button"
                onClick={() => openModal('admin_category_modal')}
                className="px-3.5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Danh Mục</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-surface-2 text-[11px] font-extrabold uppercase text-ink-muted border-b border-line">
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">TÊN DANH MỤC</th>
                    <th className="py-3 px-3">SLUG URL</th>
                    <th className="py-3 px-3">DANH MỤC CHA</th>
                    <th className="py-3 px-3">SỐ SẢN PHẨM</th>
                    <th className="py-3 px-3">TRẠNG THÁI</th>
                    <th className="py-3 px-3 text-right">HÀNH ĐỘNG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {categoriesList.map((cat) => {
                    const parentCat = categoriesList.find((c) => c.id === cat.parentId);
                    const prodCount = products.filter(
                      (p) => String(p.categoryId) === String(cat.id) || p.category === cat.name
                    ).length;

                    return (
                      <tr key={cat.id} className="hover:bg-surface-2/60 transition">
                        <td className="py-3 px-3 font-bold text-ink-muted">
                          #{cat.id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-md bg-surface-2 border border-line overflow-hidden shrink-0 flex items-center justify-center">
                              {cat.imageUrl ? (
                                <img
                                  src={cat.imageUrl}
                                  alt={cat.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="font-bold text-accent text-[12px]">
                                  {(cat.name?.[0] || 'C').toUpperCase()}
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-ink">{cat.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-ink-muted">
                          {cat.slug}
                        </td>
                        <td className="py-3 px-3 text-ink-muted">
                          {parentCat ? parentCat.name : '— Danh mục gốc'}
                        </td>
                        <td className="py-3 px-3 font-bold text-accent">
                          {prodCount} SP
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Hiển thị
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openModal('admin_category_modal', { category: cat })}
                              className="p-1.5 rounded-md hover:bg-surface-2 text-ink-muted hover:text-accent transition cursor-pointer"
                              title="Chỉnh sửa danh mục"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1.5 rounded-md hover:bg-danger-soft text-ink-muted hover:text-danger transition cursor-pointer"
                              title="Xóa danh mục"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BRANDS (Matching Image 2 & Image 5) */}
        {activeTab === 'brands' && (
          <div className="bg-surface rounded-lg border border-line p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <p className="text-[13px] text-ink-muted">
                Quản lý thương hiệu đối tác (BrandController —{' '}
                <code className="font-bold text-accent">/api/brands</code>)
              </p>
              <button
                type="button"
                onClick={() => openModal('admin_brand_modal')}
                className="px-3.5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Thương Hiệu</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {brandsList.map((b) => {
                const prodCount = products.filter(
                  (p) => String(p.brandId) === String(b.id) || p.brand === b.name
                ).length;

                return (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl border border-line bg-surface flex items-center justify-between hover:border-accent/40 transition shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-surface-2 border border-line overflow-hidden shrink-0 flex items-center justify-center p-1">
                        {b.logoUrl ? (
                          <img
                            src={b.logoUrl}
                            alt={b.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-lg font-bold text-accent">
                            {(b.name?.[0] || 'B').toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[15px] font-bold text-ink">{b.name}</h3>
                          <span className="px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10.5px] font-bold">
                            Active
                          </span>
                        </div>
                        <p className="text-[12px] text-ink-muted mt-0.5 line-clamp-1 max-w-[200px]" title={b.description || 'Chưa có mô tả'}>
                          {b.description || 'Chưa có mô tả'} • /{b.slug}
                        </p>
                        <p className="text-[12px] font-bold text-accent mt-0.5">
                          {prodCount} sản phẩm
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openModal('admin_brand_modal', { brand: b })}
                        className="p-1.5 rounded-md hover:bg-surface-2 text-ink-muted hover:text-accent transition cursor-pointer border border-line"
                        title="Chỉnh sửa thương hiệu"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBrand(b)}
                        className="p-1.5 rounded-md hover:bg-danger-soft text-ink-muted hover:text-danger transition cursor-pointer border border-line"
                        title="Xóa thương hiệu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
