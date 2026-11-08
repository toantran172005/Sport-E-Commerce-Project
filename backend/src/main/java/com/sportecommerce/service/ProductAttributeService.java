package com.sportecommerce.service;

import com.sportecommerce.dto.request.AttributeRequest;
import com.sportecommerce.dto.response.ProductAttributeResponse;

import java.util.List;

public interface ProductAttributeService {
    List<ProductAttributeResponse> getByProduct(Long productId);
    ProductAttributeResponse add(Long productId, AttributeRequest request);
    ProductAttributeResponse update(Long productId, Long attributeId, AttributeRequest request);
    void delete(Long productId, Long attributeId);
}
