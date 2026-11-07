import { reviews as initialReviews } from '../mocks/reviews.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const fakeDelay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

let mockReviews = [...initialReviews];

export const reviewService = {
  async getReviewsByProduct(productId, params = {}) {
    if (USE_MOCK) {
      await fakeDelay();
      const { rating, hasImages, page, size, limit } = params;
      let list = mockReviews.filter(
        (r) => (r.productId === Number(productId) || !r.productId) && r.status === 'APPROVED'
      );

      if (rating) {
        list = list.filter((r) => r.rating === Number(rating));
      }
      if (hasImages) {
        list = list.filter((r) => r.images && r.images.length > 0);
      }

      if (page !== undefined || size !== undefined || limit !== undefined) {
        const totalElements = list.length;
        const pageSize = Number(size || limit || 10);
        const totalPages = Math.ceil(totalElements / pageSize) || 1;
        const pageNumber = Math.max(0, Math.min(Number(page ?? 0), Math.max(0, totalPages - 1)));
        const start = pageNumber * pageSize;
        const items = list.slice(start, start + pageSize);

        return {
          content: items,
          items,
          number: pageNumber,
          page: pageNumber,
          size: pageSize,
          limit: pageSize,
          totalElements,
          total: totalElements,
          totalPages,
          numberOfElements: items.length,
          first: pageNumber === 0,
          last: pageNumber >= totalPages - 1,
          empty: items.length === 0,
        };
      }

      return list;
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get(`/products/${productId}/reviews`, { params });
  },

  async getAllReviews(params = {}) {
    if (USE_MOCK) {
      await fakeDelay();
      const { status, page, size, limit } = params;
      let list = [...mockReviews];
      if (status && status !== 'ALL') {
        list = list.filter((r) => r.status === status);
      }

      if (page !== undefined || size !== undefined || limit !== undefined) {
        const totalElements = list.length;
        const pageSize = Number(size || limit || 10);
        const totalPages = Math.ceil(totalElements / pageSize) || 1;
        const pageNumber = Math.max(0, Math.min(Number(page ?? 0), Math.max(0, totalPages - 1)));
        const start = pageNumber * pageSize;
        const items = list.slice(start, start + pageSize);

        return {
          content: items,
          items,
          number: pageNumber,
          page: pageNumber,
          size: pageSize,
          limit: pageSize,
          totalElements,
          total: totalElements,
          totalPages,
          numberOfElements: items.length,
          first: pageNumber === 0,
          last: pageNumber >= totalPages - 1,
          empty: items.length === 0,
        };
      }

      return list;
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.get('/reviews', { params });
  },

  async createReview(data) {
    if (USE_MOCK) {
      await fakeDelay();
      const newReview = {
        id: Date.now(),
        productId: Number(data.productId),
        userId: data.userId || 1,
        rating: Number(data.rating),
        comment: data.comment,
        status: 'PENDING', // Cần duyệt
        images: data.images || [],
        createdAt: new Date().toISOString(),
        reply: null,
      };
      mockReviews.unshift(newReview);
      return newReview;
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.post('/reviews', data);
  },

  async updateReviewStatus(id, status) {
    if (USE_MOCK) {
      await fakeDelay(150);
      const index = mockReviews.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Không tìm thấy đánh giá');
      mockReviews[index].status = status;
      return mockReviews[index];
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.put(`/reviews/${id}/status`, { status });
  },

  async replyToReview(reviewId, replyText) {
    if (USE_MOCK) {
      await fakeDelay();
      const index = mockReviews.findIndex((r) => r.id === reviewId);
      if (index === -1) throw new Error('Không tìm thấy đánh giá');
      mockReviews[index].reply = {
        id: Date.now(),
        replyText,
        createdAt: new Date().toISOString(),
      };
      mockReviews[index].status = 'APPROVED';
      return mockReviews[index];
    }
    const { default: axiosClient } = await import('../api/axiosClient.js');
    return axiosClient.post(`/reviews/${reviewId}/reply`, { replyText });
  },
};

export default reviewService;
