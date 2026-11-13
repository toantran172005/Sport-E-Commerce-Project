import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, Navigate, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useUI } from '../context';
import { useRequireLogin } from '../hooks/useRequireLogin.js';

const ClientLayout = lazy(() => import('../layouts/ClientLayout'));
const AccountLayout = lazy(() => import('../layouts/AccountLayout'));

const HomePage = lazy(() => import('../pages/client/HomePage'));
const CatalogPage = lazy(() => import('../pages/client/CatalogPage'));
const ProductDetailPage = lazy(() => import('../pages/client/ProductDetailPage'));
const CartPage = lazy(() => import('../pages/client/CartPage'));
const CheckoutPage = lazy(() => import('../pages/client/CheckoutPage'));
const PaymentResultPage = lazy(() => import('../pages/client/PaymentResultPage'));
const WishlistPage = lazy(() => import('../pages/client/WishlistPage'));

const ProfilePage = lazy(() => import('../pages/client/account/ProfilePage'));
const AddressesPage = lazy(() => import('../pages/client/account/AddressesPage'));
const ChangePasswordPage = lazy(() => import('../pages/client/account/ChangePasswordPage'));
const OrderListPage = lazy(() => import('../pages/client/OrderListPage'));
const OrderDetailPage = lazy(() => import('../pages/client/OrderDetailPage'));

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const VerifyOtpPage = lazy(() => import('../pages/auth/VerifyOtpPage'));
const ForceChangePasswordPage = lazy(() => import('../pages/auth/ForceChangePasswordPage'));

const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('../pages/admin/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('../pages/admin/AdminOrdersPage'));
const AdminCouponsPage = lazy(() => import('../pages/admin/AdminCouponsPage'));
const AdminReviewsPage = lazy(() => import('../pages/admin/AdminReviewsPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));
const AdminStaffPage = lazy(() => import('../pages/admin/AdminStaffPage'));

const NotFoundPage = lazy(() => import('../pages/common/NotFoundPage'));

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <span className="text-[12.5px] font-bold text-ink-muted">Đang tải dữ liệu...</span>
      </div>
    </div>
  );
}

function LegacyOrderDetailRedirect() {
  const { id } = useParams();
  return <Navigate to={`/account/orders/${id}`} replace />;
}

// Tài khoản do Admin tạo (mật khẩu mặc định) bị khóa ở màn hình đổi mật khẩu cho tới khi đổi xong.
function PasswordChangeGate({ children }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  if (user?.mustChangePassword && pathname !== '/force-change-password') {
    return <Navigate to="/force-change-password" replace />;
  }
  return children;
}

function AdminRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  const { showToast } = useUI();
  if (!user) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }
  if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
    showToast('Tài khoản khách hàng không có quyền truy cập trang quản trị!', 'error');
    return <Navigate to="/" replace />;
  }
  if (adminOnly && user.role !== 'ADMIN') {
    showToast('Chỉ quản trị viên (ADMIN) mới có quyền truy cập trang này!', 'error');
    return <Navigate to="/admin" replace />;
  }
  return children;
}

/**
 * Khách vãng lai vào trang cần đăng nhập: hỏi có muốn đăng nhập không.
 * Đồng ý → sang /login (đăng nhập xong quay lại đúng trang này). Không đồng ý → quay lại trang trước đó
 * (hoặc về trang chủ nếu mở thẳng bằng đường dẫn), không ép chuyển sang trang đăng nhập.
 */
function LoginGate({ message }) {
  const requireLogin = useRequireLogin();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  useEffect(() => {
    requireLogin(message, {
      onCancel: () => {
        if (window.history.state?.idx > 0) navigate(-1);
        else navigate('/', { replace: true });
      },
    });
    // chỉ mở lại khi đổi trang đích
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  return null;
}

function CustomerRoute({ children, redirect = '/login?redirect=/account/profile' }) {
  const { user } = useAuth();
  if (!user) {
    let message = 'Vui lòng đăng nhập để xem trang này';
    if (redirect.includes('checkout')) message = 'Vui lòng đăng nhập để tiến hành đặt hàng';
    else if (redirect.includes('wishlist')) message = 'Vui lòng đăng nhập để xem danh sách yêu thích';
    return <LoginGate message={message} />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <PasswordChangeGate>
      <Routes>
        {/* Client Storefront Layout Wrapper */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<CatalogPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <CustomerRoute redirect="/login?redirect=/checkout">
                <CheckoutPage />
              </CustomerRoute>
            }
          />
          <Route path="/payment-result" element={<PaymentResultPage />} />
          <Route
            path="/wishlist"
            element={
              <CustomerRoute redirect="/login?redirect=/wishlist">
                <WishlistPage />
              </CustomerRoute>
            }
          />

          {/* Account Sub-system (Protected for Logged-in Customer/Admin) */}
          <Route
            path="/account"
            element={
              <CustomerRoute>
                <AccountLayout />
              </CustomerRoute>
            }
          >
            <Route index element={<Navigate to="/account/profile" replace />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="addresses" element={<AddressesPage />} />
            <Route path="vouchers" element={<Navigate to="/account/profile" replace />} />
            <Route path="password" element={<ChangePasswordPage />} />
            <Route path="orders" element={<OrderListPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
          </Route>

          {/* Legacy Order URL Redirects */}
          <Route path="/orders" element={<Navigate to="/account/orders" replace />} />
          <Route path="/orders/:id" element={<LegacyOrderDetailRedirect />} />

          {/* 404 Not Found Fallback within Client Shell */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Auth Routes (Standalone) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/force-change-password" element={<ForceChangePasswordPage />} />

        {/* Admin CMS Routes (Strictly Protected for Admin/Staff only) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProductsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrdersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/coupons"
          element={
            <AdminRoute>
              <AdminCouponsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <AdminRoute>
              <AdminReviewsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <AdminRoute adminOnly>
              <AdminStaffPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <AdminSettingsPage />
            </AdminRoute>
          }
        />
      </Routes>
      </PasswordChangeGate>
    </Suspense>
  );
}
