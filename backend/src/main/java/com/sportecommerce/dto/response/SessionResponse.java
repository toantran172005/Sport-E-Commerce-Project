package com.sportecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

/**
 * 1 phiên đăng nhập (thiết bị) đang hoạt động của người dùng.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionResponse {
    private Long id;
    private String deviceName;
    private String ipAddress;
    private OffsetDateTime createdAt;
    private OffsetDateTime lastUsedAt;
    /** true nếu đây là phiên đang gọi API. */
    private boolean current;
}
