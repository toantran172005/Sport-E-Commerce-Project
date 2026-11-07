import { BrowserRouter } from 'react-router-dom';
import AddressModal from './components/common/AddressModal';
import AdminCouponModal from './components/common/AdminCouponModal';
import AdminOrderModal from './components/common/AdminOrderModal';
import AdminProductModal from './components/common/AdminProductModal';
import AdminCategoryModal from './components/common/AdminCategoryModal';
import AdminBrandModal from './components/common/AdminBrandModal';
import CancelOrderModal from './components/common/CancelOrderModal';
import ReviewModal from './components/common/ReviewModal';
import VerifyOtpModal from './components/common/VerifyOtpModal';
import VnpayQrModal from './components/common/VnpayQrModal';
import ErrorBoundary from './components/common/ErrorBoundary';
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
      <CancelOrderModal />
      <ReviewModal />
      <VnpayQrModal />

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg border border-white/10 text-[13px] font-medium flex items-center gap-2.5 transition-all duration-200">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span>{toastMessage}</span>
        </div>
      )}
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
