# Sân Nhà Sport - E-Commerce Web Platform (Frontend)

Hệ thống thương mại điện tử chuyên đồ thể thao cao cấp (Cầu lông, Bóng đá, Chạy bộ, Tennis, Gym) với giao diện người dùng hiện đại và hệ thống Quản trị CMS phân quyền toàn diện.

---

## 🛠️ Công Nghệ & Kiến Trúc

- **Frontend Core**: React 19, Vite 8, React Router 7.
- **Styling**: Tailwind CSS v4, Lucide React icons, Hỗ trợ giao diện Sáng / Tối (Light / Dark mode).
- **Kiến trúc State Management**: Mô hình phân mảnh Modular Contexts (`src/context/`) kết hợp qua Facade `StoreContext`.
- **API & Mock Layer**: `src/api/axiosClient.js` và `src/services/` với cơ chế Mock Fallback thông minh, cho phép phát triển độc lập hoặc kết nối trực tiếp Microservices Spring Boot.
- **Testing**: Node 22 Native Test Runner (`node --test`) kiểm thử tự động toàn diện.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### 1. Yêu cầu môi trường
- Node.js >= 20.x (Khuyến nghị Node 22.x)
- Trình quản lý gói: `npm`

### 2. Cài đặt thư viện
```bash
npm install
```

### 3. Chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```
Truy cập: `http://localhost:5173`

### 4. Chạy kiểm thử tự động (Unit & Integration Tests)
```bash
npm test
```
*Thực thi 23+ kiểm thử tự động về quy tắc số thứ tự STT liên tục, ma trận phân quyền RBAC, TTL Cache LRU, Shipping cache key và chuẩn hóa dữ liệu vận chuyển.*

### 5. Kiểm tra mã nguồn (ESLint)
```bash
npm run lint
```

### 6. Đóng gói bản Production (Build)
```bash
npm run build
```

---

## 💬 Tích Hợp Chatbot Hỗ Trợ Khách Hàng

Giao diện Storefront tích hợp nút nổi (floating launcher) góc phải dưới màn hình và khung panel trò chuyện:

1. **Cấu hình qua Biến môi trường (`.env`)**:
   - Khai báo `VITE_CHATBOT_URL`:
     ```env
     VITE_CHATBOT_URL=https://your-chatbot-service.com/widget
     ```
   - Nếu `VITE_CHATBOT_URL` được định nghĩa, panel sẽ nhúng iframe an toàn (`sandbox="allow-scripts allow-same-origin allow-forms allow-popups"`).
   - Nếu để trống, panel tự động kích hoạt chế độ DEV mock assistant với các kịch bản câu hỏi thường gặp (tra cứu đơn hàng, chính sách freeship, đổi trả).

2. **Tùy biến qua `renderPanel` slot**:
   - `ChatbotPanel` hỗ trợ prop `renderPanel({ close })` cho phép mount bất kỳ custom component/widget nào từ bên ngoài mà không cần sửa core layout.

3. **Giao tiếp liên tiến trình (Custom Events & postMessage)**:
   - Mở/đóng trợ lý:
     ```javascript
     window.dispatchEvent(new CustomEvent('sport:chatbot:open'));
     window.dispatchEvent(new CustomEvent('sport:chatbot:close'));
     ```
   - Cập nhật số thông báo chưa đọc từ nguồn tin cậy (origin-checked):
     ```javascript
     window.postMessage({ type: 'CHATBOT_UNREAD_COUNT', count: 3 }, window.location.origin);
     ```

---

## 🛡️ Phân Quyền Vai Trò (RBAC) & Điều Phối Tuyến Đường

Hệ thống tuân thủ nghiêm ngặt 3 vai trò backend chuẩn (`CUSTOMER`, `STAFF`, `ADMIN`):
- **CUSTOMER**: Đặt hàng, quản lý đơn, sổ địa chỉ cá nhân, đánh giá sản phẩm. Không có quyền vào bất kỳ trang quản trị nào (truy cập `/admin` sẽ bị chuyển về `/` kèm thông báo lỗi).
- **STAFF (Nhân viên)**: Truy cập `/admin/products`, `/admin/orders`, `/admin/reviews`, `/admin/settings`. Mặc định điều hướng về `/admin/orders`. Bị chặn khỏi `/admin` (Dashboard), `/admin/coupons`, `/admin/staff`.
- **ADMIN (Quản trị viên)**: Toàn quyền truy cập mọi tính năng CMS bao gồm Dashboard tổng quan và trang Quản Lý Nhân Viên (`/admin/staff`).

---

## 🚚 Bộ Đệm Báo Giá Vận Chuyển (Shipping Cache)

- Sử dụng cấu trúc `createTtlCache` với cơ chế LRU Eviction (tối đa 50 mục).
- TTL 10 phút đối với kết quả tính toán API từ GHN / GHTK, TTL 30 giây cho kết quả fallback và TTL 1 giờ cho danh sách đơn vị vận chuyển.
- Key bộ đệm được tạo theo định dạng chuẩn: `${providerCode}|${addressId ?? ''}|${normalizeCity(city)}|${getSubtotalBucket(subTotal)}`.
- Tự động xóa sạch bộ đệm (invalidation) khi người dùng thêm, sửa, xóa hoặc đổi địa chỉ giao hàng mặc định, cũng như khi đăng xuất tài khoản.

---

## 🔒 Tài Khoản Thử Nghiệm

- **Admin CMS**: `admin@sannha.vn` / `admin123` (Toàn quyền).
- **Staff (Nhân viên)**: `staff@sannha.vn` / `staff123` (Quản lý đơn và sản phẩm).
- **Khách hàng (Customer)**: `toan.tran@gmail.com` / `123456` (Mua sắm storefront).
