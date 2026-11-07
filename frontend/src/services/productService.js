import { products as initialProducts } from '../mocks/products.js';
import { brands } from '../mocks/brands.js';
import { categories } from '../mocks/categories.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const fakeDelay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

let mockProducts = [...initialProducts];

export const productService = {
  async getProducts(params = {}) {
    if (USE_MOCK) {
      await fakeDelay();
      const {
        page = 0,
        size = 12,
        limit,
        categoryId,
        brandId,
        sportType,
        minPrice,
        maxPrice,
        rating,
        tagId,
        status = 'ACTIVE',
        sort = 'popular',
        q = '',
      } = params;

      let filtered = [...mockProducts];

      if (status && status !== 'ALL') {
        filtered = filtered.filter((p) => p.status === status);
      }

      if (q && q.trim()) {
        const query = q.trim().toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.slug.toLowerCase().includes(query)
        );
      }

      if (categoryId) {
        filtered = filtered.filter((p) => p.categoryId === Number(categoryId));
      }

      if (brandId) {
        filtered = filtered.filter((p) => p.brandId === Number(brandId));
      }

      if (sportType) {
        filtered = filtered.filter((p) => p.sportType === sportType);
      }

      if (minPrice !== undefined && minPrice !== '') {
        filtered = filtered.filter((p) => (p.salePrice || p.basePrice) >= Number(minPrice));
      }

      if (maxPrice !== undefined && maxPrice !== '') {
        filtered = filtered.filter((p) => (p.salePrice || p.basePrice) <= Number(maxPrice));
      }

      if (rating) {
        filtered = filtered.filter((p) => p.avgRating >= Number(rating));
      }

      if (tagId) {
        filtered = filtered.filter((p) => p.tagIds?.includes(Number(tagId)));
      }

      switch (sort) {
        case 'price_asc':
          filtered.sort((a, b) => (a.salePrice || a.basePrice) - (b.salePrice || b.basePrice));
          break;
        case 'price_desc':
          filtered.sort((a, b) => (b.salePrice || b.basePrice) - (a.salePrice || a.basePrice));
          break;
        case 'newest':
          filtered.sort((a, b) => b.id - a.id);
          break;
        case 'best_seller':
          filtered.sort((a, b) => b.soldCount - a.soldCount);
          break;
        case 'rating':
          filtered.sort((a, b) => b.avgRating - a.avgRating);
          break;
        case 'popular':
        default:
          filtered.sort((a, b) => b.soldCount * 0.7 + b.avgRating * 20 - (a.soldCount * 0.7 + a.avgRating * 20));
          break;
      }

      const totalElements = filtered.length;
      const pageSize = Number(size || limit || 12);
      const totalPages = Math.ceil(totalElements / pageSize) || 1;
      const pageNumber = Math.max(0, Math.min(Number(page ?? 0), Math.max(0, totalPages - 1)));
      const start = pageNumber * pageSize;
      const items = filtered.slice(start, start + pageSize);

      const enrichedItems = items.map((item) => ({
        ...item,
        brand: brands.find((b) => b.id === item.brandId),
        category: categories.find((c) => c.id === item.categoryId),
      }));

      return {
        content: enrichedItems,
        items: enrichedItems,
        number: pageNumber,
        page: pageNumber,
        size: pageSize,
        limit: pageSize,
        totalElements,
        total: totalElements,
        totalPages,
        numberOfElements: enrichedItems.length,
        first: pageNumber === 0,
        last: pageNumber >= totalPages - 1,
        empty: enrichedItems.length === 0,
      };
    }

    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get('/products', { params });
  },

  async getProductById(id) {
    if (USE_MOCK) {
      await fakeDelay(250);
      const product = mockProducts.find(
        (p) => String(p.id) === String(id) || p.slug === String(id)
      );
      if (!product) throw new Error('Không tìm thấy sản phẩm');

      return {
        ...product,
        brand: brands.find((b) => b.id === product.brandId),
        category: categories.find((c) => c.id === product.categoryId),
      };
    }

    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get(`/products/${id}`);
  },

  async getFeaturedProducts(limit = 4) {
    if (USE_MOCK) {
      await fakeDelay(200);
      return mockProducts.filter((p) => p.isFeatured).slice(0, limit);
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get('/products/featured', { params: { limit } });
  },

  async getBestSellerProducts(limit = 8) {
    if (USE_MOCK) {
      await fakeDelay(200);
      return [...mockProducts]
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, limit);
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get('/products/best-sellers', { params: { limit } });
  },

  async createProduct(data) {
    if (USE_MOCK) {
      await fakeDelay();
      const newId = Math.max(...mockProducts.map((p) => p.id), 0) + 1;
      const newProduct = {
        ...data,
        id: newId,
        avgRating: 5.0,
        reviewCount: 0,
        soldCount: 0,
        status: data.status || 'ACTIVE',
      };
      mockProducts.unshift(newProduct);
      return newProduct;
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.post('/products', data);
  },

  async updateProduct(id, data) {
    if (USE_MOCK) {
      await fakeDelay();
      const index = mockProducts.findIndex((p) => String(p.id) === String(id));
      if (index === -1) throw new Error('Không tìm thấy sản phẩm');
      mockProducts[index] = { ...mockProducts[index], ...data };
      return mockProducts[index];
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.put(`/products/${id}`, data);
  },

  async deleteProduct(id) {
    if (USE_MOCK) {
      await fakeDelay();
      mockProducts = mockProducts.filter((p) => String(p.id) !== String(id));
      return { success: true };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.delete(`/products/${id}`);
  },
};

export default productService;
