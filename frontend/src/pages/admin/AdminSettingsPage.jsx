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
  const { isDarkMode, setIsDarkMode, toggleDarkMode, showToast } = useStore();

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
          {/* 1. Dark Mode / Appearance Card */}
          <div className="bg-surface rounded-lg border border-line p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-line">
              <div>
                <h2 className="text-[16px] font-bold text-ink flex items-center gap-2">
                  <Sun className="w-5 h-5 text-warning" />
                  <span>Giao Diện &amp; Chế Độ Hiển Thị (Dark Mode)</span>
                </h2>
                <p className="text-[12px] text-ink-muted mt-0.5">
                  Áp dụng đồng bộ cho toàn bộ trang Quản trị và Cửa hàng
                </p>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-bold text-ink">
                  {isDarkMode ? 'Đang bật Dark Mode' : 'Đang bật Light Mode'}
                </span>
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className={`w-12 h-7 rounded-full p-1 transition flex items-center cursor-pointer ${
                    isDarkMode ? 'bg-accent justify-end' : 'bg-line justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-surface shadow-xs flex items-center justify-center text-xs">
                    {isDarkMode ? <Moon className="w-3 h-3 text-accent" /> : <Sun className="w-3 h-3 text-warning" />}
                  </span>
                </button>
              </div>
            </div>

            {/* Visual Theme Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div
                onClick={() => setIsDarkMode(false)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition flex items-center justify-between ${
                  !isDarkMode
                    ? 'border-accent bg-accent-soft'
                    : 'border-line bg-surface-2/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-surface border border-line flex items-center justify-center text-warning">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-ink">
                      Chế độ Sáng (Default Light)
                    </h3>
                    <p className="text-[12px] text-ink-muted mt-0.5">
                      Nền sáng <code className="font-bold">#f8fafc</code>, thẻ trắng tinh khiết
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    !isDarkMode ? 'bg-accent text-white' : 'bg-surface-2 text-ink-muted'
                  }`}
                >
                  {!isDarkMode ? 'Đang dùng' : 'Chọn'}
                </span>
              </div>

              <div
                onClick={() => setIsDarkMode(true)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition flex items-center justify-between ${
                  isDarkMode
                    ? 'border-accent bg-accent-soft'
                    : 'border-line bg-surface-2/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-surface-2 text-accent flex items-center justify-center">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-ink">
                      Chế độ Tối (Dark Slate)
                    </h3>
                    <p className="text-[12px] text-ink-muted mt-0.5">
                      Nền tối <code className="font-bold">#0f172a</code>, dịu mắt ban đêm
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isDarkMode ? 'bg-accent text-white' : 'bg-surface-2 text-ink-muted'
                  }`}
                >
                  {isDarkMode ? 'Đang dùng' : 'Chọn'}
                </span>
              </div>
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
