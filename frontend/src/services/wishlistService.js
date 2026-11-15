const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const fakeDelay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const STORAGE_KEY = 'sport_wishlist';
const loadLocalWishlist = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[1, 3]');
  } catch {
    return [1, 3];
  }
};
const saveLocalWishlist = (ids) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
};

export const wishlistService = {
  async getWishlist(userId) {
    if (USE_MOCK) {
      await fakeDelay();
      return loadLocalWishlist();
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    const params = userId ? { userId } : {};
    const res = await axiosClient.get('/wishlist', { params });
    return res.data || res;
  },

  async getWishlistIds(userId) {
    if (USE_MOCK) {
      await fakeDelay();
      return loadLocalWishlist();
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    const params = userId ? { userId } : {};
    const res = await axiosClient.get('/wishlist/ids', { params });
    return res.data || res;
  },

  async toggleWishlist(productId, userId) {
    if (USE_MOCK) {
      await fakeDelay(100);
      const ids = loadLocalWishlist();
      const numId = Number(productId);
      const exists = ids.includes(numId);
      const newIds = exists ? ids.filter((id) => id !== numId) : [...ids, numId];
      saveLocalWishlist(newIds);
      return { added: !exists, ids: newIds };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    const params = userId ? { userId } : {};
    const res = await axiosClient.post(`/wishlist/${productId}`, null, { params });
    const data = res.data || res;
    return { added: data.added !== undefined ? data.added : true };
  },

  async removeFromWishlist(productId, userId) {
    if (USE_MOCK) {
      await fakeDelay(100);
      const ids = loadLocalWishlist().filter((id) => id !== Number(productId));
      saveLocalWishlist(ids);
      return ids;
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    const params = userId ? { userId } : {};
    const res = await axiosClient.delete(`/wishlist/${productId}`, { params });
    return res.data || res;
  },

  async checkWishlist(productId, userId) {
    if (USE_MOCK) {
      return loadLocalWishlist().includes(Number(productId));
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    const params = userId ? { userId } : {};
    const res = await axiosClient.get(`/wishlist/check/${productId}`, { params });
    const data = res.data || res;
    return data.inWishlist ?? false;
  },
};

export default wishlistService;
