import { shippingProviders as initialProviders } from '../mocks/shippingProviders.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const fakeDelay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const shippingService = {
  async getShippingProviders() {
    if (USE_MOCK) {
      await fakeDelay();
      return [...initialProviders];
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get('/shipping-providers');
  },
};

export default shippingService;
