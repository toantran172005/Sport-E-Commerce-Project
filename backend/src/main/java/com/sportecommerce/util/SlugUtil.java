package com.sportecommerce.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

public class SlugUtil {

    private static final Pattern NON_LATIN = Pattern.compile("[^a-z0-9\\s-]");
    private static final Pattern MULTIPLE_HYPHENS = Pattern.compile("-+");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");

    private SlugUtil() {
    }

    // Chuyển tên sản phẩm thành slug URL-safe để lưu vào db
    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("Không thể tạo slug từ chuỗi rỗng");
        }

        // Xử lý riêng ký tự đ hoặc Đ vì Unicode NFD không tách được ký tự này thành base + dấu
        String noDConsonant = input.replace('đ', 'd').replace('Đ', 'D');

        String normalized = Normalizer.normalize(noDConsonant, Normalizer.Form.NFD);
        String noAccents = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        String lower = noAccents.toLowerCase();
        String cleaned = NON_LATIN.matcher(lower).replaceAll("");
        String hyphenated = WHITESPACE.matcher(cleaned.trim()).replaceAll("-");

        return MULTIPLE_HYPHENS.matcher(hyphenated).replaceAll("-");
    }
}
