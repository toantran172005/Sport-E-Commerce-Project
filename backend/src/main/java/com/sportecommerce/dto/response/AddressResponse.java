package com.sportecommerce.dto.response;

import com.sportecommerce.entity.UserAddress;
import com.sportecommerce.enums.AddressScheme;
import com.sportecommerce.enums.AddressType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressResponse {

    private Long id;
    private String recipientName;
    private String phoneNumber;
    private String addressLine;
    private String ward;
    private String district;
    private String city;
    private AddressScheme addressScheme;
    private Integer ghnProvinceId;
    private Integer ghnDistrictId;
    private String ghnWardCode;
    private String fullAddress;
    private String country;
    private AddressType type;
    private Boolean isDefault;
    private OffsetDateTime createdAt;

    public static AddressResponse fromEntity(UserAddress a) {
        return AddressResponse.builder()
                .id(a.getId())
                .recipientName(a.getRecipientName())
                .phoneNumber(a.getPhoneNumber())
                .addressLine(a.getAddressLine())
                .ward(a.getWard())
                .district(a.getDistrict())
                .city(a.getCity())
                .addressScheme(a.getAddressScheme() != null ? a.getAddressScheme() : AddressScheme.OLD)
                .ghnProvinceId(a.getGhnProvinceId())
                .ghnDistrictId(a.getGhnDistrictId())
                .ghnWardCode(a.getGhnWardCode())
                .fullAddress(a.fullAddress())
                .country(a.getCountry())
                .type(a.getType())
                .isDefault(Boolean.TRUE.equals(a.getIsDefault()))
                .createdAt(a.getCreatedAt())
                .build();
    }
}
