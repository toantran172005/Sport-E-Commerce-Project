/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useUI } from './UIContext.jsx';
import {
  products as mockProducts,
  categories as mockCategories,
  brands as mockBrands,
  reviews as mockReviews,
  coupons as mockCoupons,
} from '../mocks/index.js';

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const { showToast } = useUI();

  const [products, setProducts] = useState(mockProducts);
  const [categoriesList, setCategoriesList] = useState(mockCategories);
  const [brandsList, setBrandsList] = useState(mockBrands);
  const [reviews, setReviews] = useState(mockReviews);
  const [coupons, setCoupons] = useState(mockCoupons);

  // Category Actions
  const addCategory = useCallback((catData) => {
    const newCat = {
      ...catData,
      id: Date.now(),
      productCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCategoriesList((prev) => [...prev, newCat]);
    showToast(`Đã thêm danh mục "${newCat.name}" thành công`);
    return newCat;
  }, [showToast]);

  const updateCategory = useCallback((id, catData) => {
    setCategoriesList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...catData, updatedAt: new Date().toISOString() } : c))
    );
    showToast('Đã cập nhật thông tin danh mục');
  }, [showToast]);

  const deleteCategory = useCallback((id) => {
    setCategoriesList((prev) => prev.filter((c) => c.id !== id));
    showToast('Đã xóa danh mục thành công');
  }, [showToast]);

  // Brand Actions
  const addBrand = useCallback((brandData) => {
    const newBrand = {
      ...brandData,
      id: Date.now(),
      productCount: 0,
      createdAt: new Date().toISOString(),
    };
    setBrandsList((prev) => [...prev, newBrand]);
    showToast(`Đã thêm thương hiệu "${newBrand.name}" thành công`);
    return newBrand;
  }, [showToast]);

  const updateBrand = useCallback((id, brandData) => {
    setBrandsList((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...brandData, updatedAt: new Date().toISOString() } : b))
    );
    showToast('Đã cập nhật thông tin thương hiệu');
  }, [showToast]);

  const deleteBrand = useCallback((id) => {
    setBrandsList((prev) => prev.filter((b) => b.id !== id));
    showToast('Đã xóa thương hiệu thành công');
  }, [showToast]);

  // Product Actions
  const addProduct = useCallback((productData) => {
    const newProd = {
      ...productData,
      id: Date.now(),
      status: productData.status || 'DRAFT', // Always DRAFT on creation unless specified
      isActive: productData.status === 'ACTIVE',
      soldCount: 0,
      avgRating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    showToast(`Đã tạo sản phẩm "${newProd.name}" (Trạng thái: Bản nháp)`);
    return newProd;
  }, [showToast]);

  const updateProduct = useCallback((id, productData) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...productData, updatedAt: new Date().toISOString() } : p))
    );
    showToast('Đã cập nhật thông tin sản phẩm');
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
    showToast('Đã cập nhật thông tin sản phẩm');
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
    showToast(`Đã chuyển trạng thái sang "${label}"`);
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
    showToast('Đã thay đổi trạng thái sản phẩm');
  }, [showToast]);

  const deleteProductById = useCallback((productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('Đã xóa sản phẩm thành công');
  }, [showToast]);

  const addCoupon = useCallback((couponData) => {
    const cleanCode = (couponData.code || '').trim().toUpperCase();
    const newCoupon = {
      ...couponData,
      id: Date.now(),
      code: cleanCode,
      usedCount: 0,
      isActive: couponData.isActive !== false,
      createdAt: new Date().toISOString(),
    };
    setCoupons((prev) => [newCoupon, ...prev.filter((c) => c.code !== cleanCode)]);
    showToast(`Đã tạo mã giảm giá "${cleanCode}" thành công`);
    return newCoupon;
  }, [showToast]);

  const updateCoupon = useCallback((idOrCode, couponData) => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === idOrCode || c.code === idOrCode
          ? { ...c, ...couponData, updatedAt: new Date().toISOString() }
          : c
      )
    );
    showToast('Đã cập nhật mã giảm giá');
  }, [showToast]);

  const deleteCoupon = useCallback((idOrCode) => {
    setCoupons((prev) => prev.filter((c) => c.id !== idOrCode && c.code !== idOrCode));
    showToast('Đã xóa mã giảm giá thành công');
  }, [showToast]);

  const toggleCouponActive = useCallback((codeOrId) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === codeOrId || c.id === codeOrId ? { ...c, isActive: !c.isActive } : c))
    );
    showToast('Đã cập nhật trạng thái mã giảm giá');
  }, [showToast]);

  const updateReviewStatus = useCallback((reviewId, newStatus) => {
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r)));
    const msg =
      newStatus === 'APPROVED'
        ? 'Đã phê duyệt đánh giá thành công'
        : newStatus === 'REJECTED'
          ? 'Đã ẩn đánh giá khỏi cửa hàng'
          : 'Đã chuyển đánh giá về trạng thái Chờ duyệt (PENDING)';
    showToast(msg);
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
    showToast('Đã gửi phản hồi và phê duyệt đánh giá thành công!');
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
    showToast('Đã thu hồi phản hồi và chuyển về trạng thái Chờ duyệt (PENDING)');
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
    throw new Error('useCatalog must be used within CatalogProvider');
  }
  return ctx;
}
