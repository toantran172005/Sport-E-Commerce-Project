package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.response.ShippingCalculationResponse;
import com.sportecommerce.entity.ShippingProvider;
import com.sportecommerce.entity.UserAddress;
import com.sportecommerce.repository.ShippingProviderRepository;
import com.sportecommerce.repository.UserAddressRepository;
import com.sportecommerce.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/shipments")
public class ShipmentController {

    private final ShipmentService shipmentService;
    private final ShippingProviderRepository shippingProviderRepository;
    private final UserAddressRepository userAddressRepository;

    @GetMapping("/calculate")
    public ResponseEntity<ApiResponse<ShippingCalculationResponse>> calculateShipping(
            @RequestParam(defaultValue = "GHN") String providerCode,
            @RequestParam(required = false) Long addressId,
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "0.0") Double subTotal
    ) {
        UserAddress address = null;
        if (addressId != null) {
            address = userAddressRepository.findById(addressId).orElse(null);
        }
        if (address == null) {
            address = UserAddress.builder()
                    .city(city != null ? city : "")
                    .build();
        }

        double fee = shipmentService.calculateShippingFee(providerCode, address, subTotal);
        LocalDate estDate = shipmentService.calculateEstimatedDeliveryDate(providerCode, address);
        String formatted = estDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        ShippingCalculationResponse data = ShippingCalculationResponse.builder()
                .providerCode(providerCode.toUpperCase())
                .shippingFee(fee)
                .estimatedDeliveryDate(estDate)
                .formattedDeliveryDate(formatted)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Tính phí vận chuyển thành công", data));
    }

    @GetMapping("/shipping-providers")
    public ResponseEntity<ApiResponse<List<ShippingProvider>>> getProviders() {
        List<ShippingProvider> providers = shippingProviderRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn vị vận chuyển thành công", providers));
    }
}
