import axiosClient from '../api/axiosClient.js';

const CACHE_TTL_MS = 10 * 60 * 1000;

let rawCategoriesCache = null;
let rawCategoriesTimestamp = 0;

const isCacheValid = () => rawCategoriesCache !== null && Date.now() - rawCategoriesTimestamp < CACHE_TTL_MS;

const fetchRawCategories = async (forceRefresh = false) => {
  if (!forceRefresh && isCacheValid()) {
    return rawCategoriesCache;
  }
  const data = await axiosClient.get('/categories');
  const safeList = Array.isArray(data) ? data : [];
  rawCategoriesCache = safeList;
  rawCategoriesTimestamp = Date.now();
  return safeList;
};

export const categoryService = {
  peekCategories: () => {
    if (isCacheValid()) return rawCategoriesCache;
    return null;
  },

  async getCategories(options = {}) {
    const { forceRefresh = false } = options;
    const safeList = await fetchRawCategories(forceRefresh);

    const parents = safeList.filter((c) => !c.parentId);

    return parents.map((parent) => ({
      ...parent,
      children: safeList.filter((c) => c.parentId === parent.id),
    }));
  },

  async getAllFlatCategories(options = {}) {
    const { forceRefresh = false } = options;
    return fetchRawCategories(forceRefresh);
  },

  async getCategoryById(id) {
    if (isCacheValid()) {
      const found = rawCategoriesCache.find((c) => String(c.id) === String(id));
      if (found) return found;
    }
    return axiosClient.get(`/categories/${id}`);
  },

  invalidateCache() {
    rawCategoriesCache = null;
    rawCategoriesTimestamp = 0;
  },

  async createCategory(data) {
    const payload = {
      name: data.name,
      parentId: data.parentId ? Number(data.parentId) : null,
      description: data.description || '',
      imageUrl: data.imageUrl || '',
      sortOrder: Number(data.sortOrder) || 0,
    };
    const res = await axiosClient.post('/categories', payload);
    categoryService.invalidateCache();
    return res;
  },

  async updateCategory(id, data) {
    const payload = {
      name: data.name,
      parentId: data.parentId ? Number(data.parentId) : null,
      description: data.description || '',
      imageUrl: data.imageUrl || '',
      sortOrder: Number(data.sortOrder) || 0,
    };
    const res = await axiosClient.put(`/categories/${id}`, payload);
    categoryService.invalidateCache();
    return res;
  },

  async deleteCategory(id) {
    const res = await axiosClient.delete(`/categories/${id}`);
    categoryService.invalidateCache();
    return res;
  },
};

export default categoryService;
