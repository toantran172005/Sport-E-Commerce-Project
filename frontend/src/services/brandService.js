import { brands as initialBrands } from '../mocks/brands.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const fakeDelay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const brandService = {
  async getBrands() {
    if (USE_MOCK) {
      await fakeDelay();
      return [...initialBrands];
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get('/brands');
  },

  async getBrandById(id) {
    if (USE_MOCK) {
      await fakeDelay(150);
      const brand = initialBrands.find((b) => String(b.id) === String(id) || b.slug === String(id));
      if (!brand) throw new Error('Không tìm thấy thương hiệu');
      return brand;
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get(`/brands/${id}`);
  },
};

export default brandService;
