package com.sportecommerce.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {
    private Long id;
    private Long parentId;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private Boolean isActive;
    private Integer sortOrder;
}
