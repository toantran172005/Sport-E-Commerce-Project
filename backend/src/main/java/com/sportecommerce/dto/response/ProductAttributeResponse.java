package com.sportecommerce.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductAttributeResponse {
    private Long id;
    private String attributeName;
    private String attributeValue;
}
