package com.sportecommerce.service.impl;

import com.sportecommerce.cache.ProductCacheEvictor;
import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.OrderItemRequest;
import com.sportecommerce.dto.request.PlaceOrderRequest;
import com.sportecommerce.dto.request.UpdateOrderStatusRequest;
import com.sportecommerce.dto.response.PlaceOrderResponse;
import com.sportecommerce.entity.*;
import com.sportecommerce.enums.*;
import com.sportecommerce.event.OrderPlacedEvent;
import com.sportecommerce.event.OrderStatusChangedEvent;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.exception.BadRequestException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.*;
import com.sportecommerce.service.CouponService;
import com.sportecommerce.service.OrderService;
import com.sportecommerce.service.ShipmentService;
import com.sportecommerce.util.MapperUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
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
    private final ApplicationEventPublisher eventPublisher;
    private final ShippingIntegrationService shippingIntegrationService;
    private final CouponService couponService;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductCacheEvictor productCacheEvictor;

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
                + address.fullAddress();
        order.setShippingAddressSnapshot(snapshot);

        List<OrderItem> orderItems = new ArrayList<>();
        double subTotal = 0.0;

        if (request.getCartItemIds() != null && !request.getCartItemIds().isEmpty()) {
            List<CartItem> cartItems = cartItemRepository
                    .findAllById(request.getCartItemIds());

            if (cartItems.isEmpty()) {
                throw new BadRequestException("Không tìm thấy sản phẩm hợp lệ trong giỏ hàng!");
            }
            if (cartItems.size() != request.getCartItemIds().size()) {
                throw new BadRequestException("Một số sản phẩm trong giỏ hàng không còn tồn tại!");
            }

            for (CartItem cartItem : cartItems) {

                if (!cartItem.getCart().getUser().getId().equals(userId)) {
                    throw new BadRequestException("Sản phẩm trong giỏ không hợp lệ!");
                }

                ProductVariant variant = variantRepository
                        .findByIdWithLock(cartItem.getVariant().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Variant không tồn tại!"));

                String prodName = variant.getProduct() != null ? variant.getProduct().getName() : variant.getSku();
                if (variant.getStock() < cartItem.getQuantity()) {
                    throw new BadRequestException("Sản phẩm '" + prodName + "' không đủ số lượng trong kho (chỉ còn " + variant.getStock() + " sản phẩm)!");
                }

                if (!Boolean.TRUE.equals(variant.getIsActive())) {
                    throw new BadRequestException("Sản phẩm '" + prodName + "' đã ngưng hoạt động!");
                }

                Product product = variant.getProduct();
                if (product == null || product.getDeletedAt() != null || product.getStatus() != ProductStatus.ACTIVE) {
                    throw new BadRequestException("Sản phẩm " + (product != null ? product.getName() : variant.getSku()) + " hiện không mở bán!");
                }

                double actualPrice = variant.getPrice();
                if (variant.getSalePrice() != null && variant.getSalePrice() > 0) {
                    actualPrice = variant.getSalePrice();
                }

                // Trừ kho nguyên tử (UPDATE ... WHERE stock >= qty): tránh bán lố khi nhiều người mua cùng lúc
                if (variantRepository.decreaseStockIfEnough(variant.getId(), cartItem.getQuantity()) == 0) {
                    throw new BadRequestException("Sản phẩm '" + prodName + "' vừa hết hàng hoặc không đủ số lượng, vui lòng thử lại!");
                }

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
        } else if (request.getItems() != null) {
            OrderItemRequest itemRequest = request.getItems();

            ProductVariant variant = variantRepository
                    .findByIdWithLock(itemRequest.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Variant không tồn tại!"));

            String prodName = variant.getProduct() != null ? variant.getProduct().getName() : variant.getSku();
            if (variant.getStock() < itemRequest.getQuantity()) {
                throw new BadRequestException("Sản phẩm '" + prodName + "' không đủ số lượng trong kho (chỉ còn " + variant.getStock() + " sản phẩm)!");
            }

            if (!Boolean.TRUE.equals(variant.getIsActive())) {
                throw new BadRequestException("Sản phẩm '" + prodName + "' đã ngưng hoạt động!");
            }

            Product product = variant.getProduct();
            if (product == null || product.getDeletedAt() != null || product.getStatus() != ProductStatus.ACTIVE) {
                throw new BadRequestException("Sản phẩm " + (product != null ? product.getName() : variant.getSku()) + " hiện không mở bán!");
            }

            double actualPrice = variant.getPrice();
            if (variant.getSalePrice() != null && variant.getSalePrice() > 0) {
                actualPrice = variant.getSalePrice();
            }

            // Trừ kho nguyên tử (UPDATE ... WHERE stock >= qty): tránh bán lố khi nhiều người mua cùng lúc
            if (variantRepository.decreaseStockIfEnough(variant.getId(), itemRequest.getQuantity()) == 0) {
                throw new BadRequestException("Sản phẩm '" + prodName + "' vừa hết hàng hoặc không đủ số lượng, vui lòng thử lại!");
            }

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

        Payment payment = new Payment();
        payment.setMethod(request.getPaymentMethod());
        payment.setOrder(order);

        order.setPayment(payment);

        OrderStatusHistory orderStatusHistory = new OrderStatusHistory();
        orderStatusHistory.setNote(request.getNote());
        orderStatusHistory.setStatus(OrderStatus.PENDING);
        orderStatusHistory.setOrder(order);
        orderStatusHistory.setChangedBy(user);

        order.getOrderStatusHistories().add(orderStatusHistory);

        Shipment shipment = shipmentService
                .createShipmentForOrder(order, address, subTotal, request.getShippingProviderCode());

        order.setShipment(shipment);

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

        eventPublisher.publishEvent(new OrderPlacedEvent(completedOrder.getId(), completedOrder.getOrderCode(), userId));

        // Tồn kho vừa đổi: xóa cache sản phẩm để trang sản phẩm/admin thấy số mới ngay
        productCacheEvictor.evictAfterCommit();

        return ApiResponse.success("Đặt hàng thành công", mapperUtil.mapOrderToPlaceOrderResponse(completedOrder));
    }

    @Override
    @Transactional
    public void confirmOrder(Long orderId) {
        Order order = getOrderById(orderId);
        // Chỉ xác nhận đơn đang chờ. Tránh "hồi sinh" đơn đã hủy khi webhook thanh toán về muộn.
        if (order.getStatus() != OrderStatus.PENDING) {
            return;
        }
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
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            orderItemRepository.findByOrderInWithVariant(java.util.Collections.singletonList(order));
        }
        return order;
    }
    @Transactional
    public ApiResponse<?> updateOrderStatus(Long userId, UpdateOrderStatusRequest request) {

        Long orderId = request.getOrderId();
        OrderStatus newStatus = request.getNewStatus();
        String note = request.getNote();
        String cancelledReason = request.getCancelledReason();

        User user = userRepository.findUserById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã nhân viên: " + userId));

        // Khóa ghi dòng đơn hàng: hai thao tác đồng thời (khách hủy + nhân viên xử lý) phải xếp hàng,
        // thao tác sau sẽ thấy trạng thái mới nên không hoàn kho / hoàn mã 2 lần.
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng mã: " + orderId));

        OrderStatus currentStatus = order.getStatus();

        if (currentStatus.equals(newStatus)) {
            return ApiResponse.success("Đơn hàng hiện đã ở trạng thái " + newStatus,
                    mapperUtil.mapOrderToOrderDetailResponse(order));
        }

        if (user.getRole().equals(UserRole.CUSTOMER)) {
            if (!(newStatus.equals(OrderStatus.CANCELED)
                    && order.getUser().getId().equals(userId)
                    && (currentStatus.equals(OrderStatus.PENDING) || currentStatus.equals(OrderStatus.CONFIRMED)))) {
                throw new BadRequestException("Khách hàng chỉ được phép hủy đơn hàng của chính mình khi đơn ở trạng thái PENDING hoặc CONFIRMED!");
            }
        }

        if (currentStatus.equals(OrderStatus.PENDING) && newStatus.equals(OrderStatus.CONFIRMED)) {
            // Đơn thanh toán online chỉ được tiếp nhận SAU KHI khách đã thanh toán (VNPay ghi nhận PAID) trong hạn chờ.
            // Đơn COD thì nhân viên tiếp nhận ngay.
            Payment payment = order.getPayment();
            if (payment == null) {
                throw new BadRequestException("Đơn hàng chưa có thông tin thanh toán, chưa thể tiếp nhận!");
            }
            if (!payment.getMethod().equals(PaymentMethod.COD) && !payment.getStatus().equals(PaymentStatus.PAID)) {
                throw new BadRequestException(
                        "Đơn hàng đang chờ khách thanh toán qua VNPay, chưa thể tiếp nhận hay đi đơn cho tới khi khách thanh toán!");
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
            String trackingNumber = null;
            try {
                trackingNumber = shippingIntegrationService.createShippingOrder(order);
            } catch (Exception e) {
                log.warn("Không thể tạo đơn hàng tự động qua hãng vận chuyển ({}) cho đơn {}: {}. Tiếp tục chuyển trạng thái đóng gói đơn hàng.",
                        order.getShipment() != null && order.getShipment().getProvider() != null ? order.getShipment().getProvider().getCode() : "UNKNOWN",
                        order.getOrderCode(), e.getMessage());
                String provCode = order.getShipment() != null && order.getShipment().getProvider() != null 
                        ? order.getShipment().getProvider().getCode().toUpperCase() : "SHIP";
                trackingNumber = "PENDING_" + provCode + "_" + order.getOrderCode();
            }

            Shipment shipment = order.getShipment();
            if (shipment != null) {
                shipment.setTrackingNumber(trackingNumber);
            }

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

            if (order.getOrderItems() != null) {
                for (OrderItem item : order.getOrderItems()) {
                    if (item.getVariant() != null && item.getVariant().getProduct() != null) {
                        productRepository.increaseSoldCount(item.getVariant().getProduct().getId(), item.getQuantity());
                    }
                }
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
            applyCancellation(order, user, cancelledReason, note);

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
                variantRepository.increaseStock(variant.getId(), orderItem.getQuantity());

                if (variant.getProduct() != null) {
                    productRepository.decreaseSoldCount(variant.getProduct().getId(), orderItem.getQuantity());
                }
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

        // Hủy / hoàn trả / giao thành công làm đổi tồn kho hoặc số đã bán
        productCacheEvictor.evictAfterCommit();

        eventPublisher.publishEvent(new OrderStatusChangedEvent(
                order.getId(), order.getOrderCode(), order.getUser().getId(), currentStatus, newStatus));

        return ApiResponse.success("Cập nhật trạng thái thành công!",
                mapperUtil.mapOrderToOrderDetailResponse(order));
    }


    /**
     * Hủy đơn: trả kho, trả lượt mã giảm giá, cập nhật thanh toán/vận chuyển, ghi lịch sử.
     * Dùng chung cho hủy thủ công và job tự hủy đơn quá hạn thanh toán.
     * Phải gọi trong transaction, khi đã khóa dòng đơn (findByIdForUpdate).
     */
    private void applyCancellation(Order order, User actor, String cancelledReason, String note) {
        List<OrderItem> orderItems = order.getOrderItems();
        if (orderItems != null) {
            for (OrderItem orderItem : orderItems) {
                ProductVariant variant = orderItem.getVariant();
                if (variant != null) {
                    variantRepository.increaseStock(variant.getId(), orderItem.getQuantity());
                }
            }
        }

        Coupon coupon = order.getCoupon();
        if (coupon != null) {
            couponRepository.decreaseUsedCount(coupon.getId());
            couponUsageRepository.deleteByOrder_Id(order.getId());
        }

        Payment payment = order.getPayment();
        if (payment != null) {
            if (PaymentStatus.PAID.equals(payment.getStatus())) {
                // Đã thu tiền -> cần hoàn tiền (hiện trong danh sách "chờ hoàn tiền" của nhân viên)
                payment.setStatus(PaymentStatus.REFUND);
            } else {
                payment.setStatus(PaymentStatus.CANCELLED);
            }
        }

        Shipment shipment = order.getShipment();
        if (shipment != null) {
            // Đơn đã tạo vận đơn bên hãng (PROCESSING) thì phải hủy cả bên hãng (best-effort, không làm hỏng giao dịch)
            if (order.getStatus() == OrderStatus.PROCESSING) {
                shippingIntegrationService.cancelShippingOrder(shipment);
            }
            shipment.setStatus(ShipmentStatus.CANCELLED);
        }

        order.setStatus(OrderStatus.CANCELED);
        order.setCanceledAt(Instant.now());
        order.setCancelReason(cancelledReason != null && !cancelledReason.isBlank() ? cancelledReason : note);

        OrderStatusHistory orderStatusHistory = OrderStatusHistory.builder()
                .status(OrderStatus.CANCELED)
                .changedBy(actor)
                .order(order)
                .note(cancelledReason)
                .build();

        order.getOrderStatusHistories().add(orderStatusHistory);
        orderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> findExpiredUnpaidOrderIds(Instant cutoff, int limit) {
        return orderRepository.findExpiredUnpaidOrders(
                        OrderStatus.PENDING,
                        PaymentMethod.COD,
                        List.of(PaymentStatus.PENDING, PaymentStatus.FAILED),
                        cutoff,
                        PageRequest.of(0, Math.max(1, limit)))
                .stream()
                .map(Order::getId)
                .toList();
    }

    @Override
    @Transactional
    public boolean expireOrderIfUnpaid(Long orderId, Instant cutoff) {
        Order order = orderRepository.findByIdForUpdate(orderId).orElse(null);
        if (order == null || order.getStatus() != OrderStatus.PENDING) {
            return false;
        }
        Payment payment = order.getPayment();
        // Đơn chưa có bản ghi thanh toán (khách bỏ giữa chừng) cũng bị hủy khi quá hạn để trả lại kho
        if (payment != null && (payment.getMethod() == PaymentMethod.COD
                || (payment.getStatus() != PaymentStatus.PENDING && payment.getStatus() != PaymentStatus.FAILED))) {
            return false;
        }
        if (order.getCreatedAt() != null && !order.getCreatedAt().isBefore(cutoff)) {
            return false;
        }

        String reason = "Tự động hủy do quá hạn thanh toán";
        applyCancellation(order, order.getUser(), reason, reason);
        productCacheEvictor.evictAfterCommit();
        eventPublisher.publishEvent(new OrderStatusChangedEvent(
                order.getId(), order.getOrderCode(), order.getUser().getId(),
                OrderStatus.PENDING, OrderStatus.CANCELED));
        return true;
    }

    @Override
    @Transactional
    public ApiResponse<?> cancelOrder(Long userId, Long orderId, String reason) {
        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .orderId(orderId)
                .newStatus(OrderStatus.CANCELED)
                .cancelledReason(reason)
                .note(reason)
                .build();
        return updateOrderStatus(userId, request);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<com.sportecommerce.dto.response.OrderDetailResponse>> getAllOrders() {
        List<Order> orders = orderRepository.findAllWithDetails();
        java.util.Map<Long, List<OrderItem>> itemsByOrderId = new java.util.HashMap<>();
        if (!orders.isEmpty()) {
            List<OrderItem> allItems = orderItemRepository.findByOrderInWithVariant(orders);
            itemsByOrderId = allItems.stream()
                    .filter(oi -> oi.getOrder() != null && oi.getOrder().getId() != null)
                    .collect(java.util.stream.Collectors.groupingBy(oi -> oi.getOrder().getId()));
        }
        final java.util.Map<Long, List<OrderItem>> finalItemsMap = itemsByOrderId;
        List<com.sportecommerce.dto.response.OrderDetailResponse> payload = orders.stream()
                .map(o -> mapperUtil.mapOrderToOrderDetailResponse(o, finalItemsMap.getOrDefault(o.getId(), java.util.Collections.emptyList())))
                .collect(java.util.stream.Collectors.toList());
        return ApiResponse.success("Lấy danh sách đơn hàng thành công", payload);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<com.sportecommerce.dto.response.OrderDetailResponse>> getMyOrders(Long userId) {
        if (userId == null) {
            throw new BadRequestException("User ID không được để trống!");
        }
        List<Order> orders = orderRepository.findMyOrdersWithDetails(userId);
        java.util.Map<Long, List<OrderItem>> itemsByOrderId = new java.util.HashMap<>();
        if (!orders.isEmpty()) {
            List<OrderItem> allItems = orderItemRepository.findByOrderInWithVariant(orders);
            itemsByOrderId = allItems.stream()
                    .filter(oi -> oi.getOrder() != null && oi.getOrder().getId() != null)
                    .collect(java.util.stream.Collectors.groupingBy(oi -> oi.getOrder().getId()));
        }
        final java.util.Map<Long, List<OrderItem>> finalItemsMap = itemsByOrderId;
        List<com.sportecommerce.dto.response.OrderDetailResponse> payload = orders.stream()
                .map(o -> mapperUtil.mapOrderToOrderDetailResponse(o, finalItemsMap.getOrDefault(o.getId(), java.util.Collections.emptyList())))
                .collect(java.util.stream.Collectors.toList());
        return ApiResponse.success("Lấy danh sách đơn hàng thành công", payload);
    }
}
