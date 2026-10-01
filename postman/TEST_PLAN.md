# Lộ trình test module Auth / User Profile / Notification bằng Postman

Phạm vi: toàn bộ API do bạn phụ trách — Authentication (đăng ký/đăng nhập/OTP/token),
User Profile (cập nhật hồ sơ, đổi mật khẩu/email/SĐT), và Notification. Không bao gồm
Order/Payment/Catalog/Coupon (module của teammate) — các API đó chỉ xuất hiện ở mục
"Trigger thông báo" vì cần dùng để kích hoạt thông báo NEW_ORDER / ORDER_UPDATE.

## 1. Chuẩn bị

1. Chạy backend (`SportEcommerceApplication`), đảm bảo kết nối được tới Postgres (Neon)
   và Redis — OTP được lưu ở Redis nên nếu Redis chưa kết nối, mọi API liên quan OTP
   (register, verify-otp, resend-otp, forgot-password, reset-password, change-email,
   change-phone) sẽ lỗi 500.
2. Import 2 file đính kèm vào Postman:
   - `postman_environment.json` → Import → chọn **Environment** này ở góc trên bên phải
     Postman trước khi chạy bất kỳ request nào.
   - `postman_collection.json` → Import → vào tab **Collections**.
3. Server mặc định chạy ở `http://localhost:8080` (biến `baseUrl` trong environment) —
   sửa lại nếu bạn cấu hình `server.port` khác.

## 2. Mẹo lấy mã OTP nhanh khi test (không cần chờ email thật)

OTP được lưu trong Redis với key dạng `otp:<PURPOSE>:<email viết thường>`, ví dụ
`otp:REGISTER:customer1@test.com`. Nếu có Redis CLI hoặc RedisInsight (thấy bạn có cài
trong `~/.redis-insight`), kết nối vào Redis của project rồi:

```
GET otp:REGISTER:customer1@test.com
GET otp:RESET_PASSWORD:customer1@test.com
GET otp:CHANGE_EMAIL:customer1-new@test.com   # key theo email MỚI, không phải email cũ
GET otp:CHANGE_PHONE:customer1@test.com       # key theo email hiện tại (chưa có SMS gateway)
```

Lấy giá trị trả về, dán vào biến `otp` trong Postman Environment, rồi chạy request xác
thực tương ứng. Cách này nhanh hơn nhiều so với việc check hộp thư mỗi lần, đặc biệt khi
bạn đang test đi test lại case sai OTP / hết số lần thử.

Nếu không có Redis CLI tiện dụng, vẫn có thể check email thật (hiện `spring.mail.host`
đang trỏ `smtp.gmail.com` với tài khoản của bạn — email sẽ được gửi thật, không còn qua
Mailtrap sandbox nữa).

## 3. Chuẩn bị 1 tài khoản STAFF (để test thông báo "có đơn hàng mới")

Hiện **chưa có API nào để tạo tài khoản role=STAFF** (register luôn tạo role=CUSTOMER
mặc định). Để test `notifyStaffNewOrder`, bạn cần:

1. Đăng ký + xác thực OTP một tài khoản bình thường (dùng `staffEmail`/`staffPassword`
   trong environment).
2. Vào DB (Neon/pgAdmin) chạy:
   ```sql
   UPDATE users SET role = 'STAFF' WHERE email = 'staff1@test.com';
   ```
3. Dùng request **4.1 Staff Login** trong Postman để đăng nhập lại bằng tài khoản này
   (token cũ phát hành trước khi đổi role vẫn còn `role=CUSTOMER` trong payload JWT vì
   JWT là stateless — phải đăng nhập lại để lấy token mới có role đúng).

## 4. Lộ trình test theo thứ tự (folder "01 - Auth")

Chạy đúng thứ tự vì các bước sau phụ thuộc bước trước (OTP, token...).

