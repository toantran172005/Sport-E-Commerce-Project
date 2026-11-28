package com.sportecommerce.service.impl;

import com.sportecommerce.dto.response.LocationOption;
import com.sportecommerce.enums.AddressScheme;
import com.sportecommerce.exception.AppException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Danh mục Tỉnh/Thành - Quận/Huyện - Phường/Xã lấy từ Giao Hàng Nhanh, dùng cho ô chọn địa chỉ.
 * - OLD (3 cấp): /master-data/province, /master-data/district, /master-data/ward.
 * - NEW (2 cấp, từ 01/07/2025): /v3/master-data/province/all, /v3/master-data/ward/all-by-province-id.
 * Kết quả được lưu đệm trong bộ nhớ để không gọi GHN mỗi lần khách mở form; lỗi không bị lưu đệm.
 */
@Service
public class GhnLocationService {

    private static final long CACHE_TTL_MS = 24L * 60 * 60 * 1000;
    private static final int PAGE_SIZE = 200;
    private static final int MAX_PAGES = 10;

    /** Loại danh mục của GHN cũ: mỗi dòng có thể chứa nhiều ID (vd Phường có cả DistrictID và WardCode). */
    private enum Kind {
        PROVINCE, DISTRICT, WARD, NEW
    }

    private record CacheEntry(List<LocationOption> data, long expiresAt) {
    }

    private final RestTemplate restTemplate = createRestTemplate();
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    @Value("${shipping.ghn.base-url}")
    private String ghnBaseUrl;

    @Value("${shipping.ghn.token}")
    private String ghnToken;

    @Value("${shipping.ghn.shop-id}")
    private String ghnShopId;

    private static RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3_000);
        factory.setReadTimeout(10_000);
        return new RestTemplate(factory);
    }

    public List<LocationOption> provinces(AddressScheme scheme) {
        if (scheme == AddressScheme.NEW) {
            return cached("NEW:P", () -> fetchPaged(ghnBaseUrl + "/v3/master-data/province/all"));
        }
        return cached("OLD:P", () -> fetch(ghnBaseUrl + "/master-data/province", Kind.PROVINCE));
    }

    /** Chỉ dùng cho địa chỉ OLD: Quận/Huyện theo Tỉnh. */
    public List<LocationOption> districts(int provinceId) {
        return cached("OLD:D:" + provinceId,
                () -> fetch(ghnBaseUrl + "/master-data/district?province_id=" + provinceId, Kind.DISTRICT));
    }

    /** OLD: theo districtId. NEW: theo provinceId (không có cấp Quận/Huyện). */
    public List<LocationOption> wards(AddressScheme scheme, Integer provinceId, Integer districtId) {
        if (scheme == AddressScheme.NEW) {
            if (provinceId == null) {
                throw new AppException("Thiếu provinceId", HttpStatus.BAD_REQUEST);
            }
            return cached("NEW:W:" + provinceId, () -> fetchPaged(
                    ghnBaseUrl + "/v3/master-data/ward/all-by-province-id?province_id=" + provinceId));
        }
        if (districtId == null) {
            throw new AppException("Thiếu districtId", HttpStatus.BAD_REQUEST);
        }
        return cached("OLD:W:" + districtId,
                () -> fetch(ghnBaseUrl + "/master-data/ward?district_id=" + districtId, Kind.WARD));
    }

    private List<LocationOption> cached(String key, java.util.function.Supplier<List<LocationOption>> loader) {
        CacheEntry entry = cache.get(key);
        long now = System.currentTimeMillis();
        if (entry != null && entry.expiresAt() > now) {
            return entry.data();
        }
        List<LocationOption> data = loader.get();
        if (!data.isEmpty()) {
            cache.put(key, new CacheEntry(data, now + CACHE_TTL_MS));
        }
        return data;
    }

    /** API mới giới hạn 200 dòng mỗi lần, lấy lần lượt cho tới khi hết. */
    private List<LocationOption> fetchPaged(String baseUrl) {
        List<LocationOption> all = new ArrayList<>();
        String sep = baseUrl.contains("?") ? "&" : "?";
        for (int page = 0; page < MAX_PAGES; page++) {
            List<LocationOption> part = fetch(baseUrl + sep + "offset=" + (page * PAGE_SIZE) + "&limit=" + PAGE_SIZE, Kind.NEW);
            all.addAll(part);
            if (part.size() < PAGE_SIZE) {
                break;
            }
        }
        return all;
    }

    @SuppressWarnings("unchecked")
    private List<LocationOption> fetch(String url, Kind kind) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnToken);
        headers.set("ShopId", ghnShopId);
        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);
            Object body = response.getBody() != null ? response.getBody().get("data") : null;
            if (!(body instanceof List<?> rows)) {
                return List.of();
            }
            List<LocationOption> result = new ArrayList<>();
            for (Object row : rows) {
                if (row instanceof Map<?, ?> m) {
                    LocationOption option = kind == Kind.NEW ? mapNew((Map<String, Object>) m) : mapOld((Map<String, Object>) m, kind);
                    if (option != null) {
                        result.add(option);
                    }
                }
            }
            result.sort((a, b) -> a.name().compareToIgnoreCase(b.name()));
            return result;
        } catch (Exception e) {
            throw new AppException("Không tải được danh mục địa điểm từ Giao Hàng Nhanh: " + e.getMessage(),
                    HttpStatus.BAD_GATEWAY);
        }
    }

    /** Địa chỉ mới: { _id, name, extension_names, status }. Chỉ lấy đơn vị đang hoạt động (status = 1). */
    private LocationOption mapNew(Map<String, Object> m) {
        Object status = m.get("status");
        if (status instanceof Number n && n.intValue() != 1) {
            return null;
        }
        Object id = m.get("_id");
        Object name = m.get("name");
        if (id == null || name == null) {
            return null;
        }
        return new LocationOption(id.toString(), name.toString(), aliases(m.get("extension_names")));
    }

    /** Địa chỉ cũ: Tỉnh {ProvinceID, ProvinceName}, Quận {DistrictID, DistrictName}, Phường {WardCode, WardName}. */
    private LocationOption mapOld(Map<String, Object> m, Kind kind) {
        Object id;
        Object name;
        switch (kind) {
            case PROVINCE -> {
                id = m.get("ProvinceID");
                name = m.get("ProvinceName");
            }
            case DISTRICT -> {
                id = m.get("DistrictID");
                name = m.get("DistrictName");
            }
            default -> {
                id = m.get("WardCode");
                name = m.get("WardName");
            }
        }
        if (id == null || name == null) {
            return null;
        }
        return new LocationOption(id.toString(), name.toString(), aliases(m.get("NameExtension")));
    }

    private List<String> aliases(Object value) {
        List<String> out = new ArrayList<>();
        if (value instanceof List<?> list) {
            for (Object o : list) {
                if (o != null && !o.toString().isBlank()) {
                    out.add(o.toString());
                }
            }
        }
        return out;
    }
}
