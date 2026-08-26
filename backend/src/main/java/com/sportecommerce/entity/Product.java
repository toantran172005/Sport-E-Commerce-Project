package com.sportecommerce.entity;


import com.sportecommerce.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "slug", length = 280 , nullable = false, unique = true)
    private String slug;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "sport_type", length = 100)
    private String sportType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ProductStatus status = ProductStatus.DRAFT;

    @Column(name = "base_price", nullable = false)
    private Double basePrice;

    @Column(name = "sale_price")
    private Double salePrice;

    @Column(name = "is_featured", nullable = false)
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "avg_rating", nullable = false)
    @Builder.Default
    private Double avgRating = 0.0;

    @Column(name = "review_count", nullable = false)
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(name = "sold_count", nullable = false)
    @Builder.Default
    private Integer soldCount = 0;

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private Instant updatedAt;

    @Column(name = "deleted_at", nullable = true)
    private Instant deletedAt;

    @ManyToOne()
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne()
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @OneToMany(mappedBy = "product")
    @Builder.Default
    private List<ProductImage> productImages = new ArrayList<>();

    @OneToMany(mappedBy = "product")
    @Builder.Default
    private List<ProductAttributes> productAttributes = new ArrayList<>();

    @OneToMany(mappedBy = "product")
    @Builder.Default
    private List<ProductVariant> productVariants = new ArrayList<>();

    @OneToMany(mappedBy = "product")
    @Builder.Default
    private List<ProductTag> productTags = new ArrayList<>();
}
