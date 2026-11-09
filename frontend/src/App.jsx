import { BrowserRouter } from 'react-router-dom';
import AddressModal from './components/address/AddressModal';
import {
  AdminCouponModal,
  AdminOrderModal,
  AdminProductModal,
  AdminCategoryModal,
  AdminBrandModal,
} from './components/admin';
import CancelOrderModal from './components/order/CancelOrderModal';
import ReviewModal from './components/review/ReviewModal';
import VerifyOtpModal from './components/auth/VerifyOtpModal';
import VnpayQrModal from './components/payment/VnpayQrModal';
import { ErrorModal, ErrorBoundary, Toast, AdminStaffModal, ConfirmModal } from './components/common';
import { AppProviders, useUI } from './context';
import AppRoutes from './routes/AppRoutes';

function GlobalOverlays() {
  const { toastMessage } = useUI();

  return (
    <>
      <VerifyOtpModal />
      <AddressModal />
      <AdminCouponModal />
      <AdminOrderModal />
      <AdminProductModal />
      <AdminCategoryModal />
      <AdminBrandModal />
      <AdminStaffModal />
      <ConfirmModal />
      <CancelOrderModal />
      <ReviewModal />
      <VnpayQrModal />
      <ErrorModal />
      <Toast message={toastMessage} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <ErrorBoundary>
          <AppRoutes />
          <GlobalOverlays />
        </ErrorBoundary>
      </AppProviders>
    </BrowserRouter>
  );
}
