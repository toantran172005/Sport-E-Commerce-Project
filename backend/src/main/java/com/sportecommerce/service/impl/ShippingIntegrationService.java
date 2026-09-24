package com.sportecommerce.service.impl;

import com.sportecommerce.entity.Order;
import com.sportecommerce.entity.OrderItem;
import com.sportecommerce.entity.Product;
import com.sportecommerce.entity.ProductAttribute;
import com.sportecommerce.entity.UserAddress;
import com.sportecommerce.enums.PaymentMethod;
import com.sportecommerce.enums.PaymentStatus;
import com.sportecommerce.exception.AppException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.text.Normalizer;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class ShippingIntegrationService {

    private final RestTemplate restTemplate = new RestTemplate();

    private final List<Map<String, Object>> cachedProvinces = new CopyOnWriteArrayList<>();
    private final Map<Integer, List<Map<String, Object>>> cachedDistricts = new ConcurrentHashMap<>();
    private final Map<Integer, List<Map<String, Object>>> cachedWards = new ConcurrentHashMap<>();

    // GHN Config
    @Value("${shipping.ghn.base-url}")
    private String ghnBaseUrl;

    @Value("${shipping.ghn.token}")
    private String ghnToken;

    @Value("${shipping.ghn.shop-id}")
    private String ghnShopId;

    @Value("${shipping.ghn.from-district-id}")
    private Integer ghnFromDistrictId;

    // GHTK Config
    @Value("${shipping.ghtk.base-url}")
    private String ghtkBaseUrl;

    @Value("${shipping.ghtk.token}")
    private String ghtkToken;

    @Value("${shipping.ghtk.pick-province}")
    private String ghtkPickProvince;

    @Value("${shipping.ghtk.pick-district}")
    private String ghtkPickDistrict;

    @Value("${shipping.ghtk.pick-ward:Phường 1}")
    private String ghtkPickWard;

    @Value("${shipping.ghtk.pick-address:12 Nguyễn Văn Bảo}")
    private String ghtkPickAddress;

    @Value("${shipping.ghtk.pick-tel:0123456789}")
    private String ghtkPickTel;

    @Value("${shipping.cancel-order:true}")
    private boolean cancelOrder;

    public String createShippingOrder(Order order) {
        String providerCode = order.getShipment().getProvider().getCode().toUpperCase();

        return switch (providerCode) {
            case "GHN" -> createOrderGHN(order);
            case "GHTK" -> createOrderGHTK(order);
            case "VTP", "VTPOST" -> createOrderViettelPost(order);
            default -> throw new AppException("Hệ thống chưa hỗ trợ tích hợp API cho hãng: " + providerCode);
        };
    }

    public String createOrderGHN(Order order) {
        String url = ghnBaseUrl + "/v2/shipping-order/create";
        UserAddress address = order.getShippingAddress();

        int codAmount = 0;
        if (order.getPayment().getMethod().equals(PaymentMethod.COD)
                && !order.getPayment().getStatus().equals(PaymentStatus.PAID)) {
            codAmount = order.getTotalAmount().intValue();
        }

        int totalWeight = calculateTotalWeight(order);

        List<Map<String, Object>> items = new ArrayList<>();
        for (OrderItem orderItem : order.getOrderItems()) {
            Map<String, Object> item = new HashMap<>();
            item.put("name", orderItem.getProductNameSnapshot());
            item.put("quantity", orderItem.getQuantity());
            item.put("weight", orderItem.getVariant().getWeightGram() != null
                    ? orderItem.getVariant().getWeightGram() : 200);
            items.add(item);
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("payment_type_id", 2);
        body.put("service_type_id", 2);
        body.put("from_district_id", ghnFromDistrictId);
        body.put("to_name", address.getRecipientName());
        body.put("to_phone", address.getPhoneNumber());
        body.put("to_address", address.getAddressLine() + 
        ", " + address.getWard() + 
        ", " + address.getDistrict() + 
        ", " + address.getCity());

        GhnLocation ghnLocation = resolveGhnLocation(address);
        body.put("to_ward_code", ghnLocation.wardCode());     
        body.put("to_district_id", ghnLocation.districtId());
        // Tài khoản GHN thử nghiệm giới hạn COD tối đa (cod_amount) 300.000 VNĐ 
        // và khai giá tối đa (insurance_value) 500.000 VNĐ.
        // Tự động khống chế trần để luôn tạo vận đơn và lấy tracking_number thành công,
        // không ảnh hưởng đến số tiền thực tế của đơn hàng trong CSDL.
        body.put("cod_amount", Math.min(codAmount, 300000));
        body.put("weight", totalWeight);

        int[] dimensions = extractDimensions(order);
        body.put("length", dimensions[0]);
        body.put("width", dimensions[1]);
        body.put("height", dimensions[2]);
        body.put("insurance_value", Math.min(order.getSubTotal().intValue(), 500000));
        body.put("required_note", "CHOTHUHANG");
        body.put("items", items);
        body.put("note", order.getNote() != null ? order.getNote() : "");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Token", ghnToken);
        headers.set("ShopId", ghnShopId);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
                if (data != null && data.get("order_code") != null) {
                    String orderCode = data.get("order_code").toString();

                    if (cancelOrder) {
                        cancelOrderGHN(orderCode);
                    }

                    return orderCode;
                }
            }

            throw new AppException("Tạo đơn GHN thất bại! Phản hồi: " + response.getBody());

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException("Lỗi kết nối tới hệ thống Giao Hàng Nhanh: " + e.getMessage());
        }
    }

    public boolean cancelOrderGHN(String orderCode) {
        if (orderCode == null || orderCode.isBlank()) {
            return false;
        }
        String url = ghnBaseUrl + "/v2/switch-status/cancel";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Token", ghnToken);
        headers.set("ShopId", ghnShopId);

        Map<String, Object> body = Map.of("order_codes", List.of(orderCode));
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return Integer.valueOf(200).equals(response.getBody().get("code"));
            }
        } catch (Exception ignored) {
        }
        return false;
    }

    public String createOrderGHTK(Order order) {
        String url = ghtkBaseUrl + "/services/shipment/order/?ver=1.5";
        UserAddress address = order.getShippingAddress();

        int pickMoney = 0;
        if (order.getPayment().getMethod().equals(PaymentMethod.COD)
                && !order.getPayment().getStatus().equals(PaymentStatus.PAID)) {
            pickMoney = order.getTotalAmount().intValue();
        }

        List<Map<String, Object>> products = new ArrayList<>();
        for (OrderItem orderItem : order.getOrderItems()) {
            Map<String, Object> product = new HashMap<>();
            product.put("name", orderItem.getProductNameSnapshot());
            product.put("weight", orderItem.getVariant().getWeightGram() != null
                    ? orderItem.getVariant().getWeightGram() : 200);
            product.put("quantity", orderItem.getQuantity());
            products.add(product);
        }

        Map<String, Object> orderData = new LinkedHashMap<>();
        orderData.put("id", order.getOrderCode());
        orderData.put("pick_name", "Sport E-Commerce");
        orderData.put("pick_address", "12 Nguyễn Văn Bảo");
        orderData.put("pick_province", "Hồ Chí Minh");
        orderData.put("pick_district", "Quận Gò Vấp");
        orderData.put("pick_ward", "Phường 1");
        orderData.put("pick_tel", ghtkPickTel != null && !ghtkPickTel.isBlank() ? ghtkPickTel : "0123456789");
        orderData.put("name", address.getRecipientName());
        orderData.put("address", address.getAddressLine());
        orderData.put("province", address.getCity());
        orderData.put("district", address.getDistrict());
        orderData.put("ward", address.getWard());
        orderData.put("hamlet", "Khác");
        orderData.put("tel", address.getPhoneNumber());
        orderData.put("pick_money", pickMoney);
        orderData.put("value", order.getSubTotal().intValue());
        orderData.put("note", order.getNote() != null ? order.getNote() : "");
        orderData.put("weight_option", "gram");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("products", products);
        body.put("order", orderData);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Token", ghtkToken);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Boolean success = (Boolean) response.getBody().get("success");
                if (Boolean.TRUE.equals(success)) {
                    Map<String, Object> orderResult = (Map<String, Object>) response.getBody().get("order");
                    if (orderResult != null && orderResult.get("label") != null) {
                        String label = orderResult.get("label").toString();

                        // Nếu bật chế độ test tự động hủy: gửi yêu cầu hủy ngay lập tức
                        // Giúp đơn vẫn xuất hiện trên web GHTK nhưng bưu tá không đến lấy thật
                        if (cancelOrder) {
                            cancelOrderGHTK(label);
                        }

                        return label;
                    }
                }
            }

            throw new AppException("Tạo đơn GHTK thất bại! Phản hồi: " + response.getBody());

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException("Lỗi kết nối tới hệ thống Giao Hàng Tiết Kiệm: " + e.getMessage());
        }
    }

    public boolean cancelOrderGHTK(String trackingNumber) {
        if (trackingNumber == null || trackingNumber.isBlank()) {
            return false;
        }
        String url = ghtkBaseUrl + "/services/shipment/cancel/" + trackingNumber;
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghtkToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Boolean success = (Boolean) response.getBody().get("success");
                return Boolean.TRUE.equals(success);
            }
        } catch (Exception ignored) {
        }
        return false;
    }

    public String createOrderViettelPost(Order order) {
        throw new AppException("Tích hợp Viettel Post đang trong quá trình phát triển. Vui lòng chọn GHN hoặc GHTK!");
    }

    public int calculateTotalWeight(Order order) {
        int totalWeight = 0;
        for (OrderItem item : order.getOrderItems()) {
            int weightPerItem = item.getVariant().getWeightGram() != null
                    ? item.getVariant().getWeightGram() : 200;
            totalWeight += weightPerItem * item.getQuantity();
        }

        return Math.max(totalWeight, 100);
    }

    public int[] extractDimensions(Order order) {
        int length = 30, width = 20, height = 15;

        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            Product product = order.getOrderItems().get(0).getVariant().getProduct();

            for (ProductAttribute attr : product.getProductAttributes()) {
                String name = attr.getAttributeName().toLowerCase().trim();
                try {
                    switch (name) {
                        case "chiều dài", "chieu dai", "length", "dài" ->
                                length = Integer.parseInt(attr.getAttributeValue().trim());
                        case "chiều rộng", "chieu rong", "width", "rộng" ->
                                width = Integer.parseInt(attr.getAttributeValue().trim());
                        case "chiều cao", "chieu cao", "height", "cao" ->
                                height = Integer.parseInt(attr.getAttributeValue().trim());
                    }
                } catch (NumberFormatException e) {
                    // Bỏ qua lỗi parse và dùng giá trị mặc định
                }
            }
        }

        return new int[]{length, width, height};
    }

    public record GhnLocation(Integer districtId, String wardCode) {}

    public GhnLocation resolveGhnLocation(UserAddress address) {
        if (address == null) {
            throw new AppException("Địa chỉ nhận hàng không tồn tại!");
        }

        // 1. Tìm Tỉnh/Thành phố nếu có
        Integer provinceId = null;
        if (address.getCity() != null && !address.getCity().isBlank()) {
            List<Map<String, Object>> provinces = fetchGhnProvinces();
            for (Map<String, Object> prov : provinces) {
                String provName = (String) prov.get("ProvinceName");
                Object ext = prov.get("NameExtension");
                if (matchLocation(address.getCity(), provName, ext)) {
                    Object pId = prov.get("ProvinceID");
                    if (pId instanceof Number num) {
                        provinceId = num.intValue();
                    }
                    break;
                }
            }
        }

        // 2. Tìm Quận/Huyện
        List<Map<String, Object>> districts = fetchGhnDistricts(provinceId);
        Map<String, Object> matchedDistrict = null;
        for (Map<String, Object> dist : districts) {
            String distName = (String) dist.get("DistrictName");
            Object ext = dist.get("NameExtension");
            if (matchLocation(address.getDistrict(), distName, ext)) {
                matchedDistrict = dist;
                break;
            }
        }

        if (matchedDistrict == null) {
            throw new AppException("Không tìm thấy Quận/Huyện '" + address.getDistrict() + 
                    "' phù hợp trên GHN. Vui lòng kiểm tra lại địa chỉ nhận hàng.");
        }

        Integer districtId = ((Number) matchedDistrict.get("DistrictID")).intValue();

        // 3. Tìm Phường/Xã
        List<Map<String, Object>> wards = fetchGhnWards(districtId);
        Map<String, Object> matchedWard = null;
        for (Map<String, Object> ward : wards) {
            String wardName = (String) ward.get("WardName");
            Object ext = ward.get("NameExtension");
            if (matchLocation(address.getWard(), wardName, ext)) {
                matchedWard = ward;
                break;
            }
        }

        if (matchedWard == null) {
            throw new AppException("Không tìm thấy Phường/Xã '" + address.getWard() + 
                    "' thuộc '" + address.getDistrict() + "' trên GHN. Vui lòng kiểm tra lại địa chỉ nhận hàng.");
        }

        String wardCode = matchedWard.get("WardCode").toString();

        return new GhnLocation(districtId, wardCode);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchGhnProvinces() {
        if (!cachedProvinces.isEmpty()) {
            return cachedProvinces;
        }

        String url = ghnBaseUrl + "/master-data/province";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");
                if (data != null) {
                    cachedProvinces.addAll(data);
                    return cachedProvinces;
                }
            }
        } catch (Exception e) {
            throw new AppException("Lỗi khi tải danh sách Tỉnh/Thành từ GHN: " + e.getMessage());
        }

        return Collections.emptyList();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchGhnDistricts(Integer provinceId) {
        int cacheKey = (provinceId != null) ? provinceId : -1;
        if (cachedDistricts.containsKey(cacheKey)) {
            return cachedDistricts.get(cacheKey);
        }

        String url = (provinceId != null)
                ? ghnBaseUrl + "/master-data/district?province_id=" + provinceId
                : ghnBaseUrl + "/master-data/district";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");
                if (data != null) {
                    cachedDistricts.put(cacheKey, data);
                    return data;
                }
            }
        } catch (Exception e) {
            throw new AppException("Lỗi khi tải danh sách Quận/Huyện từ GHN: " + e.getMessage());
        }

        return Collections.emptyList();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchGhnWards(Integer districtId) {
        if (districtId == null) {
            return Collections.emptyList();
        }

        if (cachedWards.containsKey(districtId)) {
            return cachedWards.get(districtId);
        }

        String url = ghnBaseUrl + "/master-data/ward?district_id=" + districtId;
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");
                if (data != null) {
                    cachedWards.put(districtId, data);
                    return data;
                }
            }
        } catch (Exception e) {
            throw new AppException("Lỗi khi tải danh sách Phường/Xã từ GHN: " + e.getMessage());
        }

        return Collections.emptyList();
    }

    private String normalizeLocationName(String text) {
        if (text == null) return "";
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);
        normalized = normalized.replaceAll("\\p{M}", "");
        normalized = normalized.toLowerCase();
        normalized = normalized.replace("đ", "d");
        normalized = normalized.replaceAll("\\b(thanh pho|tp\\.|tp|tinh|quan|q\\.|q|huyen|h\\.|thi xa|tx\\.|phuong|p\\.|p|xa|thi tran|tt\\.)\\b", "");
        normalized = normalized.replaceAll("[^a-z0-9]", "");
        return normalized.trim();
    }

    @SuppressWarnings("unchecked")
    private boolean matchLocation(String input, String name, Object extensionsObj) {
        if (input == null || input.isBlank()) return false;
        String rawInput = input.trim().toLowerCase();

        // 1. So sánh chính xác không phân biệt hoa thường
        if (name != null && name.trim().equalsIgnoreCase(rawInput)) return true;

        List<String> extensions = null;
        if (extensionsObj instanceof List<?>) {
            extensions = (List<String>) extensionsObj;
            for (String ext : extensions) {
                if (ext != null && ext.trim().equalsIgnoreCase(rawInput)) return true;
            }
        }

        // 2. So sánh sau khi đã chuẩn hóa (bỏ dấu, bỏ tiền tố hành chính)
        String normInput = normalizeLocationName(input);
        if (normInput.isEmpty()) return false;

        if (normalizeLocationName(name).equals(normInput)) return true;

        if (extensions != null) {
            for (String ext : extensions) {
                if (ext != null && normalizeLocationName(ext).equals(normInput)) return true;
            }
        }

        // 3. So sánh tương đối (contains) cho các tên không phải dạng số (để tránh 1 khớp với 17)
        if (!normInput.matches("\\d+")) {
            String normName = normalizeLocationName(name);
            if (normName.contains(normInput) || normInput.contains(normName)) return true;

            if (extensions != null) {
                for (String ext : extensions) {
                    if (ext != null) {
                        String normExt = normalizeLocationName(ext);
                        if (normExt.contains(normInput) || normInput.contains(normExt)) return true;
                    }
                }
            }
        }

        return false;
    }
}
