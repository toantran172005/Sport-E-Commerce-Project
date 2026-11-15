package com.sportecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewReplyRequest {
    @NotBlank(message = "Nội dung phản hồi không được để trống")
    private String replyText;
}
