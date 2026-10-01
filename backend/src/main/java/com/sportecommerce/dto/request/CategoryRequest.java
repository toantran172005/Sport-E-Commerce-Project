package com.sportecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryRequest {
    @NotBlank(message = "name không được để trống")
    private String name;

    private Long parentId;
    private String description;
    private String imageUrl;
    private Integer sortOrder;
}
