package com.sportecommerce.repository.spec;

import com.sportecommerce.entity.Product;
import com.sportecommerce.enums.ProductStatus;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {
    public ProductSpecification() {
    }

    public static Specification<Product> filterBy(ProductStatus status, Long categoryId, Long brandId, String keyword){
        return (root, query, cb) -> {
            if(query.getResultType() != Long.class){
                root.fetch("category", JoinType.LEFT);
                root.fetch("brand", JoinType.LEFT);
            }

            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isNull(root.get("deletedAt")));

            if(status != null){
                predicates.add(cb.equal(root.get("status"), status));
            }

            if(categoryId != null){
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if(brandId != null){
                predicates.add(cb.equal(root.get("brand").get("id"), brandId));
            }

            if(keyword != null && !keyword.isBlank()){
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + keyword.toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

}
