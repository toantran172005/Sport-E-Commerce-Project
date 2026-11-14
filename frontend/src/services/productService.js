import axiosClient from '../api/axiosClient.js';

function normalizeProductItem(p) {
  if (!p) return p;

  const primaryImage =
    p.primaryImageUrl ||
    p.images?.find((img) => img.isPrimary)?.imageUrl ||
    p.images?.[0]?.imageUrl ||
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600';

  return {
    ...p,
    primaryImageUrl: primaryImage,
    images:
      Array.isArray(p.images) && p.images.length > 0
        ? p.images.map((img) => (typeof img === 'string' ? { imageUrl: img } : img))
        : [{ imageUrl: primaryImage, isPrimary: true }],
    brand: p.brand || {
      id: p.brandId,
      name: p.brandName || 'Delta Sport',
    },
    category: p.category || {
      id: p.categoryId,
      name: p.categoryName || 'Đồ thể thao',
    },
  };
}

export const productService = {
  async getProducts(params = {}) {
    const {
      page = 0,
      size,
      limit,
      categoryId,
      brandId,
      tagId,
      sportType,
      status,
      sort,
      q,
      minPrice,
      maxPrice,
      rating,
    } = params;

    const queryParams = {
      page: Number(page) || 0,
      size: Number(size || limit || 12),
    };

    if (q && q.trim()) queryParams.keyword = q.trim();
    if (categoryId) queryParams.categoryId = Number(categoryId);
    if (brandId) queryParams.brandId = Number(brandId);
    if (tagId) queryParams.tagId = Number(tagId);
    if (sportType) queryParams.sportType = sportType;

    if (minPrice !== undefined && minPrice !== '' && !Number.isNaN(Number(minPrice))) {
      queryParams.minPrice = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== '' && !Number.isNaN(Number(maxPrice))) {
      queryParams.maxPrice = Number(maxPrice);
    }
    if (rating !== undefined && rating !== '' && !Number.isNaN(Number(rating))) {
      queryParams.rating = Number(rating);
    }


    if (status && status !== 'ALL') {
      queryParams.status = status;
    }

    switch (sort) {
      case 'price_asc':
        queryParams.sort = 'basePrice,asc';
        break;
      case 'price_desc':
        queryParams.sort = 'basePrice,desc';
        break;
      case 'newest':
        queryParams.sort = 'createdAt,desc';
        break;
      case 'best_seller':
        queryParams.sort = 'soldCount,desc';
        break;
      case 'rating':
        queryParams.sort = 'avgRating,desc';
        break;
      case 'popular':
      default:
        queryParams.sort = 'createdAt,desc';
        break;
    }

    const res = await axiosClient.get('/products', { params: queryParams });

    const rawList = res.content || [];
    const normalizedItems = rawList.map(normalizeProductItem);

    return {
      ...res,
      content: normalizedItems,
      items: normalizedItems,
      page: res.page ?? queryParams.page,
      number: res.page ?? queryParams.page,
      size: res.size ?? queryParams.size,
      limit: res.size ?? queryParams.size,
      totalElements: res.totalElements ?? normalizedItems.length,
      total: res.totalElements ?? normalizedItems.length,
      totalPages: res.totalPages ?? 1,
      last: res.last ?? true,
      first: (res.page ?? 0) === 0,
      empty: normalizedItems.length === 0,
    };
  },


  async getProductById(id) {
    if (!id) throw new Error('ID sản phẩm không hợp lệ');
    const data = await axiosClient.get(`/products/${id}`);
    return normalizeProductItem(data);
  },

  async getFeaturedProducts(limit = 4) {
    const res = await this.getProducts({
      limit,
      status: 'ACTIVE',
      sort: 'newest',
    });
    return res.items || [];
  },

  async getBestSellerProducts(limit = 8) {
    const res = await this.getProducts({
      limit,
      status: 'ACTIVE',
      sort: 'best_seller',
    });
    return res.items || [];
  },


  async createProduct(data) {
    const payload = {
      ...data,
      categoryId: Number(data.categoryId),
      brandId: data.brandId ? Number(data.brandId) : null,
      basePrice: Number(data.basePrice),
      salePrice: data.salePrice ? Number(data.salePrice) : null,
      variants: (data.variants || []).map((v) => ({
        ...v,
        price: Number(v.price) || Number(data.basePrice),
        salePrice: v.salePrice ? Number(v.salePrice) : null,
        stock: Number(v.stock) || 0,
        weightGram: Number(v.weightGram || v.weight || 100),
      })),
    };
    return axiosClient.post('/products', payload);
  },


  async updateProduct(id, data) {
    const payload = {
      ...data,
      categoryId: Number(data.categoryId),
      brandId: data.brandId ? Number(data.brandId) : null,
      basePrice: Number(data.basePrice),
      salePrice: data.salePrice ? Number(data.salePrice) : null,
      variants: (data.variants || []).map((v) => ({
        ...v,
        price: Number(v.price) || Number(data.basePrice),
        salePrice: v.salePrice ? Number(v.salePrice) : null,
        stock: Number(v.stock) || 0,
        weightGram: Number(v.weightGram || v.weight || 100),
      })),
    };
    return axiosClient.put(`/products/${id}`, payload);
  },


  async updateProductStatus(id, status) {
    return axiosClient.patch(`/products/${id}/status`, null, {
      params: { status },
    });
  },

  async deleteProduct(id) {
    return axiosClient.delete(`/products/${id}`);
  },

  async uploadProductImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default productService;