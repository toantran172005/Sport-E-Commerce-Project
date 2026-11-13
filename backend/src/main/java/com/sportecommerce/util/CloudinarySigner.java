package com.sportecommerce.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.TreeMap;

/**
 * Tạo chữ ký cho các lời gọi API có xác thực của Cloudinary (upload/destroy).
 * Quy tắc: bỏ các tham số file, cloud_name, resource_type, api_key; sắp xếp tên tham số theo thứ tự
 * chữ cái; nối dạng "ten=giatri" bằng dấu &; thêm API secret vào cuối (không có dấu phân cách);
 * băm SHA-1 và đổi sang chuỗi hex.
 */
public final class CloudinarySigner {

    private CloudinarySigner() {
    }

    public static String sign(Map<String, String> params, String apiSecret) {
        Map<String, String> sorted = new TreeMap<>(params);
        sorted.remove("file");
        sorted.remove("cloud_name");
        sorted.remove("resource_type");
        sorted.remove("api_key");

        StringBuilder toSign = new StringBuilder();
        for (Map.Entry<String, String> e : sorted.entrySet()) {
            if (e.getValue() == null || e.getValue().isEmpty()) {
                continue;
            }
            if (toSign.length() > 0) {
                toSign.append('&');
            }
            toSign.append(e.getKey()).append('=').append(e.getValue());
        }
        toSign.append(apiSecret);

        try {
            MessageDigest sha1 = MessageDigest.getInstance("SHA-1");
            byte[] digest = sha1.digest(toSign.toString().getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte b : digest) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("JVM không hỗ trợ SHA-1", e);
        }
    }
}
