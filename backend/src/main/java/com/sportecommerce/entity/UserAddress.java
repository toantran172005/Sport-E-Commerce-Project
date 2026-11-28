package com.sportecommerce.entity;

import com.sportecommerce.enums.AddressScheme;
import com.sportecommerce.enums.AddressType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.proxy.HibernateProxy;

import java.time.OffsetDateTime;
import java.util.Objects;

/**
 * Bang user_addresses - so dia chi giao hang / thanh toan cua nguoi dung.
 */
@Entity
@Table(name = "user_addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "user")
public class UserAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "recipient_name", nullable = false, length = 150)
    private String recipientName;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(name = "address_line", nullable = false, columnDefinition = "TEXT")
    private String addressLine;

    @Column(name = "ward", length = 100)
    private String ward;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    /** Mô hình địa chỉ: OLD (3 cấp) hoặc NEW (2 cấp, không có Quận/Huyện). */
    @Enumerated(EnumType.STRING)
    @Column(name = "address_scheme", nullable = false, length = 10)
    @Builder.Default
    private AddressScheme addressScheme = AddressScheme.OLD;

    /** ID Tỉnh/Thành theo danh mục GHN (đúng theo addressScheme). */
    @Column(name = "ghn_province_id")
    private Integer ghnProvinceId;

    /** ID Quận/Huyện theo danh mục GHN cũ (null với địa chỉ mới). */
    @Column(name = "ghn_district_id")
    private Integer ghnDistrictId;

    /** Mã Phường/Xã theo danh mục GHN (OLD: WardCode, NEW: _id). */
    @Column(name = "ghn_ward_code", length = 20)
    private String ghnWardCode;

    @Column(name = "country", length = 100)
    @Builder.Default
    private String country = "Vietnam";

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    @Builder.Default
    private AddressType type = AddressType.SHIPPING;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    /** Địa chỉ đầy đủ, bỏ qua các cấp trống (địa chỉ mới không có Quận/Huyện). */
    public String fullAddress() {
        StringBuilder sb = new StringBuilder();
        for (String part : new String[]{addressLine, ward, district, city}) {
            if (part != null && !part.isBlank()) {
                if (sb.length() > 0) sb.append(", ");
                sb.append(part.trim());
            }
        }
        return sb.toString();
    }

    @Override
    public final boolean equals(Object object) {
        if (this == object) return true;
        if (object == null) return false;
        Class<?> oEffectiveClass = object instanceof HibernateProxy ? ((HibernateProxy) object).getHibernateLazyInitializer().getPersistentClass() : object.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        UserAddress that = (UserAddress) object;
        return getId() != null && Objects.equals(getId(), that.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}