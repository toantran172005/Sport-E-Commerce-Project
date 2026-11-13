# Delta Sport - E-Commerce Web Platform (Frontend)

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
*Thực thi 26 kiểm thử tự động về quy tắc giảm giá, kiểm duyệt đánh giá, quản lý địa chỉ mặc định và định dạng tiền tệ.*

### 5. Kiểm tra mã nguồn (ESLint)
```bash
npm run lint
```

### 6. Đóng gói bản Production (Build)
```bash
npm run build
```

---

## 📂 Cấu Trúc Thư Mục

```text
frontend/
├── .agent/              # Báo cáo tiến độ và trạng thái kiểm thử của APEX
├── src/
│   ├── api/             # Cấu hình Axios Client & Interceptors
│   ├── components/      # UI Components dùng chung & Layout
│   │   ├── common/      # Modals, Pagination, ProductCard, ErrorBoundary...
│   │   └── layout/      # Header, Footer, Dropdowns, Mega-Menu...
│   ├── context/         # Modular State Contexts (Auth, Cart, Catalog, Order...)
│   ├── layouts/         # ClientLayout, AdminLayout, AccountLayout
│   ├── mocks/           # Dữ liệu tĩnh chân thực bám sát Entity Backend
│   ├── pages/           # Storefront & Admin CMS Views
│   │   ├── admin/       # Dashboard, Products, Orders, Coupons, Reviews, Settings
│   │   ├── auth/        # Login, Register, Forgot Password, OTP
│   │   └── client/      # Home, Catalog, ProductDetail, Cart, Checkout...
│   ├── routes/          # Hệ thống điều hướng AppRoutes & Route Guards
│   ├── services/        # Service gọi API Backend kèm Mock Fallback
│   └── utils/           # Helper định dạng formatters & tính giá pricing
└── tests/               # Test suites chạy bằng Node 22 Test Runner
```

---

## 🔒 Tài Khoản Thử Nghiệm

- **Admin CMS**: Đăng nhập với tài khoản có quyền `ROLE_ADMIN` để truy cập `/admin`.
- **Khách hàng**: Đăng nhập với tài khoản `ROLE_CUSTOMER` để trải nghiệm giỏ hàng, đặt hàng và quản lý tài khoản cá nhân.
