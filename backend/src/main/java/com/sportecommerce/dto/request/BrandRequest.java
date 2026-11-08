package com.sportecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandRequest {
    @NotBlank(message = "name không được để trống")
    private String name;
    private String logoUrl;
    private String description;
}
