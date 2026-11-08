package com.sportecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagRequest {
    @NotBlank(message = "name không được để trống")
    @Size(max = 100, message = "name tối đa 100 ký tự")
    private String name;
}
