package com.sportecommerce.cache;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

/**
 * Cache trong bộ nhớ (Caffeine) cho dữ liệu đọc nhiều, ít đổi: danh mục, thương hiệu, mã giảm giá đang áp dụng, sản phẩm.
 * DB ở xa (Neon) khiến mỗi truy vấn tốn hàng trăm ms nên cache giúp trang chủ/danh sách phản hồi gần như tức thì.
 * Mọi thao tác ghi của admin đều @CacheEvict; TTL ngắn là lưới an toàn cho dữ liệu đổi từ nơi khác (tồn kho, đánh giá...).
 * Lưu ý: cache nằm trong từng instance; nếu chạy nhiều instance cần chuyển sang Redis cache.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(
            @Value("${app.cache.catalog-ttl-seconds:120}") long catalogTtl,
            @Value("${app.cache.coupon-ttl-seconds:30}") long couponTtl,
            @Value("${app.cache.product-ttl-seconds:30}") long productTtl) {
        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(List.of(
                build("categories", catalogTtl, 200),
                build("brands", catalogTtl, 200),
                build("coupons", couponTtl, 50),
                build("products", productTtl, 2000)));
        return manager;
    }

    private static CaffeineCache build(String name, long ttlSeconds, long maxSize) {
        return new CaffeineCache(name, Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofSeconds(ttlSeconds))
                .maximumSize(maxSize)
                .recordStats()
                .build());
    }
}
