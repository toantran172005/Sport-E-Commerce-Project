package com.sportecommerce.service;

import com.sportecommerce.dto.request.CreateReviewRequest;

public interface ReviewService {
    void createReview(Long userId, CreateReviewRequest request);
}