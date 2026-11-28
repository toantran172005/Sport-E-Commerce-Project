package com.sportecommerce.cache;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Xóa cache sản phẩm khi tồn kho / số lượng đã bán thay đổi do đơn hàng (đặt, hủy, hoàn trả, giao thành công, hết hạn).
 * Chạy SAU KHI transaction commit để một request đọc xen giữa không nạp lại số liệu cũ vào cache.
 */
@Component
@RequiredArgsConstructor
public class ProductCacheEvictor {

    private final CacheManager cacheManager;

    public void evictAfterCommit() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    clear();
                }
            });
        } else {
            clear();
        }
    }

    private void clear() {
        Cache cache = cacheManager.getCache("products");
        if (cache != null) {
            cache.clear();
        }
    }
}
