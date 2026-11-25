import axiosClient from '../api/axiosClient.js';

export const reviewService = {
  async getReviewsByProduct(productId, params = {}) {
    const res = await axiosClient.get(`/reviews/product/${productId}`, { params });
    return res.data || res;
  },

  async getAllReviews(params = {}) {
    const res = await axiosClient.get('/reviews', { params });
    return res.data || res;
  },

  async createReview(data) {
    const res = await axiosClient.post('/reviews', data);
    return res.data || res;
  },

  async updateReviewStatus(id, status) {
    const res = await axiosClient.put(`/reviews/${id}/status`, { status });
    return res.data || res;
  },

  async replyToReview(reviewId, replyText) {
    const res = await axiosClient.post(`/reviews/${reviewId}/reply`, { replyText });
    return res.data || res;
  },

  async removeReviewReply(reviewId) {
    const res = await axiosClient.delete(`/reviews/${reviewId}/reply`);
    return res.data || res;
  },

  async deleteReview(reviewId) {
    const res = await axiosClient.delete(`/reviews/${reviewId}`);
    return res.data || res;
  },
};

export default reviewService;
