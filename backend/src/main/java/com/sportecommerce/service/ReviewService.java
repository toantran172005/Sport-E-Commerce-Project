package com.sportecommerce.service;

import com.sportecommerce.dto.request.ReviewRequest;
import com.sportecommerce.dto.response.PageResponse;
import com.sportecommerce.dto.response.ReviewResponse;
import com.sportecommerce.enums.ReviewStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReviewService {
    PageResponse<ReviewResponse> getProductReviews(Long productId, Pageable pageable);

    List<ReviewResponse> getProductReviewsList(Long productId, Integer rating, Boolean hasImages);

    PageResponse<ReviewResponse> getAllReviews(ReviewStatus status, Pageable pageable);

    List<ReviewResponse> getAllReviewsList(ReviewStatus status);

    ReviewResponse createReview(Long userId, ReviewRequest request);

    ReviewResponse updateReviewStatus(Long reviewId, ReviewStatus status);

    ReviewResponse replyToReview(Long adminId, Long reviewId, String replyText);

    void removeReviewReply(Long reviewId);

    void deleteReview(Long reviewId);
}
