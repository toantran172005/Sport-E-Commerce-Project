package com.sportecommerce.service;

import com.sportecommerce.entity.Order;
import com.sportecommerce.entity.Shipment;
import com.sportecommerce.entity.UserAddress;
import com.sportecommerce.repository.ShippingProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

public interface ShipmentService {
    Shipment createShipmentForOrder(Order order, UserAddress address, double subTotal, String providerCode);
}
