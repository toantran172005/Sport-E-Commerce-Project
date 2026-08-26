package com.sportecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "brands")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name", length = 150, nullable = false, unique = true)
    private String name;

    @Column(name = "slug", length = 180 , nullable = false, unique = true)
    private String slug;

    @Column(name = "logo_url", columnDefinition = "text")
    private String logoUrl;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private Instant createdAt;

    @OneToMany(mappedBy = "brand")
    @Builder.Default
    private List<Product> products = new ArrayList<>();
}
