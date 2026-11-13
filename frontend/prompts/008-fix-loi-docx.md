# Sửa Các Lỗi Theo Tài Liệu `fix lỗi.docx`

## 1. Bối cảnh & Yêu cầu nghiệp vụ
Tài liệu `fix lỗi.docx` yêu cầu thực hiện 10 hạng mục hoàn thiện UX/UI và tính năng cho dự án:

1. **Chỉnh sửa phần Cart**: Tinh chỉnh giỏ hàng gọn gàng, liền mạch.
2. **Chatbot đổi thành Logo & có thể di chuyển (Draggable)**: Đổi icon launcher thành logo nhận diện, hỗ trợ kéo thả (drag & drop) nổi trên toàn màn hình và phân biệt click với drag.
3. **Xóa chọn Voucher ở giỏ hàng**: Bỏ dropdown chọn mã giảm giá ở giỏ hàng (`CartPage` / `CartSummary`), voucher sẽ được chọn tập trung tại bước `CheckoutPage`.
4. **Điều chỉnh giao diện trang quản lý nhân viên**: Hoàn thiện UI `AdminStaffPage` đẹp mắt, rõ ràng.
5. **Popup xác nhận khi khóa tài khoản nhân viên**: Không dùng `window.confirm` mặc định của browser; hiển thị modal popup xác nhận chuyên nghiệp.
6. **Hoàn thiện form Thêm / Sửa nhân viên**: Đảm bảo `AdminStaffModal` kết nối đúng `openModal`, hoạt động đầy đủ cả tạo mới và chỉnh sửa.
7. **Thống nhất thanh Navbar nằm ngang bên trên cho toàn bộ giao diện**: Đưa `AdminLayout` từ sidebar bên trái sang thanh Navbar nằm ngang ở phía trên (Top Horizontal Navbar), đồng bộ cấu trúc với Storefront.
8. **Trang đánh giá khách hàng**: Dropdown lọc số sao đổi nhãn mặc định thành `"Tất cả"` (không ghi `1★ - 5★`).
9. **Cài đặt giao diện sáng / tối**: Chỉ giữ lại button/switch chuyển đổi Dark/Light mode, loại bỏ 2 khung preview bên dưới.
10. **Chuẩn hóa toàn bộ popup xác nhận (Confirm Popup)**: Thay thế toàn bộ `window.confirm` trên toàn dự án bằng component popup xác nhận `ConfirmModal`.

## 2. Danh sách file tác động
- `src/components/common/ConfirmModal.jsx` (Mới)
- `src/context/UIContext.jsx` & `src/context/StoreContext.jsx`
- `src/components/chatbot/ChatbotLauncher.jsx`
- `src/components/cart/CartSummary.jsx` & `src/pages/client/CartPage.jsx`
- `src/components/common/AdminStaffModal.jsx` & `src/pages/admin/AdminStaffPage.jsx`
- `src/layouts/AdminLayout.jsx`
- `src/pages/admin/AdminReviewsPage.jsx`
- `src/pages/admin/AdminSettingsPage.jsx`
- `src/pages/admin/AdminCouponsPage.jsx`
- `src/pages/admin/AdminProductsPage.jsx`
- `src/App.jsx`
