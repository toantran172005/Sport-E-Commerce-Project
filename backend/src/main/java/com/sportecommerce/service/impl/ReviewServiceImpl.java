package com.sportecommerce.service.impl;

import com.sportecommerce.dto.request.CreateReviewRequest;
import com.sportecommerce.entity.*;
import com.sportecommerce.enums.ReviewStatus;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.*;
import com.sportecommerce.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void createReview(Long userId, CreateReviewRequest request) {
        if (reviewRepository.existsByOrderItemId(request.getOrderItemId())) {
            throw new AppException("Sản phẩm này trong đơn hàng đã được đánh giá", HttpStatus.BAD_REQUEST);
        }

        OrderItem orderItem = orderItemRepository.findById(request.getOrderItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy OrderItem"));

        if (!orderItem.getOrder().getUser().getId().equals(userId)) {
            throw new AppException("Không có quyền đánh giá sản phẩm này", HttpStatus.FORBIDDEN);
        }

        User user = userRepository.getReferenceById(userId);

        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .status(ReviewStatus.PENDING)
                .product(orderItem.getVariant().getProduct())
                .user(user)
                .orderItem(orderItem)
                .build();

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            List<ReviewImage> images = request.getImageUrls().stream()
                    .map(url -> ReviewImage.builder().imageUrl(url).review(review).build())
                    .collect(Collectors.toList());
            review.setReviewImages(images);
        }

        reviewRepository.save(review);
    }
}