| # | Request | Kỳ vọng happy-path | Case lỗi nên test thêm |
|---|---|---|---|
| 1.1 | Register | 200, tài khoản tạo ở trạng thái PENDING | Email trùng → 409; SĐT trùng → 409; email sai định dạng → 400 với field error; password không đủ mạnh (thiếu số/chữ, <8 ký tự) → 400 |
| 1.2 | Verify OTP (Register) | 200, trả `accessToken`/`refreshToken`, user chuyển ACTIVE | OTP sai → 400 "Mã OTP không chính xác"; nhập sai 6 lần liên tiếp → lần thứ 6 **luôn bị từ chối dù đúng hay sai** (xem lại phần đã thảo luận: đếm attempt trước, so sánh giá trị sau); verify lại khi đã ACTIVE rồi → nên báo lỗi "đã xác thực trước đó" |
| 1.3 | Resend OTP | 200 | Gọi 2 lần liên tiếp trong vòng 60s → lần 2 phải 429 (cooldown) |
| 1.4 | Login | 200, trả token | Sai mật khẩu → 401 "Email hoặc mật khẩu không đúng" (test luôn case email không tồn tại — phải trả **cùng message**, không được tiết lộ email có tồn tại hay không); tài khoản chưa verify (PENDING) → thông báo riêng yêu cầu xác thực OTP trước |
| 1.5 | Refresh Token | 200, token mới | Gọi lại với refresh token **cũ** (trước khi rotate) → phải 401 vì đã bị thu hồi (test reuse-detection) |
| 1.6 | Logout | 200 | Sau logout, dùng lại refresh token đó gọi 1.5 → phải 401 |
| 1.7 | Logout All | 200 (cần Bearer token hợp lệ) | Đăng nhập 2 nơi (2 request Login khác nhau để lấy 2 cặp token), logout-all ở 1 nơi, thử refresh token ở nơi còn lại → phải 401 |
| 1.8 | Forgot Password | 200, message chung chung | Test với email **không tồn tại** trong hệ thống → **phải trả về y hệt message** như khi email tồn tại (chống dò tài khoản) |
| 1.9 | Reset Password | 200 | OTP sai → 400; sau khi đổi xong, login lại bằng mật khẩu mới phải thành công, mật khẩu cũ phải thất bại |

## 5. Folder "02 - User Profile" (cần Bearer accessToken còn hiệu lực)

| # | Request | Kỳ vọng happy-path | Case lỗi nên test thêm |
|---|---|---|---|
| 2.1 | Get My Profile | 200, đúng thông tin user | Gọi khi không đính kèm Authorization → xem ghi chú ở mục 7 (sẽ trả 500 chứ không phải 401, do bug `/api/**` permitAll) |
| 2.2 | Update Profile | 200, các field cập nhật đúng | Chỉ gửi 1 field (ví dụ chỉ `fullName`) → các field khác (avatarUrl, gender, dateOfBirth) phải **giữ nguyên**, không bị null hóa |
| 2.3 | Change Password | 200 | Sai `oldPassword` → 400 "Mật khẩu hiện tại không đúng"; `newPassword` yếu → 400; sau khi đổi, login bằng mật khẩu mới OK, mật khẩu cũ fail |
| 2.4 | Request Change Email | 200, gửi OTP tới **email mới** | `newEmail` trùng với email hiện tại → 400; `newEmail` đã có tài khoản khác dùng → 409 |
| 2.5 | Confirm Change Email | 200, email đổi thành công | OTP sai → 400; dùng lại OTP cũ sau khi đã confirm 1 lần → phải báo hết hạn/không tồn tại |
| 2.6 | Request Change Phone | 200, OTP gửi qua **email hiện tại** (không phải SĐT mới, vì chưa có SMS) | SĐT mới trùng SĐT hiện tại → 400; SĐT đã có người dùng → 409 |
| 2.7 | Confirm Change Phone | 200, SĐT đổi thành công | OTP sai → 400 |

**Gợi ý bảo mật đáng cân nhắc** (đã trao đổi trước đó, chưa quyết định): 2.4 và 2.6 hiện
không bắt nhập lại mật khẩu hiện tại trước khi đổi email/SĐT — chỉ cần access token hợp
lệ. Nếu muốn, có thể bổ sung field `currentPassword` vào `ChangeEmailRequest`/
`ChangePhoneRequest` và verify trước khi gửi OTP.

## 6. Folder "03 - Notification"

Có 2 cách tạo dữ liệu để test, chọn 1 trong 2:

**Cách nhanh (khuyến nghị cho test riêng module Notification, không phụ thuộc Order):**
chèn thẳng 1 dòng vào bảng `notifications` qua SQL:
```sql
INSERT INTO notifications (user_id, type, title, content, is_read, created_at)
VALUES (<userId của bạn>, 'ORDER_UPDATE', 'Test thủ công', 'Nội dung test', false, now());
```
Lấy `<userId>` từ biến `userId` đã được Postman tự lưu sau khi Login (xem Console log của
request 1.4), hoặc query `SELECT id FROM users WHERE email = '...'`.

**Cách đầy đủ (end-to-end, phụ thuộc module Order của teammate):** dùng folder
"04 - Trigger thông báo" — đặt 1 đơn hàng thật qua `POST /api/order/place-order` (cần có
sẵn `shippingAddressId` hợp lệ và sản phẩm/variant còn hàng trong DB), việc này sẽ tự
động bắn `OrderPlacedEvent` → tạo thông báo `NEW_ORDER` cho mọi STAFF. Cách này đầy đủ
hơn nhưng phụ thuộc dữ liệu catalog/địa chỉ đã có sẵn nên để làm sau, khi cần test tích
hợp 2 module với nhau.

