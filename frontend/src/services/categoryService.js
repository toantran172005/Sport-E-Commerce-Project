import { categories as initialCategories } from '../mocks/categories.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const fakeDelay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const categoryService = {
  async getCategories() {
    if (USE_MOCK) {
      await fakeDelay();
      // Xây dựng cây danh mục cha con
      const parentCategories = initialCategories.filter((c) => !c.parentId);
      return parentCategories.map((parent) => ({
        ...parent,
        children: initialCategories.filter((c) => c.parentId === parent.id),
      }));
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get('/categories');
  },

  async getAllFlatCategories() {
    if (USE_MOCK) {
      await fakeDelay(150);
      return [...initialCategories];
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get('/categories/flat');
  },

  async getCategoryById(id) {
    if (USE_MOCK) {
      await fakeDelay(150);
      const cat = initialCategories.find((c) => String(c.id) === String(id) || c.slug === String(id));
      if (!cat) throw new Error('Không tìm thấy danh mục');
      return cat;
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get(`/categories/${id}`);
  },
};

export default categoryService;
