package com.sportecommerce.service.impl;

import com.sportecommerce.dto.request.CategoryRequest;
import com.sportecommerce.dto.response.CategoryResponse;
import com.sportecommerce.entity.Category;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.CategoryRepository;
import com.sportecommerce.repository.ProductRepository;
import com.sportecommerce.service.CategoryService;
import com.sportecommerce.util.SlugUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        Category parent = resolveParent(request.getParentId());

        String uniqueSlug = generateUniqueSlug(SlugUtil.toSlug(request.getName()));

        Category category = Category.builder()
                .parent(parent)
                .name(request.getName())
                .slug(uniqueSlug)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .isActive(true)
                .build();

        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy category_id: " + id));

        // Không cho phép tự làm parent của chính mình
        if (request.getParentId() != null && request.getParentId().equals(id)) {
            throw new AppException("Category không thể là parent của chính nó");
        }
        Category parent = resolveParent(request.getParentId());

        // Chỉ generate lại slug nếu tên thay đổi, tránh đổi URL không cần thiết
        if (!category.getName().equals(request.getName())) {
            category.setSlug(generateUniqueSlug(SlugUtil.toSlug(request.getName())));
        }

        category.setParent(parent);
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        if (request.getSortOrder() != null) {
            category.setSortOrder(request.getSortOrder());
        }

        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void softDelete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy category_id: " + id));

        // Nghiệp vụ: chặn xóa nếu vẫn còn Product gắn với Category này
        if (productRepository.existsByCategory_Id(id)) {
            throw new AppException(
                    "Không thể xóa: vẫn còn sản phẩm thuộc category này");
        }

        category.setIsActive(false);
        categoryRepository.save(category);
    }

    private Category resolveParent(Long parentId) {
        if (parentId == null) {
            return null;
        }
        return categoryRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy parent_id: " + parentId));
    }

    private String generateUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (categoryRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }

    private CategoryResponse toResponse(Category c) {
        return CategoryResponse.builder()
                .id(c.getId())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .imageUrl(c.getImageUrl())
                .isActive(c.getIsActive())
                .sortOrder(c.getSortOrder())
                .build();
    }
}
