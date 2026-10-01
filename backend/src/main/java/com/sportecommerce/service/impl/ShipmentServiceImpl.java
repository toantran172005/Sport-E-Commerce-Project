package com.sportecommerce.service.impl;

import com.sportecommerce.entity.Order;
import com.sportecommerce.entity.Shipment;
import com.sportecommerce.entity.ShippingProvider;
import com.sportecommerce.entity.UserAddress;
import com.sportecommerce.enums.PaymentStatus;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.ShippingProviderRepository;
import com.sportecommerce.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ShipmentServiceImpl implements ShipmentService {
    private final ShippingProviderRepository shippingProviderRepository;

    @Override
    public Shipment createShipmentForOrder(Order order, UserAddress address, double subTotal, String providerCode) {

        ShippingProvider provider;
        // Lấy đơn vị vận chuyển bằng mã code
        if (providerCode != null && !providerCode.isBlank()) {
            String code = providerCode.trim().toUpperCase();
            if (code.equals("VTP") || code.equals("VTPOST")) {
                throw new AppException("Tích hợp Viettel Post đang trong quá trình phát triển. Vui lòng chọn GHN hoặc GHTK!");
            }
            provider = shippingProviderRepository.findByCode(code)
                    .orElseThrow(()-> new ResourceNotFoundException("Đơn vị vận chuyển không hợp lệ: " + providerCode));
        } else {
            // Nếu không có mặc định chọn đơn vị vận chuyển đầu tiên
            provider = shippingProviderRepository.findAll().stream()
                    .filter(ShippingProvider::getIsActive)
                    .findFirst()
                    .orElseThrow(()-> new ResourceNotFoundException("Không tìm thấy đơn vị vận chuyển khả dụng!"));
        }

        if (!Boolean.TRUE.equals(provider.getIsActive())) {
            throw new AppException("Đơn vị vận chuyển hiện đang tạm ngừng hoạt động!");
        }

        double shippingFee = calculateShippingFee(provider.getCode(), address, subTotal);
        LocalDate estimateDate = calculateEstimatedDeliveryDate(provider.getCode(), address);

        return Shipment.builder()
                .order(order)
                .provider(provider)
                .shippingFee(shippingFee)
                .estimatedDeliveryDate(estimateDate)
                .build();
    }

    public double calculateShippingFee(String providerCode, UserAddress address, Double subTotal) {
        if (subTotal != null && subTotal >= 1_000_000.0) {
            return 0.0;
        }

        String city = address.getCity() != null ? address.getCity().toLowerCase().trim() : "";
        boolean isLocal = city.contains("hồ chí minh") || city.contains("hcm");

        return switch (providerCode.toUpperCase()) {
            case "GHN" -> isLocal ? 25_000.0 : 38_000.0;
            case "GHTK" -> isLocal ? 22_000.0 : 35_000.0;
            case "VTP" -> isLocal ? 20_000.0 : 32_000.0;
            default -> 30_000.0;
        };

    }

    public LocalDate calculateEstimatedDeliveryDate(String providerCode, UserAddress address) {
        String city = address.getCity() != null ? address.getCity().toLowerCase() : "";
        boolean isLocal = city.contains("hồ chí minh") || city.contains("hcm");

        int daysToAdd = switch (providerCode.toUpperCase()) {
            case "GHN" -> isLocal ? 1 : 3;
            case "GHTK" -> isLocal ? 2 : 3;
            case "VTP" -> isLocal ? 2 : 4;
            default -> 3;
        };
        return LocalDate.now().plusDays(daysToAdd);
    }
}
