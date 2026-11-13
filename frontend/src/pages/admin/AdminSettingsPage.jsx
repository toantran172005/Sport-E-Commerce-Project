import { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Save,
  CreditCard,
  Store,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import AdminLayout from '../../layouts/AdminLayout';

export default function AdminSettingsPage() {
  const { isDarkMode, toggleDarkMode, showToast } = useStore();

  const [storeName, setStoreName] = useState('Delta Sport — Đồ thể thao cho người chơi thật');
  const [hotline, setHotline] = useState('1900 6868');
  const [supportEmail, setSupportEmail] = useState('cskh@deltasport.vn');
  const [freeShipThreshold, setFreeShipThreshold] = useState('500.000');
  const [vnpayTmnCode, setVnpayTmnCode] = useState('SANNHA01');
  const [otpTtl, setOtpTtl] = useState('120 giây (Redis TTL)');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast('Đã lưu cấu hình hệ thống Delta Sport CMS thành công!', 'success');
  };

  return (
    <AdminLayout searchPlaceholder="Tìm kiếm cấu hình hệ thống, cổng thanh toán, bảo mật...">
      <div className="space-y-6 text-ink">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-extrabold text-ink flex items-center gap-2">
              <Settings className="w-6 h-6 text-accent" />
              <span>Cài Đặt Hệ Thống &amp; Giao Diện</span>
            </h1>
            <p className="text-[13px] text-ink-muted mt-0.5">
              Tùy chỉnh chế độ hiển thị Sáng/Tối, cấu hình VNPay, đơn vị vận chuyển và bảo mật
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Tất Cả Cài Đặt</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* 1. Dark Mode / Appearance Card (Single Button / Toggle without preview boxes) */}
          <div className="bg-surface rounded-lg border border-line p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-bold text-ink flex items-center gap-2">
                  {isDarkMode ? (
                    <Moon className="w-5 h-5 text-accent" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-500" />
                  )}
                  <span>Giao Diện &amp; Chế Độ Hiển Thị</span>
                </h2>
                <p className="text-[12px] text-ink-muted mt-0.5">
                  Chuyển đổi linh hoạt giữa giao diện Sáng (Light) và Tối (Dark) đồng bộ toàn hệ thống
                </p>
              </div>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className="px-4 py-2.5 rounded-lg border border-line bg-surface-2 hover:bg-surface-2/80 text-ink text-[13px] font-bold flex items-center gap-2.5 transition shadow-xs cursor-pointer"
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center ${
                    isDarkMode ? 'bg-accent/20 text-accent' : 'bg-amber-500/20 text-amber-500'
                  }`}
                >
                  {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <span>
                  {isDarkMode
                    ? 'Đang bật Giao diện Tối (Bấm để chuyển Sáng)'
                    : 'Đang bật Giao diện Sáng (Bấm để chuyển Tối)'}
                </span>
              </button>
            </div>
          </div>

          {/* 2. Store Info & Contact */}
          <div className="bg-surface rounded-lg border border-line p-6 space-y-4 shadow-xs">
            <div className="border-b border-line pb-3">
              <h2 className="text-[16px] font-bold text-ink flex items-center gap-2">
                <Store className="w-5 h-5 text-accent" />
                <span>Thông Tin Cửa Hàng &amp; CSKH</span>
              </h2>
              <p className="text-[12px] text-ink-muted mt-0.5">
                Hiển thị trên Header, Footer, Hóa đơn VAT và Email xác nhận đơn hàng
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-[12px] font-bold text-ink mb-1">
                  Tên thương hiệu cửa hàng:
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-line bg-page text-[13px] text-ink focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-ink mb-1">
                  Hotline hỗ trợ:
                </label>
                <input
                  type="text"
                  value={hotline}
                  onChange={(e) => setHotline(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-line bg-page text-[13px] text-ink focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-ink mb-1">
                  Email nhận liên hệ:
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-line bg-page text-[13px] text-ink focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-ink mb-1">
                  Ngưỡng FreeShip tự động (₫):
                </label>
                <input
                  type="text"
                  value={freeShipThreshold}
                  onChange={(e) => setFreeShipThreshold(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-line bg-page text-[13px] text-ink focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Gateways & Integrations */}
          <div className="bg-surface rounded-lg border border-line p-6 space-y-4 shadow-xs">
            <div className="border-b border-line pb-3">
              <h2 className="text-[16px] font-bold text-ink flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-accent" />
                <span>Cổng Thanh Toán &amp; Tích Hợp Vận Chuyển</span>
              </h2>
              <p className="text-[12px] text-ink-muted mt-0.5">
                VNPay QR Sandbox, Giao Hàng Nhanh (GHN) và Giao Hàng Tiết Kiệm (GHTK)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-ink mb-1">
                  VNPay TMN Code (Terminal ID):
                </label>
                <input
                  type="text"
                  value={vnpayTmnCode}
                  onChange={(e) => setVnpayTmnCode(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-line bg-page text-[13px] font-mono text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-ink mb-1">
                  Thời hạn mã OTP xác thực (Redis TTL):
                </label>
                <input
                  type="text"
                  value={otpTtl}
                  onChange={(e) => setOtpTtl(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-line bg-page text-[13px] font-mono text-ink focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
