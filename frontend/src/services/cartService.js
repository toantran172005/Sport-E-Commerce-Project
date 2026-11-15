const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const fakeDelay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const STORAGE_KEY = 'sport_cart';
const loadLocalCart = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};
const saveLocalCart = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

export const cartService = {
  async getCart(userId) {
    if (USE_MOCK) {
      await fakeDelay();
      const items = loadLocalCart();
      const totalAmount = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
      return {
        items,
        totalAmount,
        totalItems: items.length,
        totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
      };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    const params = userId ? { userId } : {};
    const res = await axiosClient.get('/cart', { params });
    return res.data || res;
  },

  async addToCart(itemData, userId) {
    if (USE_MOCK) {
      await fakeDelay();
      const items = loadLocalCart();
      const variantId = itemData.variantId;
      const productId = itemData.productId;
      const idx = items.findIndex(
        (i) => i.productId === productId && (variantId ? i.variantId === variantId : true)
      );

      if (idx >= 0) {
        items[idx].quantity += itemData.quantity || 1;
      } else {
        items.push({
          id: Date.now(),
          ...itemData,
          quantity: itemData.quantity || 1,
        });
      }
      saveLocalCart(items);
      return this.getCart();
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
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
    if (USE_MOCK) {
      await fakeDelay(100);
      let items = loadLocalCart();
      if (quantity <= 0) {
        items = items.filter((i) => i.variantId !== variantId);
      } else {
        items = items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i));
      }
      saveLocalCart(items);
      return this.getCart();
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    const params = userId ? { userId } : {};
    const res = await axiosClient.put(
      `/cart/items/${variantId}`,
      { quantity },
      { params }
    );
    return res.data || res;
  },

  async removeItem(variantId, userId) {
    if (USE_MOCK) {
      await fakeDelay(100);
      const items = loadLocalCart().filter((i) => i.variantId !== variantId);
      saveLocalCart(items);
      return this.getCart();
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    const params = userId ? { userId } : {};
    const res = await axiosClient.delete(`/cart/items/${variantId}`, { params });
    return res.data || res;
  },

  async clearCart(userId) {
    if (USE_MOCK) {
      await fakeDelay(100);
      saveLocalCart([]);
      return { items: [], totalAmount: 0, totalItems: 0, totalQuantity: 0 };
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    const params = userId ? { userId } : {};
    const res = await axiosClient.delete('/cart/clear', { params });
    return res.data || res;
  },

  async syncCart(items, userId) {
    if (USE_MOCK) {
      return this.getCart();
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
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
