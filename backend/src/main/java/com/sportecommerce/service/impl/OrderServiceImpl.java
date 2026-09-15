package com.sportecommerce.service.impl;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.OrderItemRequest;
import com.sportecommerce.dto.request.PlaceOrderRequest;
import com.sportecommerce.dto.response.PlaceOrderResponse;
import com.sportecommerce.entity.*;
import com.sportecommerce.enums.OrderStatus;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.exception.BadRequestException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.UserAddressRepository;
import com.sportecommerce.repository.CartItemRepository;
import com.sportecommerce.repository.OrderRepository;
import com.sportecommerce.repository.ProductVariantRepository;
import com.sportecommerce.repository.UserRepository;
import com.sportecommerce.service.OrderService;
import com.sportecommerce.util.MapperUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final MapperUtil mapperUtil;

    @Override
    @Transactional
    public ApiResponse<PlaceOrderResponse> placeOrder(Long userId, PlaceOrderRequest request) {
        User user = userRepository.findUserById(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy user trong request đặt hàng!"));

        UserAddress address = userAddressRepository.findById(request.getShippingAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ giao hàng!"));

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderCode("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setNote(request.getNote());
        
        order.setShippingAddress(address);
        String snapshot = address.getRecipientName() + " - " + address.getPhoneNumber() + " - " + 
                          address.getAddressLine() + ", " + address.getWard() + ", " + 
                          address.getDistrict() + ", " + address.getCity();
        order.setShippingAddressSnapshot(snapshot);

        Payment payment = new Payment();
        payment.setMethod(request.getPaymentMethod());
        payment.setOrder(order);

        order.setPayment(payment);

        List<OrderItem> orderItems = new ArrayList<>();
        Double subTotal = 0.0;

        // Đặt hàng thông qua giỏ hàng
        if (request.getCartItemIds() != null && !request.getCartItemIds().isEmpty()) {
            List<CartItem> cartItems = cartItemRepository
                    .findAllById(request.getCartItemIds());

            for (CartItem cartItem : cartItems) {
                ProductVariant variant = cartItem.getVariant();

                if (variant.getStock() < cartItem.getQuantity()) {
                    throw new BadRequestException("Sản phẩm " + variant.getSku() + " không đủ số lượng trong kho!");
                }

                variant.setStock(variant.getStock() - cartItem.getQuantity());
                variantRepository.save(variant);

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setVariant(variant);
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setUnitPrice(variant.getPrice());

                orderItems.add(orderItem);
                subTotal += variant.getPrice() * cartItem.getQuantity();
            }

            cartItemRepository.deleteAll(cartItems);
            // Đặt hàng bằng nút "Mua ngay"
        } else if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (OrderItemRequest itemRequest : request.getItems()) {
                ProductVariant variant = variantRepository.findById(itemRequest.getVariantId())
                        .orElseThrow(() -> new ResourceNotFoundException("Variant không tồn tại!"));

                if (variant.getStock() < itemRequest.getQuantity()) {
                    throw new BadRequestException("Sản phẩm " + variant.getSku() + " không đủ số lượng!");
                }

                variant.setStock(variant.getStock() - itemRequest.getQuantity());
                variantRepository.save(variant);

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setVariant(variant);
                orderItem.setQuantity(itemRequest.getQuantity());
                orderItem.setUnitPrice(variant.getPrice());

                orderItems.add(orderItem);
                subTotal += variant.getPrice() * itemRequest.getQuantity();
            }
        } else {
            throw new BadRequestException("Đơn hàng không có sản phẩm nào để thanh toán!");
        }

        Double shippingFee = 30000.0; // Mock data phí ship
        order.setOrderItems(orderItems);
        order.setShippingFee(shippingFee);
        order.setSubTotal(subTotal);
        Double total = subTotal + shippingFee;
        order.setTotalAmount(total);
        
        payment.setAmount(total);

        Order completedOrder = orderRepository.save(order);

        return ApiResponse.success("Đặt hàng thành công"
                , mapperUtil.mapOrderToPlaceOrderResponse(completedOrder));
    }
}
