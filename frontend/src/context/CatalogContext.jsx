/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useUI } from './UIContext.jsx';
import { couponService } from '../services/couponService.js';
import { productService } from '../services/productService.js';
import { categoryService } from '../services/categoryService.js';
import { brandService } from '../services/brandService.js';
import {
  reviews as mockReviews,
} from '../mocks/index.js';

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const { showToast } = useUI();
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [reviews, setReviews] = useState(mockReviews);
  const [coupons, setCoupons] = useState([]);

  const refreshCoupons = useCallback(async () => {
    try {
      const list = await couponService.getCoupons();
      if (Array.isArray(list)) {
        setCoupons(list);
      }
    } catch (err) {
      console.warn('Không thể tải danh sách mã giảm giá từ server:', err.message);
    }
  }, []);

  useEffect(() => {
    refreshCoupons();
  }, [refreshCoupons]);


  const refreshCatalogData = useCallback(async () => {
    try {
      setCatalogLoading(true);
      const [cats, brs, prodsRes] = await Promise.all([
        categoryService.getAllFlatCategories().catch(() => []),
        brandService.getBrands().catch(() => []),
        productService.getProducts({ size: 24 }).catch(() => ({ items: [] })),
      ]);

      setCategoriesList(cats || []);
      setBrandsList(brs || []);
      setProducts(prodsRes.items || prodsRes.content || []);
    } catch (err) {
      console.error('Không thể tải dữ liệu Catalog từ backend:', err);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCatalogData();
  }, [refreshCatalogData]);


  const addCategory = useCallback(async (catData) => {
    try {
      const created = await categoryService.createCategory(catData);
      showToast(`Đã thêm danh mục "${created.name || catData.name}" thành công`, 'success');
      await refreshCatalogData();
      return created;
    } catch (err) {
      showToast(err.message || 'Không thể tạo danh mục', 'error');
      throw err;
    }
  }, [showToast, refreshCatalogData]);

  const updateCategory = useCallback(async (id, catData) => {
    try {
      const updated = await categoryService.updateCategory(id, catData);
      showToast('Đã cập nhật thông tin danh mục', 'success');
      await refreshCatalogData();
      return updated;
    } catch (err) {
      showToast(err.message || 'Không thể cập nhật danh mục', 'error');
      throw err;
    }
  }, [showToast, refreshCatalogData]);

  const deleteCategory = useCallback(async (id) => {
    try {
      await categoryService.deleteCategory(id);
      setCategoriesList((prev) => prev.filter((c) => c.id !== id));
      showToast('Đã xóa danh mục thành công', 'success');
    } catch (err) {
      showToast(err.message || 'Không thể xóa danh mục', 'error');
      throw err;
    }
  }, [showToast]);

  const addBrand = useCallback(async (brandData) => {
    try {
      const created = await brandService.createBrand(brandData);
      showToast(`Đã thêm thương hiệu "${created.name || brandData.name}" thành công`, 'success');
      await refreshCatalogData();
      return created;
    } catch (err) {
      showToast(err.message || 'Không thể thêm thương hiệu', 'error');
      throw err;
    }
  }, [showToast, refreshCatalogData]);

  const updateBrand = useCallback(async (id, brandData) => {
    try {
      const updated = await brandService.updateBrand(id, brandData);
      showToast('Đã cập nhật thông tin thương hiệu', 'success');
      await refreshCatalogData();
      return updated;
    } catch (err) {
      showToast(err.message || 'Không thể cập nhật thương hiệu', 'error');
      throw err;
    }
  }, [showToast, refreshCatalogData]);

  const deleteBrand = useCallback(async (id) => {
    try {
      await brandService.deleteBrand(id);
      setBrandsList((prev) => prev.filter((b) => b.id !== id));
      showToast('Đã xóa thương hiệu thành công', 'success');
    } catch (err) {
      showToast(err.message || 'Không thể xóa thương hiệu', 'error');
      throw err;
    }
  }, [showToast]);


  const addProduct = useCallback(async (productData) => {
    try {
      const created = await productService.createProduct(productData);
      showToast(`Đã tạo sản phẩm "${created.name || productData.name}" thành công`, 'success');
      await refreshCatalogData();
      return created;
    } catch (err) {
      showToast(err.message || 'Không thể tạo sản phẩm', 'error');
      throw err;
    }
  }, [showToast, refreshCatalogData]);

  const updateProduct = useCallback(async (id, productData) => {
    try {
      const updated = await productService.updateProduct(id, productData);
      showToast('Đã cập nhật thông tin sản phẩm', 'success');
      await refreshCatalogData();
      return updated;
    } catch (err) {
      showToast(err.message || 'Không thể cập nhật sản phẩm', 'error');
      throw err;
    }
  }, [showToast, refreshCatalogData]);

  const updateProductQuick = useCallback(async (productId, newPrice, newStock) => {
    try {
      const prod = products.find((p) => p.id === productId);
      if (!prod) return;
      const updatedBase = Number(newPrice) || prod.basePrice;
      const updatedVariants = (prod.variants || []).map((v) => ({
        ...v,
        price: updatedBase,
        stock: Number.isNaN(Number(newStock)) ? v.stock : Number(newStock),
      }));

      await productService.updateProduct(productId, {
        ...prod,
        basePrice: updatedBase,
        variants: updatedVariants,
      });

      showToast('Đã cập nhật giá và tồn kho sản phẩm', 'success');
      await refreshCatalogData();
    } catch (err) {
      showToast(err.message || 'Không thể cập nhật nhanh sản phẩm', 'error');
    }
  }, [products, showToast, refreshCatalogData]);

  const setProductStatus = useCallback(async (productId, nextStatus) => {
    try {
      await productService.updateProductStatus(productId, nextStatus);
      const label =
        nextStatus === 'ACTIVE'
          ? 'Đang bán'
          : nextStatus === 'DRAFT'
          ? 'Bản nháp'
          : nextStatus === 'OUT_OF_STOCK'
          ? 'Hết hàng'
          : 'Ngừng kinh doanh';
      showToast(`Đã chuyển trạng thái sang "${label}"`, 'success');
      await refreshCatalogData();
    } catch (err) {
      showToast(err.message || 'Không thể cập nhật trạng thái', 'error');
    }
  }, [showToast, refreshCatalogData]);

  const toggleProductStatus = useCallback(async (productId) => {
    const currentProd = products.find((p) => p.id === productId);
    if (!currentProd) return;
    const current = currentProd.status || (currentProd.isActive ? 'ACTIVE' : 'DRAFT');
    const nextStatus = current === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    await setProductStatus(productId, nextStatus);
  }, [products, setProductStatus]);

  const deleteProductById = useCallback(async (productId) => {
    try {
      await productService.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast('Đã xóa sản phẩm thành công', 'success');
    } catch (err) {
      showToast(err.message || 'Không thể xóa sản phẩm', 'error');
    }
  }, [showToast]);


  const addCoupon = useCallback(async (couponData) => {
    const created = await couponService.createCoupon(couponData);
    setCoupons((prev) => [created, ...prev.filter((c) => c.id !== created.id && c.code !== created.code)]);
    showToast(`Đã tạo mã giảm giá "${created.code}" thành công`, 'success');
    return created;
  }, [showToast]);

  const updateCoupon = useCallback(async (idOrCode, couponData) => {
    const target = coupons.find((c) => c.id === idOrCode || c.code === idOrCode);
    const id = target?.id ?? idOrCode;
    const updated = await couponService.updateCoupon(id, couponData);
    setCoupons((prev) =>
      prev.map((c) => (c.id === id || c.code === idOrCode ? updated : c))
    );
    showToast(`Đã cập nhật mã giảm giá "${updated.code}"`, 'success');
    return updated;
  }, [coupons, showToast]);

  const deleteCoupon = useCallback(async (idOrCode) => {
    const target = coupons.find((c) => c.id === idOrCode || c.code === idOrCode);
    const id = target?.id ?? idOrCode;
    await couponService.deleteCoupon(id);
    setCoupons((prev) => prev.filter((c) => c.id !== id && c.code !== idOrCode));
    showToast('Đã xóa mã giảm giá thành công', 'success');
  }, [coupons, showToast]);

  const toggleCouponActive = useCallback(async (codeOrId) => {
    const target = coupons.find((c) => c.id === codeOrId || c.code === codeOrId);
    const id = target?.id ?? codeOrId;
    const updated = await couponService.toggleCouponStatus(id);
    setCoupons((prev) =>
      prev.map((c) => (c.id === id || c.code === codeOrId ? updated : c))
    );
    showToast('Đã cập nhật trạng thái mã giảm giá', 'success');
    return updated;
  }, [coupons, showToast]);

  const updateReviewStatus = useCallback((reviewId, newStatus) => {
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r)));
    const msg =
      newStatus === 'APPROVED'
        ? 'Đã phê duyệt đánh giá thành công'
        : newStatus === 'REJECTED'
          ? 'Đã ẩn đánh giá khỏi cửa hàng'
          : 'Đã chuyển đánh giá về trạng thái Chờ duyệt (PENDING)';
    showToast(msg, 'success');
  }, [showToast]);

  const replyToReview = useCallback((reviewId, replyText) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              status: 'APPROVED',
              replyText,
              reply: {
                id: Date.now(),
                replyText,
                createdAt: new Date().toISOString(),
                adminName: 'Ban Quản Trị Cửa Hàng',
              },
            }
          : r
      )
    );
    showToast('Đã gửi phản hồi và phê duyệt đánh giá thành công!', 'success');
  }, [showToast]);

  const removeReviewReply = useCallback((reviewId) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              reply: null,
              replyText: '',
              status: 'PENDING',
            }
          : r
      )
    );
    showToast('Đã thu hồi phản hồi và chuyển về trạng thái Chờ duyệt (PENDING)', 'success');
  }, [showToast]);

  const value = useMemo(
    () => ({
      products,
      setProducts,
      categoriesList,
      setCategoriesList,
      brandsList,
      setBrandsList,
      catalogLoading,
      refreshCatalogData,
      reviews,
      setReviews,
      coupons,
      setCoupons,
      refreshCoupons,
      addCategory,
      updateCategory,
      deleteCategory,
      addBrand,
      updateBrand,
      deleteBrand,
      addProduct,
      updateProduct,
      updateProductQuick,
      setProductStatus,
      toggleProductStatus,
      deleteProductById,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      toggleCouponActive,
      updateReviewStatus,
      replyToReview,
      removeReviewReply,
    }),
    [
      products,
      categoriesList,
      brandsList,
      catalogLoading,
      refreshCatalogData,
      reviews,
      coupons,
      refreshCoupons,
      addCategory,
      updateCategory,
      deleteCategory,
      addBrand,
      updateBrand,
      deleteBrand,
      addProduct,
      updateProduct,
      updateProductQuick,
      setProductStatus,
      toggleProductStatus,
      deleteProductById,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      toggleCouponActive,
      updateReviewStatus,
      replyToReview,
      removeReviewReply,
    ]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error('useCatalog phải được sử dụng bên trong CatalogProvider');
  }
  return ctx;
}