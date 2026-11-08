package com.sportecommerce.service;

import com.sportecommerce.dto.response.TagResponse;

import java.util.List;

public interface ProductTagService {
    List<TagResponse> getTagsOfProduct(Long productId);
    TagResponse attach(Long productId, Long tagId);
    void detach(Long productId, Long tagId);
}
