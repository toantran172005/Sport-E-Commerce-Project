import axiosClient from '../api/axiosClient.js';

export const categoryService = {
  async getCategories() {
    const flatList = await axiosClient.get('/categories');
    const safeList = Array.isArray(flatList) ? flatList : [];

    // Tìm các danh mục cấp cao nhất (không có parentId)
    const parents = safeList.filter((c) => !c.parentId);

    // Gắn danh mục con tương ứng vào từng cha
    return parents.map((parent) => ({
      ...parent,
      children: safeList.filter((c) => c.parentId === parent.id),
    }));
  },

  async getAllFlatCategories() {
    const data = await axiosClient.get('/categories');
    return Array.isArray(data) ? data : [];
  },

  async getCategoryById(id) {
    return axiosClient.get(`/categories/${id}`);
  },

  async createCategory(data) {
    const payload = {
      name: data.name,
      parentId: data.parentId ? Number(data.parentId) : null,
      description: data.description || '',
      imageUrl: data.imageUrl || '',
      sortOrder: Number(data.sortOrder) || 0,
    };
    return axiosClient.post('/categories', payload);
  },

  async updateCategory(id, data) {
    const payload = {
      name: data.name,
      parentId: data.parentId ? Number(data.parentId) : null,
      description: data.description || '',
      imageUrl: data.imageUrl || '',
      sortOrder: Number(data.sortOrder) || 0,
    };
    return axiosClient.put(`/categories/${id}`, payload);
  },

  async deleteCategory(id) {
    return axiosClient.delete(`/categories/${id}`);
  },
};

export default categoryService;