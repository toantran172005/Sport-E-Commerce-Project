package com.sportecommerce.service.impl;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.OrderItemRequest;
import com.sportecommerce.dto.request.PlaceOrderRequest;
import com.sportecommerce.dto.request.UpdateOrderStatusRequest;
import com.sportecommerce.dto.response.PlaceOrderResponse;
import com.sportecommerce.entity.*;
import com.sportecommerce.enums.*;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.exception.BadRequestException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.*;
import com.sportecommerce.service.CouponService;
import com.sportecommerce.service.OrderService;
import com.sportecommerce.service.ShipmentService;
import com.sportecommerce.util.MapperUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final UserAddressRepository userAddressRepository;
    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final MapperUtil mapperUtil;
    private final ShipmentService shipmentService;
    private final ShippingIntegrationService shippingIntegrationService;
    private final CouponService couponService;

    @Override
    @Transactional
    public ApiResponse<PlaceOrderResponse> placeOrder(Long userId, PlaceOrderRequest request) {
        User user = userRepository.findUserById(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy user trong request đặt hàng!"));

        UserAddress address = userAddressRepository.findById(request.getShippingAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ giao hàng!"));

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Địa chỉ giao hàng không hợp lệ!");
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderCode("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setNote(request.getNote());

        order.setShippingAddress(address);
        String snapshot = address
                .getRecipientName() + " - "
                + address.getPhoneNumber() + " - "
                + address.getAddressLine() + ", "
                + address.getWard() + ", "
                + address.getDistrict() + ", "
                + address.getCity();
        order.setShippingAddressSnapshot(snapshot);

        List<OrderItem> orderItems = new ArrayList<>();
        double subTotal = 0.0;

        // Đặt hàng thông qua giỏ hàng
        if (request.getCartItemIds() != null && !request.getCartItemIds().isEmpty()) {
            List<CartItem> cartItems = cartItemRepository
                    .findAllById(request.getCartItemIds());

            for (CartItem cartItem : cartItems) {

                if (!cartItem.getCart().getUser().getId().equals(userId)) {
                    throw new BadRequestException("Sản phẩm trong giỏ không hợp lệ!");
                }

                ProductVariant variant = cartItem.getVariant();

                if (variant.getStock() < cartItem.getQuantity()) {
                    throw new BadRequestException("Sản phẩm " + variant.getSku() + " không đủ số lượng trong kho!");
                }

                if (!Boolean.TRUE.equals(variant.getIsActive())) {
                    throw new BadRequestException("Sản phẩm " + variant.getSku() + " đã ngưng hoạt động!");
                }

                double actualPrice = variant.getPrice();
                if (variant.getSalePrice() != null && variant.getSalePrice() > 0) {
                    actualPrice = variant.getSalePrice();
                }

                variant.setStock(variant.getStock() - cartItem.getQuantity());
                variantRepository.save(variant);

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setVariant(variant);
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setUnitPrice(actualPrice);
                orderItem.setProductNameSnapshot(variant.getProduct().getName());
                orderItem.setSkuSnapshot(variant.getSku());
                orderItem.setVariantSnapshot(variant.getColor() + " - " + variant.getSize());
                orderItem.setSubtotal(orderItem.getUnitPrice() * orderItem.getQuantity());

                orderItems.add(orderItem);
                subTotal += actualPrice * cartItem.getQuantity();
            }

            cartItemRepository.deleteAll(cartItems);
            // Đặt hàng bằng nút "Mua ngay"
        } else if (request.getItems() != null) {
            OrderItemRequest itemRequest = request.getItems();

            ProductVariant variant = variantRepository
                    .findById(itemRequest.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Variant không tồn tại!"));

            if (variant.getStock() < itemRequest.getQuantity()) {
                throw new BadRequestException("Sản phẩm " + variant.getSku() + " không đủ số lượng!");
            }

            if (!Boolean.TRUE.equals(variant.getIsActive())) {
                throw new BadRequestException("Sản phẩm " + variant.getSku() + " đã ngưng hoạt động!");
            }

            double actualPrice = variant.getPrice();
            if (variant.getSalePrice() != null && variant.getSalePrice() > 0) {
                actualPrice = variant.getSalePrice();
            }

            variant.setStock(variant.getStock() - itemRequest.getQuantity());
            variantRepository.save(variant);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setVariant(variant);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(actualPrice);
            orderItem.setProductNameSnapshot(variant.getProduct().getName());
            orderItem.setSkuSnapshot(variant.getSku());
            orderItem.setVariantSnapshot(variant.getColor() + " - " + variant.getSize());
            orderItem.setSubtotal(orderItem.getUnitPrice() * orderItem.getQuantity());

            orderItems.add(orderItem);
            subTotal += actualPrice * itemRequest.getQuantity();
        } else {
            throw new BadRequestException("Đơn hàng không có sản phẩm nào để thanh toán!");
        }

        // PAYMENT
        Payment payment = new Payment();
        payment.setMethod(request.getPaymentMethod());
        payment.setOrder(order);

        order.setPayment(payment);

        // ORDER STATUS HISTORY
        OrderStatusHistory orderStatusHistory = new OrderStatusHistory();
        orderStatusHistory.setNote(request.getNote());
        orderStatusHistory.setStatus(OrderStatus.PENDING);
        orderStatusHistory.setOrder(order);
        orderStatusHistory.setChangedBy(user);

        order.getOrderStatusHistories().add(orderStatusHistory);

        // SHIPMENT
        Shipment shipment = shipmentService
                .createShipmentForOrder(order, address, subTotal, request.getShippingProviderCode());

        order.setShipment(shipment);

        // COUPON
        double discountAmount = 0.0;
        Coupon coupon = null;

        if (request.getCouponId() != null) {
            Coupon foundCoupon = couponRepository.findById(request.getCouponId())
                    .orElseThrow(() -> new BadRequestException("Mã giảm giá không tồn tại!"));

            coupon = couponService.getValidCoupon(foundCoupon.getCode(), subTotal, userId);

            if (coupon.getDiscountType() == DiscountType.FREE_SHIPPING) {
                discountAmount = shipment.getShippingFee();
            } else {
                discountAmount = couponService.calculateDiscount(coupon, subTotal);
            }

            order.setCoupon(coupon);
        }

        Double total = Math.max(0.0, subTotal - discountAmount + shipment.getShippingFee());

        order.setOrderItems(orderItems);
        order.setShippingFee(shipment.getShippingFee());
        order.setSubTotal(subTotal);
        order.setDiscountAmount(discountAmount);
        order.setTotalAmount(total);

        payment.setAmount(total);

        Order completedOrder = orderRepository.save(order);

        if (coupon != null) {
            couponService.recordUsage(coupon.getCode(), userId, completedOrder.getId(), discountAmount);
        }

        return ApiResponse.success("Đặt hàng thành công", mapperUtil.mapOrderToPlaceOrderResponse(completedOrder));
    }

    @Override
    @Transactional
    public void confirmOrder(Long orderId) {
        Order order = getOrderById(orderId);
        order.setStatus(OrderStatus.CONFIRMED);
        order.setConfirmedAt(Instant.now());

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .status(OrderStatus.CONFIRMED)
                .note("Xác nhận đơn hàng qua hệ thống thanh toán")
                .changedBy(order.getUser())
                .build();

        order.getOrderStatusHistories().add(history);
        orderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));
    }
    public ApiResponse<?> updateOrderStatus(Long userId, UpdateOrderStatusRequest request) {

        Long orderId = request.getOrderId();
        OrderStatus newStatus = request.getNewStatus();
        String note = request.getNote();
        String cancelledReason = request.getCancelledReason();

        User user = userRepository.findUserById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã nhân viên: " + userId));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng mã: " + orderId));

        if (user.getRole().equals(UserRole.CUSTOMER)) {
            throw new BadRequestException("Khách hàng không được phép chỉnh sửa đơn hàng!");
        }

        OrderStatus currentStatus = order.getStatus();

        if (currentStatus.equals(OrderStatus.PENDING) && newStatus.equals(OrderStatus.CONFIRMED)) {
            Payment payment = order.getPayment();
            if (!payment.getMethod().equals(PaymentMethod.COD) && !payment.getStatus().equals(PaymentStatus.PAID)) {
                throw new BadRequestException("Vui lòng thanh toán đơn hàng trước khi cập nhật!");
            }

            order.setStatus(OrderStatus.CONFIRMED);
            order.setConfirmedAt(Instant.now());

            OrderStatusHistory orderStatusHistory = OrderStatusHistory.builder()
                    .status(OrderStatus.CONFIRMED)
                    .changedBy(user)
                    .order(order)
                    .note(note)
                    .build();

            order.getOrderStatusHistories().add(orderStatusHistory);
            orderRepository.save(order);

        } else if (currentStatus.equals(OrderStatus.CONFIRMED) && newStatus.equals(OrderStatus.PROCESSING)) {
            String trackingNumber = shippingIntegrationService.createShippingOrder(order);

            Shipment shipment = order.getShipment();
            shipment.setTrackingNumber(trackingNumber);

            order.setStatus(OrderStatus.PROCESSING);

            OrderStatusHistory orderStatusHistory = OrderStatusHistory.builder()
                    .status(OrderStatus.PROCESSING)
                    .changedBy(user)
                    .order(order)
                    .note(note)
                    .build();

            order.getOrderStatusHistories().add(orderStatusHistory);
            orderRepository.save(order);

        } else if (currentStatus.equals(OrderStatus.PROCESSING) && newStatus.equals(OrderStatus.SHIPPED)) {
            Shipment shipment = order.getShipment();

            shipment.setStatus(ShipmentStatus.IN_TRANSIT);
            shipment.setShippedAt(Instant.now());
            order.setStatus(OrderStatus.SHIPPED);

            OrderStatusHistory orderStatusHistory = OrderStatusHistory.builder()
                    .status(OrderStatus.SHIPPED)
                    .changedBy(user)
                    .order(order)
                    .note(note)
                    .build();

            order.getOrderStatusHistories().add(orderStatusHistory);
            orderRepository.save(order);

        } else if (currentStatus.equals(OrderStatus.SHIPPED) && newStatus.equals(OrderStatus.DELIVERED)) {
            Shipment shipment = order.getShipment();

            shipment.setStatus(ShipmentStatus.DELIVERED);
            shipment.setDeliveredAt(Instant.now());

            Payment payment = order.getPayment();

            if (payment.getMethod().equals(PaymentMethod.COD)) {
                payment.setStatus(PaymentStatus.PAID);
                payment.setPaidAt(Instant.now());
            }

            order.setStatus(OrderStatus.DELIVERED);

            OrderStatusHistory orderStatusHistory = OrderStatusHistory.builder()
                    .status(OrderStatus.DELIVERED)
                    .changedBy(user)
                    .order(order)
                    .note(note)
                    .build();

            order.getOrderStatusHistories().add(orderStatusHistory);
            orderRepository.save(order);

        } else if ((currentStatus.equals(OrderStatus.PENDING) ||
                currentStatus.equals(OrderStatus.CONFIRMED) ||
                currentStatus.equals(OrderStatus.PROCESSING)) &&
                newStatus.equals(OrderStatus.CANCELED)) {
            List<OrderItem> orderItems = order.getOrderItems();

            for (OrderItem orderItem : orderItems) {
                ProductVariant variant = orderItem.getVariant();
                variant.setStock(variant.getStock() + orderItem.getQuantity());
            }

            Coupon coupon = order.getCoupon();
            if (coupon != null) {
                coupon.setUsedCount(coupon.getUsedCount() - 1);
                couponUsageRepository.deleteByOrder_Id(order.getId());
            }

            Payment payment = order.getPayment();
            if (payment.getStatus().equals(PaymentStatus.PAID)) {
                payment.setStatus(PaymentStatus.REFUND);
            } else {
                payment.setStatus(PaymentStatus.CANCELLED);
            }

            order.setStatus(OrderStatus.CANCELED);
            order.setCanceledAt(Instant.now());
            order.setCancelReason(cancelledReason);

            OrderStatusHistory orderStatusHistory = OrderStatusHistory.builder()
                    .status(OrderStatus.CANCELED)
                    .changedBy(user)
                    .order(order)
                    .note(cancelledReason)
                    .build();

            order.getOrderStatusHistories().add(orderStatusHistory);
            orderRepository.save(order);

        } else if (currentStatus.equals(OrderStatus.DELIVERED)
                && newStatus.equals(OrderStatus.RETURNED)) {
            Shipment shipment = order.getShipment();
            Instant deliveredAt = shipment.getDeliveredAt();

            if (deliveredAt != null &&
                    Instant.now()
                            .isAfter(order.getShipment().getDeliveredAt()
                                    .plus(7, ChronoUnit.DAYS))) {
                throw new BadRequestException("Đơn hàng đã quá hạn 7 ngày để hoàn trả!");
            }

            List<OrderItem> orderItems = order.getOrderItems();

            for (OrderItem orderItem : orderItems) {
                ProductVariant variant = orderItem.getVariant();
                variant.setStock(variant.getStock() + orderItem.getQuantity());
            }

            Payment payment = order.getPayment();
            if (payment.getStatus().equals(PaymentStatus.PAID)) {
                payment.setStatus(PaymentStatus.REFUND);
            }

            OrderStatusHistory orderStatusHistory = OrderStatusHistory.builder()
                    .status(OrderStatus.RETURNED)
                    .changedBy(user)
                    .order(order)
                    .note(note)
                    .build();

            order.setStatus(OrderStatus.RETURNED);
            order.getOrderStatusHistories().add(orderStatusHistory);

            orderRepository.save(order);

        } else {
            throw new BadRequestException("Không thể chuyển trạng thái đơn hàng từ " + currentStatus + " sang " + newStatus);
        }

        return ApiResponse.success("Cập nhật trạng thái thành công!",
                mapperUtil.mapOrderToPlaceOrderResponse(order));
    }

}
