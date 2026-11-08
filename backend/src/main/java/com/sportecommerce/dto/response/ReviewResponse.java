package com.sportecommerce.dto.response;

import lombok.*;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private Long userId;
    private String userName;
    private String customerName;
    private String userAvatar;
    private Integer rating;
    private String comment;
    private String status;
    private List<String> images;
    private String replyText;
    private ReviewReplyResponse reply;
    private Instant createdAt;
    private Instant updatedAt;
}
