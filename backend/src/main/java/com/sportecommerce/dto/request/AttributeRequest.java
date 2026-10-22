package com.sportecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeRequest {
    @NotBlank(message = "attribute_name không được để trống")
    @Size(max = 100, message = "attribute_name tối đa 100 ký tự")
    private String attributeName;

    @NotBlank(message = "attribute_value không được để trống")
    @Size(max = 255, message = "attribute_value tối đa 255 ký tự")
    private String attributeValue;
}
