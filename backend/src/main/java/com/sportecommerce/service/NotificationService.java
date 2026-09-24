package com.sportecommerce.service;

import com.sportecommerce.entity.Order;

public interface NotificationService {

    void notifyPaymentSuccess(Order order);

    void notifyPaymentFailed(Order order);

    void notifyOrderPlaced(Order order);
}
