package com.sportecommerce.dto.response;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingCalculationResponse {
    private String providerCode;
    private Double shippingFee;
    private LocalDate estimatedDeliveryDate;
    private String formattedDeliveryDate;
}
