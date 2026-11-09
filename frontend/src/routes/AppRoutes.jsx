import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, Navigate, useParams, useLocation } from 'react-router-dom';
import { useAuth, useUI } from '../context';
import { ADMIN_PERMISSIONS, ROLES, getDefaultAdminPath } from '../utils/permissions';

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
const AdminStaffPage = lazy(() => import('../pages/admin/AdminStaffPage'));
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

function ForbiddenRedirect({ to, message }) {
  const { showToast } = useUI();
  useEffect(() => {
    if (message) {
      showToast(message, 'error');
    }
  }, [message, showToast]);
  return <Navigate to={to} replace />;
}

function RoleRoute({ permission, children }) {
  const { user, can } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (user.role !== ROLES.ADMIN && user.role !== ROLES.STAFF) {
    return (
      <ForbiddenRedirect
        to="/"
        message="Tài khoản khách hàng không có quyền truy cập trang quản trị!"
      />
    );
  }

  if (permission && !can(permission)) {
    return (
      <ForbiddenRedirect
        to={getDefaultAdminPath(user.role)}
        message="Bạn không có quyền truy cập chức năng này"
      />
    );
  }

  return children;
}

function CustomerRoute({ children, redirect = '/login?redirect=/account/profile' }) {
  const { user } = useAuth();
  const { showToast } = useUI();

  useEffect(() => {
    if (!user) {
      if (redirect.includes('checkout')) {
        showToast('Vui lòng đăng nhập để tiến hành đặt hàng');
      } else if (redirect.includes('wishlist')) {
        showToast('Vui lòng đăng nhập để xem danh sách yêu thích');
      }
    }
  }, [user, redirect, showToast]);

  if (!user) {
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

        {/* Admin CMS Routes (Strictly Protected with Granular Role Permissions) */}
        <Route
          path="/admin"
          element={
            <RoleRoute permission={ADMIN_PERMISSIONS.DASHBOARD}>
              <AdminDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <RoleRoute permission={ADMIN_PERMISSIONS.PRODUCTS}>
              <AdminProductsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <RoleRoute permission={ADMIN_PERMISSIONS.ORDERS}>
              <AdminOrdersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/coupons"
          element={
            <RoleRoute permission={ADMIN_PERMISSIONS.COUPONS}>
              <AdminCouponsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <RoleRoute permission={ADMIN_PERMISSIONS.REVIEWS}>
              <AdminReviewsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <RoleRoute permission={ADMIN_PERMISSIONS.STAFF}>
              <AdminStaffPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <RoleRoute permission={ADMIN_PERMISSIONS.SETTINGS}>
              <AdminSettingsPage />
            </RoleRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}
