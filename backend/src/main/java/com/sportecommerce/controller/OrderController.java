package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.request.PlaceOrderRequest;
import com.sportecommerce.dto.response.PlaceOrderResponse;
import com.sportecommerce.security.UserPrincipal;
import com.sportecommerce.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/order")
public class OrderController {

    public final OrderService orderService;

    @PostMapping("/place-order")
    public ResponseEntity< ApiResponse<PlaceOrderResponse>> placeOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody PlaceOrderRequest request) {
        Long userId = userPrincipal.getId();
        ApiResponse<PlaceOrderResponse> orderResponse = orderService.placeOrder(userId, request);

        return ResponseEntity.ok(orderResponse);
    }

}
