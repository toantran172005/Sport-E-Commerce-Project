package com.sportecommerce.dto.response;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewReplyResponse {
    private Long id;
    private String replyText;
    private String adminName;
    private Instant createdAt;
}
