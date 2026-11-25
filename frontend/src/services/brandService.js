import axiosClient from '../api/axiosClient.js';

export const brandService = {
  async getBrands() {
    const data = await axiosClient.get('/brands');
    return Array.isArray(data) ? data : [];
  },

  async getBrandById(id) {
    return axiosClient.get(`/brands/${id}`);
  },

  async createBrand(data) {
    const payload = {
      name: data.name,
      description: data.description || '',
      logoUrl: data.logoUrl || data.logo || '',
    };
    return axiosClient.post('/brands', payload);
  },

  async updateBrand(id, data) {
    const payload = {
      name: data.name,
      description: data.description || '',
      logoUrl: data.logoUrl || data.logo || '',
    };
    return axiosClient.put(`/brands/${id}`, payload);
  },

  async deleteBrand(id) {
    return axiosClient.delete(`/brands/${id}`);
  },
};

export default brandService;