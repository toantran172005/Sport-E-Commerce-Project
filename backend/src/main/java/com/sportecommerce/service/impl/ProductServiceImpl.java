package com.sportecommerce.service.impl;

import com.sportecommerce.dto.request.CreateProductRequest;
import com.sportecommerce.dto.request.ProductImageRequest;
import com.sportecommerce.dto.request.ProductVariantRequest;
import com.sportecommerce.dto.request.UpdateProductRequest;
import com.sportecommerce.dto.response.*;
import com.sportecommerce.entity.*;
import com.sportecommerce.enums.ProductStatus;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.BrandRepository;
import com.sportecommerce.repository.CategoryRepository;
import com.sportecommerce.repository.ProductRepository;
import com.sportecommerce.repository.ProductVariantRepository;
import com.sportecommerce.repository.spec.ProductSpecification;
import com.sportecommerce.service.ProductService;
import com.sportecommerce.util.MapperUtil;
import com.sportecommerce.util.SlugUtil;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.object.UpdatableSqlQuery;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.time.Instant;
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
    private final MapperUtil mapperUtil;

    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy category_id: " + request.getCategoryId()));

        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy brand_id: " + request.getBrandId()));
        }

        String uniqueSlug = generateUniqueProductSlug(SlugUtil.toSlug(request.getName()));

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
            product.addVariant(variant);
        }

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
        return mapperUtil.mapToProductResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, UpdateProductRequest request){
        Product product = productRepository.findByIdAndDeletedAtIsNull(id).
                orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm có id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId()).
                orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy category_id: " + request.getCategoryId()));

        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy brand_id: " + request.getBrandId()));
        }

        // Chỉ generate lại slug nếu tên đổi tránh đổi URL sản phẩm không cần thiết
        if (!product.getName().equals(request.getName())) {
            product.setSlug(generateUniqueProductSlug(SlugUtil.toSlug(request.getName())));
        }

        product.setCategory(category);
        product.setBrand(brand);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setSportType(request.getSportType());
        product.setBasePrice(request.getBasePrice());
        product.setSalePrice(request.getSalePrice());

        return mapperUtil.mapToProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm id: " + id));

        product.setDeletedAt(Instant.now());
        productRepository.save(product);
    }

    @Override
    @Transactional
    public ProductResponse updateStatus(Long id, ProductStatus status) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm id: " + id));

        if (product.getStatus() == status) {
            throw new AppException("Sản phẩm đã ở trạng thái " + status);
        }

        product.setStatus(status);
        return mapperUtil.mapToProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductSummaryResponse> getAll(
            ProductStatus status, Long categoryId, Long brandId, String keyword, Pageable pageable) {

        ProductStatus effectiveStatus = status != null ? status : ProductStatus.ACTIVE;

        Page<Product> page = productRepository.findAll(
                ProductSpecification.filterBy(effectiveStatus, categoryId, brandId, keyword), pageable);

        List<ProductSummaryResponse> content = page.getContent().stream()
                .map(mapperUtil::mapToProductSummaryResponse)
                .collect(Collectors.toList());

        return PageResponse.<ProductSummaryResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm id: " + id));
        return mapperUtil.mapToProductResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, CreateProductRequest request) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy category_id: " + request.getCategoryId()));

        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy brand_id: " + request.getBrandId()));
        }

        if (!product.getName().equals(request.getName())) {
            product.setSlug(generateUniqueProductSlug(SlugUtil.toSlug(request.getName())));
        }

        product.setCategory(category);
        product.setBrand(brand);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setSportType(request.getSportType());
        product.setBasePrice(request.getBasePrice());
        product.setSalePrice(request.getSalePrice());
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }

        Product saved = productRepository.save(product);
        return mapperUtil.mapToProductResponse(saved);
    }

    @Override
    @Transactional
    public void softDelete(Long id) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm id: " + id));

        product.setDeletedAt(Instant.now());
        product.setStatus(ProductStatus.DISCONTINUED);
        productRepository.save(product);
    }

    private String generateUniqueProductSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (productRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }

}
