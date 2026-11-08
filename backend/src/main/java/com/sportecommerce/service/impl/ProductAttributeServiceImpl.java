package com.sportecommerce.service.impl;

import com.sportecommerce.dto.request.AttributeRequest;
import com.sportecommerce.dto.response.ProductAttributeResponse;
import com.sportecommerce.entity.Product;
import com.sportecommerce.entity.ProductAttributes;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.ProductAttributesRepository;
import com.sportecommerce.repository.ProductRepository;
import com.sportecommerce.service.ProductAttributeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductAttributeServiceImpl implements ProductAttributeService {
    private final ProductRepository productRepository;
    private final ProductAttributesRepository attributesRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductAttributeResponse> getByProduct(Long productId) {
        requireProduct(productId);
        return attributesRepository.findByProduct_Id(productId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductAttributeResponse add(Long productId, AttributeRequest request) {
        Product product = requireProduct(productId);
        String name = request.getAttributeName().trim();

        if (attributesRepository.existsByProduct_IdAndAttributeNameIgnoreCase(productId, name)) {
            throw new AppException("Sản phẩm đã có thuộc tính: " + name);
        }

        ProductAttributes attribute = ProductAttributes.builder()
                .product(product)
                .attributeName(name)
                .attributeValue(request.getAttributeValue().trim())
                .build();

        return toResponse(attributesRepository.save(attribute));
    }

    @Override
    @Transactional
    public ProductAttributeResponse update(Long productId, Long attributeId, AttributeRequest request) {
        requireProduct(productId);
        ProductAttributes attribute = requireAttribute(productId, attributeId);

        String newName = request.getAttributeName().trim();
        if (!attribute.getAttributeName().equalsIgnoreCase(newName)
                && attributesRepository.existsByProduct_IdAndAttributeNameIgnoreCase(productId, newName)) {
            throw new AppException("Sản phẩm đã có thuộc tính: " + newName);
        }

        attribute.setAttributeName(newName);
        attribute.setAttributeValue(request.getAttributeValue().trim());

        return toResponse(attributesRepository.save(attribute));
    }

    @Override
    @Transactional
    public void delete(Long productId, Long attributeId) {
        requireProduct(productId);
        attributesRepository.delete(requireAttribute(productId, attributeId));
    }

    private Product requireProduct(Long productId) {
        return productRepository.findByIdAndDeletedAtIsNull(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm id: " + productId));
    }

    private ProductAttributes requireAttribute(Long productId, Long attributeId) {
        return attributesRepository.findByIdAndProduct_Id(attributeId, productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy thuộc tính id " + attributeId + " của sản phẩm " + productId));
    }

    private ProductAttributeResponse toResponse(ProductAttributes a) {
        return ProductAttributeResponse.builder()
                .id(a.getId())
                .attributeName(a.getAttributeName())
                .attributeValue(a.getAttributeValue())
                .build();
    }
}
