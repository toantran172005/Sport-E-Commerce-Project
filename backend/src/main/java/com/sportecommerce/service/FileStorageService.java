package com.sportecommerce.service;

/**
 * Lưu trữ tệp ảnh trên dịch vụ bên ngoài (hiện dùng Cloudinary).
 * Dùng chung cho mọi module cần tải ảnh lên: avatar, ảnh sản phẩm, logo thương hiệu, ảnh đánh giá...
 * Các module chỉ lưu {@link StoredFile#url()} vào cột *_url trong DB.
 */
public interface FileStorageService {

    /**
     * Tải ảnh lên. Nếu đã có ảnh cùng {@code publicId} thì ghi đè (không để lại tệp cũ).
     *
     * @param data     nội dung ảnh (nên là ảnh đã được kiểm tra/chuẩn hóa)
     * @param publicId tên định danh trong thư mục của ứng dụng, ví dụ "avatars/user-12"
     */
    StoredFile uploadImage(byte[] data, String publicId);

    /**
     * Xóa ảnh theo {@code publicId}. Không ném lỗi nếu xóa thất bại hoặc ảnh không tồn tại.
     */
    void deleteImage(String publicId);

    /**
     * @param url      đường dẫn https công khai (có kèm phiên bản nên tự đổi khi ghi đè ảnh)
     * @param publicId định danh đầy đủ trên dịch vụ lưu trữ
     */
    record StoredFile(String url, String publicId) {
    }
}
