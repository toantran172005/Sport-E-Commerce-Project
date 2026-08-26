package com.sportecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_attributes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductAttributes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "attribute_name", length = 100, nullable = false)
    private String attributeName;

    @Column(name = "attribute_value", length = 255, nullable = false)
    private String attributeValue;

    @ManyToOne()
    @JoinColumn(name = "product_id")
    private Product product;
}
