package com.sportecommerce.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MarkRefundedRequest {

    /** Ghi chú của nhân viên (VD: mã giao dịch hoàn tiền, cách hoàn). */
    @Size(max = 255, message = "Ghi chú tối đa 255 ký tự")
    private String note;
}
