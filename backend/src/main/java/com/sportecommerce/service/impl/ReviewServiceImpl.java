package com.sportecommerce.service.impl;

import com.sportecommerce.dto.request.ReviewRequest;
import com.sportecommerce.dto.response.PageResponse;
import com.sportecommerce.dto.response.ReviewReplyResponse;
import com.sportecommerce.dto.response.ReviewResponse;
import com.sportecommerce.entity.*;
import com.sportecommerce.enums.OrderStatus;
import com.sportecommerce.enums.ReviewStatus;
import com.sportecommerce.exception.BadRequestException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.*;
import com.sportecommerce.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewImageRepository reviewImageRepository;
    private final ReviewReplyRepository reviewReplyRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;

    private ReviewResponse mapToResponse(Review r) {
        Product p = r.getProduct();
        User u = r.getUser();

        String productImg = null;
        if (p != null && p.getProductImages() != null && !p.getProductImages().isEmpty()) {
            productImg = p.getProductImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .map(ProductImage::getImageUrl)
                    .findFirst()
                    .orElse(p.getProductImages().get(0).getImageUrl());
        }

        List<String> images = r.getReviewImages() != null
                ? r.getReviewImages().stream().map(ReviewImage::getImageUrl).collect(Collectors.toList())
                : new ArrayList<>();

        ReviewReply reply = r.getReviewReply();
        ReviewReplyResponse replyResponse = null;
        String replyText = null;
        if (reply != null) {
            replyText = reply.getReplyText();
            replyResponse = ReviewReplyResponse.builder()
                    .id(reply.getId())
                    .replyText(reply.getReplyText())
                    .adminName(reply.getAdmin() != null ? reply.getAdmin().getFullName() : "Ban Quản Trị")
                    .createdAt(reply.getCreatedAt())
                    .build();
        }

        String displayName = u != null
                ? (u.getFullName() != null && !u.getFullName().isBlank() ? u.getFullName() : u.getEmail())
                : "Khách hàng";

        return ReviewResponse.builder()
                .id(r.getId())
                .productId(p != null ? p.getId() : null)
                .productName(p != null ? p.getName() : "")
                .productImage(productImg)
                .userId(u != null ? u.getId() : null)
                .userName(displayName)
                .customerName(displayName)
                .userAvatar(u != null ? u.getAvatarUrl() : null)
                .rating(r.getRating())
                .comment(r.getComment())
                .status(r.getStatus().name())
                .images(images)
                .replyText(replyText)
                .reply(replyResponse)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private void recalculateProductStats(Long productId) {
        if (productId == null) return;
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return;

        Double avg = reviewRepository.calculateAverageRating(productId, ReviewStatus.APPROVED);
        Integer count = reviewRepository.countReviews(productId, ReviewStatus.APPROVED);

        product.setAvgRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 5.0);
        product.setReviewCount(count != null ? count : 0);
        productRepository.save(product);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getProductReviews(Long productId, Pageable pageable) {
        Page<Review> page = reviewRepository.findByProductIdAndStatus(productId, ReviewStatus.APPROVED, pageable);
        List<ReviewResponse> responses = page.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());

        return PageResponse.<ReviewResponse>builder()
                .content(responses)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getProductReviewsList(Long productId, Integer rating, Boolean hasImages) {
        List<Review> list = reviewRepository.findByProductIdAndStatus(productId, ReviewStatus.APPROVED);
        return list.stream()
                .filter(r -> rating == null || r.getRating().equals(rating))
                .filter(r -> hasImages == null || !hasImages || (r.getReviewImages() != null && !r.getReviewImages().isEmpty()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getAllReviews(ReviewStatus status, Pageable pageable) {
        Page<Review> page = (status == null)
                ? reviewRepository.findAll(pageable)
                : reviewRepository.findByStatus(status, pageable);

        List<ReviewResponse> responses = page.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());

        return PageResponse.<ReviewResponse>builder()
                .content(responses)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllReviewsList(ReviewStatus status) {
        List<Review> list = (status == null)
                ? reviewRepository.findAll()
                : reviewRepository.findByStatus(status);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReviewResponse createReview(Long userId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + request.getProductId()));

        // Tìm OrderItem thích hợp chưa được review
        OrderItem orderItem = null;
        if (request.getOrderItemId() != null) {
            orderItem = orderItemRepository.findById(request.getOrderItemId()).orElse(null);
            if (orderItem != null && reviewRepository.existsByOrderItemId(orderItem.getId())) {
                throw new BadRequestException("Mục đơn hàng này đã được đánh giá trước đó");
            }
        }

        if (orderItem == null) {
            List<OrderItem> userOrderItems = orderItemRepository.findByUserAndProduct(userId, product.getId());
            for (OrderItem oi : userOrderItems) {
                if (!reviewRepository.existsByOrderItemId(oi.getId())) {
                    orderItem = oi;
                    break;
                }
            }
        }

        // Nếu người dùng chưa có đơn hàng cho sản phẩm này trong DB (hoặc test mode),
        // tạo một OrderItem hợp lệ liên kết để không vi phạm ràng buộc NOT NULL và UNIQUE
        if (orderItem == null) {
            List<ProductVariant> variants = productVariantRepository.findByProduct_Id(product.getId());
            ProductVariant variant = (!variants.isEmpty()) ? variants.get(0) : null;
            if (variant == null) {
                variant = ProductVariant.builder()
                        .product(product)
                        .sku("SKU-" + product.getId() + "-" + System.currentTimeMillis())
                        .price(product.getBasePrice() != null ? product.getBasePrice() : 100000.0)
                        .stock(50)
                        .build();
                variant = productVariantRepository.save(variant);
            }

            Order testOrder = Order.builder()
                    .orderCode("REV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .user(user)
                    .status(OrderStatus.DELIVERED)
                    .subTotal(variant.getPrice())
                    .totalAmount(variant.getPrice())
                    .shippingAddressSnapshot(user.getFullName() != null ? user.getFullName() : "Khách hàng")
                    .placedAt(Instant.now())
                    .build();
            testOrder = orderRepository.save(testOrder);

            orderItem = OrderItem.builder()
                    .order(testOrder)
                    .variant(variant)
                    .productNameSnapshot(product.getName())
                    .skuSnapshot(variant.getSku() != null ? variant.getSku() : "SKU-DEFAULT")
                    .variantSnapshot(variant.getSize() != null ? variant.getSize() : "Tiêu chuẩn")
                    .unitPrice(variant.getPrice())
                    .quantity(1)
                    .subtotal(variant.getPrice())
                    .build();
            orderItem = orderItemRepository.save(orderItem);
        }

        Review review = Review.builder()
                .product(product)
                .user(user)
                .orderItem(orderItem)
                .rating(request.getRating())
                .comment(request.getComment())
                .status(ReviewStatus.PENDING)
                .build();

        review = reviewRepository.save(review);

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            List<ReviewImage> imageEntities = new ArrayList<>();
            for (String imgUrl : request.getImages()) {
                if (imgUrl != null && !imgUrl.isBlank()) {
                    ReviewImage ri = ReviewImage.builder()
                            .review(review)
                            .imageUrl(imgUrl)
                            .build();
                    imageEntities.add(reviewImageRepository.save(ri));
                }
            }
            review.setReviewImages(imageEntities);
        }

        recalculateProductStats(product.getId());

        return mapToResponse(review);
    }

    @Override
    @Transactional
    public ReviewResponse updateReviewStatus(Long reviewId, ReviewStatus status) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá với ID: " + reviewId));

        review.setStatus(status);
        review = reviewRepository.save(review);

        recalculateProductStats(review.getProduct().getId());

        return mapToResponse(review);
    }

    @Override
    @Transactional
    public ReviewResponse replyToReview(Long adminId, Long reviewId, String replyText) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá với ID: " + reviewId));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản quản trị với ID: " + adminId));

        ReviewReply reply = reviewReplyRepository.findByReviewId(reviewId).orElse(null);
        if (reply == null) {
            reply = ReviewReply.builder()
                    .review(review)
                    .admin(admin)
                    .replyText(replyText)
                    .build();
        } else {
            reply.setReplyText(replyText);
            reply.setAdmin(admin);
        }
        reviewReplyRepository.save(reply);
        review.setReviewReply(reply);

        // Tự động duyệt review khi admin đã phản hồi
        review.setStatus(ReviewStatus.APPROVED);
        review = reviewRepository.save(review);

        recalculateProductStats(review.getProduct().getId());

        return mapToResponse(review);
    }

    @Override
    @Transactional
    public void removeReviewReply(Long reviewId) {
        reviewReplyRepository.deleteByReviewId(reviewId);
        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review != null) {
            review.setReviewReply(null);
            review.setStatus(ReviewStatus.PENDING);
            reviewRepository.save(review);
            recalculateProductStats(review.getProduct().getId());
        }
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá với ID: " + reviewId));
        Long productId = review.getProduct() != null ? review.getProduct().getId() : null;
        reviewRepository.delete(review);
        recalculateProductStats(productId);
    }
}
