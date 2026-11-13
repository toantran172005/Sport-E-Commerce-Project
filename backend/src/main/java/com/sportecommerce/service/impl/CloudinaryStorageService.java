package com.sportecommerce.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.sportecommerce.exception.AppException;
import com.sportecommerce.service.FileStorageService;
import com.sportecommerce.util.CloudinarySigner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;
import java.util.TreeMap;

/**
 * Lưu ảnh lên Cloudinary bằng REST API có chữ ký (không cần thêm thư viện).
 * Khóa lấy từ biến môi trường CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET.
 * API secret chỉ nằm ở backend, không bao giờ gửi về frontend và không được ghi ra log.
 */
@Service
public class CloudinaryStorageService implements FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryStorageService.class);
    private static final String API_BASE = "https://api.cloudinary.com/v1_1/";

    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;
    private final String folder;
    private final RestTemplate restTemplate;

    public CloudinaryStorageService(
            @Value("${app.storage.cloudinary.cloud-name:}") String cloudName,
            @Value("${app.storage.cloudinary.api-key:}") String apiKey,
            @Value("${app.storage.cloudinary.api-secret:}") String apiSecret,
            @Value("${app.storage.cloudinary.folder:delta-sport}") String folder
    ) {
        this.cloudName = cloudName.trim();
        this.apiKey = apiKey.trim();
        this.apiSecret = apiSecret.trim();
        this.folder = folder.trim();

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);
        factory.setReadTimeout(20_000);
        this.restTemplate = new RestTemplate(factory);

        if (!isConfigured()) {
            log.warn("Chưa cấu hình Cloudinary (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET): "
                    + "chức năng tải ảnh lên sẽ báo lỗi cho tới khi cấu hình.");
        }
    }

    @Override
    public StoredFile uploadImage(byte[] data, String publicId) {
        assertConfigured();
        String fullPublicId = fullPublicId(publicId);

        // Các tham số cần ký (TreeMap: đã sắp xếp theo tên). Không gồm file và api_key.
        Map<String, String> params = new TreeMap<>();
        params.put("invalidate", "true");
        params.put("overwrite", "true");
        params.put("public_id", fullPublicId);
        params.put("timestamp", String.valueOf(Instant.now().getEpochSecond()));

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(data) {
            @Override
            public String getFilename() {
                return "image.jpg";
            }
        });
        for (Map.Entry<String, String> e : params.entrySet()) {
            body.add(e.getKey(), e.getValue());
        }
        body.add("api_key", apiKey);
        body.add("signature", CloudinarySigner.sign(params, apiSecret));

        JsonNode json = post("image/upload", body);
        String url = json.path("secure_url").asText("");
        if (url.isBlank()) {
            log.error("Cloudinary không trả về secure_url cho {}", fullPublicId);
            throw new AppException("Máy chủ lưu trữ không trả về đường dẫn ảnh", HttpStatus.BAD_GATEWAY);
        }
        return new StoredFile(url, json.path("public_id").asText(fullPublicId));
    }

    @Override
    public void deleteImage(String publicId) {
        if (!isConfigured()) {
            log.warn("Bỏ qua xóa ảnh '{}' vì chưa cấu hình Cloudinary", publicId);
            return;
        }
        String fullPublicId = fullPublicId(publicId);

        Map<String, String> params = new TreeMap<>();
        params.put("invalidate", "true");
        params.put("public_id", fullPublicId);
        params.put("timestamp", String.valueOf(Instant.now().getEpochSecond()));

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        for (Map.Entry<String, String> e : params.entrySet()) {
            body.add(e.getKey(), e.getValue());
        }
        body.add("api_key", apiKey);
        body.add("signature", CloudinarySigner.sign(params, apiSecret));

        try {
            post("image/destroy", body);
        } catch (AppException e) {
            // Xóa ảnh cũ thất bại không được làm hỏng thao tác của người dùng (ảnh mồ côi sẽ bị ghi đè lần sau)
            log.warn("Không xóa được ảnh '{}' trên Cloudinary: {}", fullPublicId, e.getMessage());
        }
    }

    private JsonNode post(String path, MultiValueMap<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        String url = API_BASE + cloudName + "/" + path;
        try {
            JsonNode response = restTemplate.postForObject(url, new HttpEntity<>(body, headers), JsonNode.class);
            return response != null ? response : JsonNodeFactory.instance.objectNode();
        } catch (HttpStatusCodeException e) {
            // Thân phản hồi của Cloudinary chỉ chứa thông báo lỗi (vd "Invalid Signature"), không chứa secret
            String reason = extractError(e.getResponseBodyAsString());
            int status = e.getStatusCode().value();
            log.error("Cloudinary {} trả về {}: {}", path, status, reason);
            if (status == 401 || status == 403 || status == 404) {
                // Lỗi cấu hình (sai cloud name / API key / API secret) - báo rõ để người triển khai sửa .env
                log.error("=> Kiểm tra lại CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET trong backend/.env "
                        + "(cloud name đang dùng: '{}', độ dài API key: {}, độ dài API secret: {})",
                        cloudName, apiKey.length(), apiSecret.length());
                throw new AppException(
                        "Cấu hình Cloudinary trên máy chủ không hợp lệ (" + reason + ")", HttpStatus.BAD_GATEWAY);
            }
            throw new AppException(
                    "Không thể lưu ảnh lên máy chủ lưu trữ: " + reason, HttpStatus.BAD_GATEWAY);
        } catch (RestClientException e) {
            log.warn("Không kết nối được Cloudinary ({}): {}", path, e.getMessage());
            throw new AppException("Không kết nối được máy chủ lưu trữ ảnh, vui lòng thử lại sau", HttpStatus.BAD_GATEWAY);
        }
    }

    /** Lấy câu thông báo trong JSON lỗi {"error":{"message":"..."}} của Cloudinary. */
    private String extractError(String body) {
        if (body == null || body.isBlank()) {
            return "không có nội dung phản hồi";
        }
        try {
            String msg = new com.fasterxml.jackson.databind.ObjectMapper()
                    .readTree(body).path("error").path("message").asText("");
            if (!msg.isBlank()) {
                return msg.length() > 200 ? msg.substring(0, 200) : msg;
            }
        } catch (Exception ignored) {
            // không phải JSON -> trả về đoạn đầu của nội dung
        }
        return body.length() > 200 ? body.substring(0, 200) : body;
    }

    private boolean isConfigured() {
        return !cloudName.isEmpty() && !apiKey.isEmpty() && !apiSecret.isEmpty();
    }

    private void assertConfigured() {
        if (!isConfigured()) {
            throw new AppException(
                    "Chức năng tải ảnh chưa được cấu hình trên máy chủ (thiếu thông tin Cloudinary)",
                    HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    private String fullPublicId(String publicId) {
        String id = publicId.startsWith("/") ? publicId.substring(1) : publicId;
        String base = folder.replaceAll("^/+|/+$", "");
        return base.isEmpty() ? id : base + "/" + id;
    }
}
