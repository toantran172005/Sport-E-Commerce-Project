package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.ReviewReplyRequest;
import com.sportecommerce.dto.request.ReviewRequest;
import com.sportecommerce.dto.response.PageResponse;
import com.sportecommerce.dto.response.ReviewResponse;
import com.sportecommerce.enums.ReviewStatus;
import com.sportecommerce.security.UserPrincipal;
import com.sportecommerce.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    private Long resolveUserId(UserPrincipal userPrincipal, Long fallbackUserId) {
        if (userPrincipal != null) {
            return userPrincipal.getId();
        }
        if (fallbackUserId != null) {
            return fallbackUserId;
        }
        return 4L;
    }

    private Long resolveAdminId(UserPrincipal userPrincipal) {
        if (userPrincipal != null) {
            return userPrincipal.getId();
        }
        return 1L; // Default admin user id fallback
    }

    @GetMapping({"/reviews/product/{productId}", "/products/{productId}/reviews"})
    public ResponseEntity<ApiResponse<Object>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) Boolean hasImages,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        if (page == null && size == null && (rating != null || hasImages != null)) {
            List<ReviewResponse> list = reviewService.getProductReviewsList(productId, rating, hasImages);
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đánh giá thành công", list));
        }

        PageResponse<ReviewResponse> response = reviewService.getProductReviews(productId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đánh giá thành công", response));
    }

    @GetMapping({"/reviews", "/admin/reviews"})
    public ResponseEntity<ApiResponse<Object>> getAllReviews(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        ReviewStatus reviewStatus = null;
        if (status != null && !status.equalsIgnoreCase("ALL") && !status.isBlank()) {
            try {
                reviewStatus = ReviewStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        if (page == null && size == null) {
            List<ReviewResponse> list = reviewService.getAllReviewsList(reviewStatus);
            return ResponseEntity.ok(ApiResponse.success("Lấy toàn bộ đánh giá thành công", list));
        }

        PageResponse<ReviewResponse> response = reviewService.getAllReviews(reviewStatus, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đánh giá thành công", response));
    }

    @PostMapping("/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) Long userId,
            @Valid @RequestBody ReviewRequest request) {
        Long resolvedId = resolveUserId(userPrincipal, userId);
        ReviewResponse response = reviewService.createReview(resolvedId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Gửi đánh giá thành công", response));
    }

    @PutMapping({"/reviews/{id}/status", "/admin/reviews/{id}/status"})
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReviewStatus(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestBody(required = false) java.util.Map<String, String> body) {

        String statusStr = status;
        if (statusStr == null && body != null && body.containsKey("status")) {
            statusStr = body.get("status");
        }
        if (statusStr == null) {
            statusStr = "APPROVED";
        }

        ReviewStatus reviewStatus = ReviewStatus.valueOf(statusStr.toUpperCase());
        ReviewResponse response = reviewService.updateReviewStatus(id, reviewStatus);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái đánh giá thành công", response));
    }

    @PostMapping({"/reviews/{id}/reply", "/admin/reviews/{id}/reply"})
    public ResponseEntity<ApiResponse<ReviewResponse>> replyToReview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody ReviewReplyRequest request) {
        Long adminId = resolveAdminId(userPrincipal);
        ReviewResponse response = reviewService.replyToReview(adminId, id, request.getReplyText());
        return ResponseEntity.ok(ApiResponse.success("Phản hồi đánh giá thành công", response));
    }

    @DeleteMapping("/reviews/{id}/reply")
    public ResponseEntity<ApiResponse<Void>> removeReviewReply(@PathVariable Long id) {
        reviewService.removeReviewReply(id);
        return ResponseEntity.ok(ApiResponse.success("Thu hồi phản hồi thành công", null));
    }

    @DeleteMapping({"/reviews/{id}", "/admin/reviews/{id}"})
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa đánh giá thành công", null));
    }
}
