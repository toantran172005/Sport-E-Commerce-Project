import axiosClient from '../api/axiosClient.js';

export const wishlistService = {
  async getWishlist(userId) {
    const params = userId ? { userId } : {};
    const res = await axiosClient.get('/wishlist', { params });
    return res.data || res;
  },

  async getWishlistIds(userId) {
    const params = userId ? { userId } : {};
    const res = await axiosClient.get('/wishlist/ids', { params });
    return res.data || res;
  },

  async toggleWishlist(productId, userId) {
    const params = userId ? { userId } : {};
    const res = await axiosClient.post(`/wishlist/${productId}`, null, { params });
    const data = res.data || res;
    return { added: data.added !== undefined ? data.added : true };
  },

  async removeFromWishlist(productId, userId) {
    const params = userId ? { userId } : {};
    const res = await axiosClient.delete(`/wishlist/${productId}`, { params });
    return res.data || res;
  },

  async checkWishlist(productId, userId) {
    const params = userId ? { userId } : {};
    const res = await axiosClient.get(`/wishlist/check/${productId}`, { params });
    const data = res.data || res;
    return data.inWishlist ?? false;
  },
};

export default wishlistService;
