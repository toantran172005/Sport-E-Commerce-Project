package com.sportecommerce.service.impl;

import com.sportecommerce.dto.response.TagResponse;
import com.sportecommerce.entity.Product;
import com.sportecommerce.entity.ProductTag;
import com.sportecommerce.entity.Tag;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.exception.ResourceNotFoundException;
import com.sportecommerce.repository.ProductRepository;
import com.sportecommerce.repository.ProductTagRepository;
import com.sportecommerce.repository.TagRepository;
import com.sportecommerce.service.ProductTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductTagServiceImpl implements ProductTagService {
    private final ProductRepository productRepository;
    private final TagRepository tagRepository;
    private final ProductTagRepository productTagRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TagResponse> getTagsOfProduct(Long productId) {
        requireProduct(productId);
        return productTagRepository.findByProduct_Id(productId).stream()
                .map(pt -> toResponse(pt.getTag()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TagResponse attach(Long productId, Long tagId) {
        Product product = requireProduct(productId);
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new AppException("Không tìm thấy tag_id: " + tagId));

        if (productTagRepository.existsByProduct_IdAndTag_Id(productId, tagId)) {
            throw new AppException("Sản phẩm đã được gắn tag: " + tag.getName());
        }

        productTagRepository.save(ProductTag.builder().product(product).tag(tag).build());
        return toResponse(tag);
    }

    @Override
    @Transactional
    public void detach(Long productId, Long tagId) {
        requireProduct(productId);
        ProductTag link = productTagRepository.findByProduct_IdAndTag_Id(productId, tagId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Sản phẩm " + productId + " chưa được gắn tag " + tagId));
        productTagRepository.delete(link);
    }

    private Product requireProduct(Long productId) {
        return productRepository.findByIdAndDeletedAtIsNull(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm id: " + productId));
    }

    private TagResponse toResponse(Tag t) {
        return TagResponse.builder().id(t.getId()).name(t.getName()).slug(t.getSlug()).build();
    }
}
