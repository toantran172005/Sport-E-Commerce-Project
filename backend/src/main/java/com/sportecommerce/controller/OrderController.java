package com.sportecommerce.controller;

import com.sportecommerce.common.ApiResponse;
import com.sportecommerce.dto.response.OrderResponse;
import com.sportecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/order")
public class OrderController {

    public final OrderService orderService;

    @GetMapping("/get-order-by-userid/{userId}")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrdersByUserId
            (
                   @PathVariable Long userId
            ) {
        return ResponseEntity.ok(orderService.getAllOrdersByUserId(userId));
    }

}
