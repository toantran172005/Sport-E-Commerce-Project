/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useUI } from './UIContext.jsx';
import { couponService } from '../services/couponService.js';
import {
  products as mockProducts,
  categories as mockCategories,
  brands as mockBrands,
  reviews as mockReviews,
} from '../mocks/index.js';

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const { showToast } = useUI();

  const [products, setProducts] = useState(mockProducts);
  const [categoriesList, setCategoriesList] = useState(mockCategories);
  const [brandsList, setBrandsList] = useState(mockBrands);
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

  const addCategory = useCallback((catData) => {
    const newCat = {
      ...catData,
      id: Date.now(),
      productCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCategoriesList((prev) => [...prev, newCat]);
    showToast(`Đã thêm danh mục "${newCat.name}" thành công`, 'success');
    return newCat;
  }, [showToast]);

  const updateCategory = useCallback((id, catData) => {
    setCategoriesList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...catData, updatedAt: new Date().toISOString() } : c))
    );
    showToast('Đã cập nhật thông tin danh mục', 'success');
  }, [showToast]);

  const deleteCategory = useCallback((id) => {
    setCategoriesList((prev) => prev.filter((c) => c.id !== id));
    showToast('Đã xóa danh mục thành công', 'success');
  }, [showToast]);

  const addBrand = useCallback((brandData) => {
    const newBrand = {
      ...brandData,
      id: Date.now(),
      productCount: 0,
      createdAt: new Date().toISOString(),
    };
    setBrandsList((prev) => [...prev, newBrand]);
    showToast(`Đã thêm thương hiệu "${newBrand.name}" thành công`, 'success');
    return newBrand;
  }, [showToast]);

  const updateBrand = useCallback((id, brandData) => {
    setBrandsList((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...brandData, updatedAt: new Date().toISOString() } : b))
    );
    showToast('Đã cập nhật thông tin thương hiệu', 'success');
  }, [showToast]);

  const deleteBrand = useCallback((id) => {
    setBrandsList((prev) => prev.filter((b) => b.id !== id));
    showToast('Đã xóa thương hiệu thành công', 'success');
  }, [showToast]);

  const addProduct = useCallback((productData) => {
    const newProd = {
      ...productData,
      id: Date.now(),
      status: productData.status || 'DRAFT',
      isActive: productData.status === 'ACTIVE',
      soldCount: 0,
      avgRating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    showToast(`Đã tạo sản phẩm "${newProd.name}" (Trạng thái: Bản nháp)`, 'success');
    return newProd;
  }, [showToast]);

  const updateProduct = useCallback((id, productData) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...productData, updatedAt: new Date().toISOString() } : p))
    );
    showToast('Đã cập nhật thông tin sản phẩm', 'success');
  }, [showToast]);

  const updateProductQuick = useCallback((productId, newPrice, newStock) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const updatedBase = Number(newPrice) || p.basePrice;
        return {
          ...p,
          basePrice: updatedBase,
          variants: p.variants.map((v) => ({
            ...v,
            price: updatedBase,
            stock: Number.isNaN(Number(newStock)) ? v.stock : Number(newStock),
          })),
        };
      })
    );
    showToast('Đã cập nhật thông tin sản phẩm', 'success');
  }, [showToast]);

  const setProductStatus = useCallback((productId, nextStatus) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              status: nextStatus,
              isActive: nextStatus === 'ACTIVE',
            }
          : p
      )
    );
    const label =
      nextStatus === 'ACTIVE'
        ? 'Đang bán'
        : nextStatus === 'DRAFT'
        ? 'Bản nháp'
        : nextStatus === 'OUT_OF_STOCK'
        ? 'Hết hàng'
        : 'Ngừng kinh doanh';
    showToast(`Đã chuyển trạng thái sang "${label}"`, 'success');
  }, [showToast]);

  const toggleProductStatus = useCallback((productId) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const current = p.status || (p.isActive ? 'ACTIVE' : 'DRAFT');
        const nextStatus = current === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
        return {
          ...p,
          status: nextStatus,
          isActive: nextStatus === 'ACTIVE',
        };
      })
    );
    showToast('Đã thay đổi trạng thái sản phẩm', 'success');
  }, [showToast]);

  const deleteProductById = useCallback((productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('Đã xóa sản phẩm thành công', 'success');
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
