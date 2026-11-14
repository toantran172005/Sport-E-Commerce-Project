package com.sportecommerce.util;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.ImageOutputStream;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;
import java.util.Locale;
import java.util.Set;

/**
 * Chuẩn hóa ảnh đại diện do người dùng tải lên (chỉ dùng JDK, không phụ thuộc Spring):
 * <ul>
 *   <li>Kiểm tra bằng NỘI DUNG file (không tin đuôi file / Content-Type do client gửi): chỉ nhận JPEG, PNG.</li>
 *   <li>Chặn ảnh quá nhỏ hoặc quá nhiều điểm ảnh (tránh "decompression bomb" làm tràn bộ nhớ).</li>
 *   <li>Cắt vuông ở giữa, thu nhỏ tối đa {@value #OUTPUT_SIZE}px, ghi lại thành JPEG mới.
 *       Việc ghi lại loại bỏ toàn bộ metadata (EXIF, GPS, ...) của ảnh gốc.</li>
 * </ul>
 * Lỗi dữ liệu đầu vào được ném dưới dạng {@link IllegalArgumentException} với thông báo tiếng Việt
 * để tầng service đổi thành phản hồi 400.
 */
public final class AvatarImageProcessor {

    /** Dung lượng tối đa của ảnh gửi lên (byte). */
    public static final long MAX_INPUT_BYTES = 2L * 1024 * 1024;
    /** Cạnh của ảnh vuông xuất ra (px). */
    public static final int OUTPUT_SIZE = 512;
    /** Cạnh ngắn nhất cho phép (px). */
    public static final int MIN_SIDE = 64;

    private static final long MAX_PIXELS = 25_000_000L;
    private static final float JPEG_QUALITY = 0.88f;
    private static final Set<String> ALLOWED_FORMATS = Set.of("jpeg", "png");

    private AvatarImageProcessor() {
    }

    /**
     * @return các byte của ảnh JPEG vuông đã chuẩn hóa
     * @throws IllegalArgumentException nếu ảnh không hợp lệ
     */
    public static byte[] toSquareJpeg(byte[] data) {
        if (data == null || data.length == 0) {
            throw new IllegalArgumentException("Vui lòng chọn ảnh đại diện");
        }
        if (data.length > MAX_INPUT_BYTES) {
            throw new IllegalArgumentException("Ảnh đại diện tối đa 2 MB");
        }

        try (ImageInputStream in = ImageIO.createImageInputStream(new ByteArrayInputStream(data))) {
            if (in == null) {
                throw new IllegalArgumentException("Tệp tải lên không phải là ảnh hợp lệ");
            }
            Iterator<ImageReader> readers = ImageIO.getImageReaders(in);
            if (!readers.hasNext()) {
                throw new IllegalArgumentException("Tệp tải lên không phải là ảnh hợp lệ (chỉ nhận JPG hoặc PNG)");
            }

            ImageReader reader = readers.next();
            try {
                reader.setInput(in, true, true);

                String format = reader.getFormatName().toLowerCase(Locale.ROOT);
                if (!ALLOWED_FORMATS.contains(format)) {
                    throw new IllegalArgumentException("Ảnh đại diện chỉ hỗ trợ định dạng JPG hoặc PNG");
                }

                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                if (width < 1 || height < 1 || (long) width * height > MAX_PIXELS) {
                    throw new IllegalArgumentException("Kích thước ảnh quá lớn");
                }
                if (Math.min(width, height) < MIN_SIDE) {
                    throw new IllegalArgumentException("Ảnh quá nhỏ, cần tối thiểu " + MIN_SIDE + "x" + MIN_SIDE + " px");
                }

                BufferedImage source = reader.read(0);
                if (source == null) {
                    throw new IllegalArgumentException("Không đọc được ảnh");
                }
                return encodeSquareJpeg(source);
            } finally {
                reader.dispose();
            }
        } catch (IOException | RuntimeException e) {
            if (e instanceof IllegalArgumentException iae) {
                throw iae;
            }
            // Ví dụ: JPEG hệ màu CMYK, file bị cắt cụt/hỏng
            throw new IllegalArgumentException("Không đọc được ảnh, vui lòng chọn ảnh JPG hoặc PNG khác");
        }
    }

    private static byte[] encodeSquareJpeg(BufferedImage source) throws IOException {
        int width = source.getWidth();
        int height = source.getHeight();
        int side = Math.min(width, height);
        int x = (width - side) / 2;
        int y = (height - side) / 2;
        int target = Math.min(side, OUTPUT_SIZE);

        BufferedImage output = new BufferedImage(target, target, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = output.createGraphics();
        try {
            // Nền trắng cho PNG trong suốt (JPEG không có kênh alpha)
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, target, target);
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g.drawImage(source, 0, 0, target, target, x, y, x + side, y + side, null);
        } finally {
            g.dispose();
        }

        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
        try {
            ImageWriteParam param = writer.getDefaultWriteParam();
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(JPEG_QUALITY);

            ByteArrayOutputStream out = new ByteArrayOutputStream(64 * 1024);
            try (ImageOutputStream ios = ImageIO.createImageOutputStream(out)) {
                writer.setOutput(ios);
                writer.write(null, new IIOImage(output, null, null), param);
            }
            return out.toByteArray();
        } finally {
            writer.dispose();
        }
    }
}