| # | Request | Kỳ vọng happy-path | Case lỗi nên test thêm |
|---|---|---|---|
| 3.1 | Get My Notifications | 200, danh sách phân trang, mới nhất trước | Thử `page`/`size` khác nhau |
| 3.2 | Unread Count | 200, số đúng bằng số thông báo `isRead=false` | So sánh số liệu trước/sau khi đánh dấu đọc |
| 3.3 | Mark One As Read | 200 | Sửa `notificationId` thành id của **user khác** (hoặc id không tồn tại) → phải 404, không được cho đánh dấu thông báo không thuộc về mình |
| 3.4 | Mark All As Read | 200 | Gọi `3.2 Unread Count` ngay sau → phải trả về `0` |

## 7. Lưu ý quan trọng khi test (không phải bug bạn cần tạo ra, mà là hành vi hiện tại của hệ thống)

- **`SecurityConfig` đang có `.requestMatchers("/api/**").permitAll()`** nằm sau dòng
  permitAll cho `/api/auth/**` → về mặt tầng Security, MỌI API hiện đều không bắt buộc
  phải có token. Hệ quả khi test: nếu bạn quên đính kèm `Authorization: Bearer ...` khi
  gọi một API cần đăng nhập (vd `/api/users/me`), bạn sẽ **không** nhận được lỗi 401 như
  mong đợi — mà nhận lỗi **500** (vì `@AuthenticationPrincipal UserPrincipal principal`
  bị null, gây NullPointerException). Đừng nhầm lẫn đây là lỗi logic của API; đây là hệ
  quả của lỗ hổng Security đã biết, chưa được sửa. Luôn nhớ đính kèm Bearer token khi
  test các API thuộc "02" và "03".
- **OTP tối đa 5 lần thử sai** (`app.otp.max-attempts=5`): lần thử thứ 6 luôn bị từ chối
  ngay cả khi nhập đúng, vì hệ thống tăng biến đếm TRƯỚC khi so sánh giá trị.
- **Cooldown gửi lại OTP: 60 giây** (`app.otp.resend-cooldown-seconds=60`).
- **Refresh token dùng 1 lần (rotation)**: mỗi lần gọi `/refresh-token` thành công, token
  cũ bị thu hồi ngay, token mới được cấp. Dùng lại token cũ sau đó sẽ luôn bị từ chối.
- Response `message` của `/refresh-token` ("Làm mới token thành công") **không nên được
  frontend hiển thị như một thông báo/toast** cho người dùng — đây là thao tác ngầm.

## 8. Bảng tổng hợp toàn bộ endpoint

| Method | Path | Cần Bearer token? | Request body chính |
|---|---|---|---|
| POST | /api/auth/register | Không | email, password, fullName, phoneNumber |
| POST | /api/auth/verify-otp | Không | email, otp, purpose |
| POST | /api/auth/resend-otp | Không | email, purpose |
| POST | /api/auth/login | Không | email, password |
| POST | /api/auth/refresh-token | Không | refreshToken |
| POST | /api/auth/logout | Không | refreshToken |
| POST | /api/auth/logout-all | **Có** | (rỗng) |
| POST | /api/auth/forgot-password | Không | email |
| POST | /api/auth/reset-password | Không | email, otp, newPassword |
| GET | /api/users/me | **Có** | - |
| PUT | /api/users/me | **Có** | fullName, avatarUrl, gender, dateOfBirth |
| POST | /api/users/me/change-password | **Có** | oldPassword, newPassword |
| POST | /api/users/me/change-email/request | **Có** | newEmail |
| POST | /api/users/me/change-email/confirm | **Có** | newEmail, otp |
| POST | /api/users/me/change-phone/request | **Có** | newPhoneNumber |
| POST | /api/users/me/change-phone/confirm | **Có** | newPhoneNumber, otp |
| GET | /api/notifications?page=&size= | **Có** | - |
| GET | /api/notifications/unread-count | **Có** | - |
| PATCH | /api/notifications/{id}/read | **Có** | - |
| PATCH | /api/notifications/read-all | **Có** | - |

("Cần Bearer token?" nói về mặt **thiết kế logic** — nhớ là do bug ở mục 7, tầng
Security hiện không ép buộc điều này, nhưng code bên trong vẫn cần `principal` hợp lệ
để chạy đúng.)
