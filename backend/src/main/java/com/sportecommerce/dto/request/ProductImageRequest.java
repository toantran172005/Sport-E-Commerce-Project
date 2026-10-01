package com.sportecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImageRequest {
    @NotBlank(message = "image_url không được để trống")
    private String imageUrl;

    private Boolean isPrimary;
    private Integer sortOrder;
}
