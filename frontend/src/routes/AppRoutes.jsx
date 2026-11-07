import { lazy, Suspense } from 'react';
import { Route, Routes, Navigate, useParams } from 'react-router-dom';
import { useAuth, useUI } from '../context';

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

const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('../pages/admin/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('../pages/admin/AdminOrdersPage'));
const AdminCouponsPage = lazy(() => import('../pages/admin/AdminCouponsPage'));
const AdminReviewsPage = lazy(() => import('../pages/admin/AdminReviewsPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));

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

function AdminRoute({ children }) {
  const { user } = useAuth();
  const { showToast } = useUI();
  if (!user) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }
  if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
    showToast('Tài khoản khách hàng không có quyền truy cập trang quản trị!');
    return <Navigate to="/" replace />;
  }
  return children;
}

function CustomerRoute({ children, redirect = '/login?redirect=/account/profile' }) {
  const { user } = useAuth();
  const { showToast } = useUI();
  if (!user) {
    if (redirect.includes('checkout')) {
      showToast('Vui lòng đăng nhập để tiến hành đặt hàng');
    } else if (redirect.includes('wishlist')) {
      showToast('Vui lòng đăng nhập để xem danh sách yêu thích');
    }
    return <Navigate to={redirect} replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
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
          path="/admin/settings"
          element={
            <AdminRoute>
              <AdminSettingsPage />
            </AdminRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}
