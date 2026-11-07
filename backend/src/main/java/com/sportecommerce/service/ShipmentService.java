package com.sportecommerce.service;

import com.sportecommerce.entity.Order;
import com.sportecommerce.entity.Shipment;
import com.sportecommerce.entity.UserAddress;

import java.time.LocalDate;

public interface ShipmentService {
    Shipment createShipmentForOrder(Order order, UserAddress address, double subTotal, String providerCode);

    double calculateShippingFee(String providerCode, UserAddress address, Double subTotal);

    LocalDate calculateEstimatedDeliveryDate(String providerCode, UserAddress address);
}
