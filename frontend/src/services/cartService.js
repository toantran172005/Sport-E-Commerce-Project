import axiosClient from '../api/axiosClient.js';

export const cartService = {
  async getCart(userId) {
    const params = userId ? { userId } : {};
    const res = await axiosClient.get('/cart', { params });
    return res.data || res;
  },

  async addToCart(itemData, userId) {
    const params = userId ? { userId } : {};
    const res = await axiosClient.post(
      '/cart/items',
      {
        variantId: itemData.variantId,
        quantity: itemData.quantity || 1,
        productId: itemData.productId,
      },
      { params }
    );
    return res.data || res;
  },

  async updateQuantity(variantId, quantity, userId) {
    const params = userId ? { userId } : {};
    const res = await axiosClient.put(
      `/cart/items/${variantId}`,
      { quantity },
      { params }
    );
    return res.data || res;
  },

  async removeItem(variantId, userId) {
    const params = userId ? { userId } : {};
    const res = await axiosClient.delete(`/cart/items/${variantId}`, { params });
    return res.data || res;
  },

  async clearCart(userId) {
    const params = userId ? { userId } : {};
    const res = await axiosClient.delete('/cart/clear', { params });
    return res.data || res;
  },

  async syncCart(items, userId) {
    const params = userId ? { userId } : {};
    const payload = {
      items: items.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
        productId: i.productId,
      })),
    };
    const res = await axiosClient.post('/cart/sync', payload, { params });
    return res.data || res;
  },
};

export default cartService;
