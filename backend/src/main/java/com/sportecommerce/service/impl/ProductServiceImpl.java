package com.sportecommerce.service.impl;

import com.sportecommerce.dto.request.CreateProductRequest;
import com.sportecommerce.dto.request.ProductImageRequest;
import com.sportecommerce.dto.request.ProductVariantRequest;
import com.sportecommerce.dto.response.ProductImageResponse;
import com.sportecommerce.dto.response.ProductResponse;
import com.sportecommerce.dto.response.ProductVariantResponse;
import com.sportecommerce.entity.*;
import com.sportecommerce.enums.ProductStatus;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.BrandRepository;
import com.sportecommerce.repository.CategoryRepository;
import com.sportecommerce.repository.ProductRepository;
import com.sportecommerce.repository.ProductVariantRepository;
import com.sportecommerce.service.ProductService;
import com.sportecommerce.util.SlugUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductVariantRepository variantRepository;

    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {

        // 1. Kiểm tra Validate category_id, brand_id có tồn tại không
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy category_id: " + request.getCategoryId()));

        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy brand_id: " + request.getBrandId()));
        }

        // 2. Generate slug từ name, đảm bảo duy nhất
        String uniqueSlug = generateUniqueProductSlug(SlugUtil.toSlug(request.getName()));

        // 3. Tạo Product với status mặc định là DRAFT
        Product product = Product.builder()
                .category(category)
                .brand(brand)
                .name(request.getName())
                .slug(uniqueSlug)
                .description(request.getDescription())
                .sportType(request.getSportType())
                .basePrice(request.getBasePrice())
                .salePrice(request.getSalePrice())
                .status(ProductStatus.DRAFT)
                .build();

        // 4. Kiểm tra SKU có trùng không trước khi gắn vào Product.
        for (ProductVariantRequest vReq : request.getVariants()) {
            if (variantRepository.existsBySku(vReq.getSku())) {
                throw new AppException("SKU đã tồn tại trong hệ thống: " + vReq.getSku());
            }
            ProductVariant variant = ProductVariant.builder()
                    .sku(vReq.getSku())
                    .size(vReq.getSize())
                    .color(vReq.getColor())
                    .price(vReq.getPrice())
                    .salePrice(vReq.getSalePrice())
                    .stock(vReq.getStock())
                    .weightGram(vReq.getWeightGram())
                    .imageUrl(vReq.getImageUrl())
                    .build();
            product.addVariant(variant); //tự gán product 2 chiều
        }

        // 5. Duyệt qua danh sách Images
        if (request.getImages() != null) {
            for (ProductImageRequest iReq : request.getImages()) {
                ProductImage image = ProductImage.builder()
                        .imageUrl(iReq.getImageUrl())
                        .isPrimary(Boolean.TRUE.equals(iReq.getIsPrimary()))
                        .sortOrder(iReq.getSortOrder() != null ? iReq.getSortOrder() : 0)
                        .build();
                product.addImage(image);
            }
        }

        Product saved = productRepository.save(product);

        return toResponse(saved);
    }

    private String generateUniqueProductSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (productRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }

    private ProductResponse toResponse(Product p) {
        List<ProductVariantResponse> variantResponses = p.getProductVariants().stream()
                .map(v -> ProductVariantResponse.builder()
                        .id(v.getId())
                        .sku(v.getSku())
                        .size(v.getSize())
                        .color(v.getColor())
                        .price(v.getPrice())
                        .salePrice(v.getSalePrice())
                        .stock(v.getStock())
                        .isActive(v.getIsActive())
                        .imageUrl(v.getImageUrl())
                        .build())
                .collect(Collectors.toList());

        List<ProductImageResponse> imageResponses = p.getProductImages() == null
                ? Collections.emptyList()
                : p.getProductImages().stream()
                .map(i -> ProductImageResponse.builder()
                        .id(i.getId())
                        .imageUrl(i.getImageUrl())
                        .isPrimary(i.getIsPrimary())
                        .sortOrder(i.getSortOrder())
                        .build())
                .collect(Collectors.toList());

        return ProductResponse.builder()
                .id(p.getId())
                .categoryId(p.getCategory().getId())
                .categoryName(p.getCategory().getName())
                .brandId(p.getBrand() != null ? p.getBrand().getId() : null)
                .brandName(p.getBrand() != null ? p.getBrand().getName() : null)
                .name(p.getName())
                .slug(p.getSlug())
                .description(p.getDescription())
                .sportType(p.getSportType())
                .status(p.getStatus())
                .basePrice(p.getBasePrice())
                .salePrice(p.getSalePrice())
                .isFeatured(p.getIsFeatured())
                .avgRating(p.getAvgRating())
                .reviewCount(p.getReviewCount())
                .soldCount(p.getSoldCount())
                .variants(variantResponses)
                .images(imageResponses)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
