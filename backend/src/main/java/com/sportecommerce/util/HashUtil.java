package com.sportecommerce.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Tien ich hash mot chieu (SHA-256) dung de luu refresh token duoi dang
 * khong the doc nguoc trong database.
 */
public final class HashUtil {

    private HashUtil() {
    }

    public static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Thuat toan SHA-256 khong kha dung", e);
        }
    }
}
