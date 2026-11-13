import { ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';
import BrandLogo from '../common/BrandLogo.jsx';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface mt-auto">
      {/* Service Highlights Bar */}
      <div className="border-b border-line-subtle py-6">
        <div className="max-w-[1360px] mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-accent-soft dark:bg-accent/20 text-accent flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-ink">100% Chính Hãng</p>
              <p className="text-[11.5px] text-ink-muted">Cam kết hoàn tiền 200% nếu phát hiện giả</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-accent-soft dark:bg-accent/20 text-accent flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-ink">Giao Hàng Toàn Quốc</p>
              <p className="text-[11.5px] text-ink-muted">Đồng kiểm tra hàng khi nhận</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-accent-soft dark:bg-accent/20 text-accent flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-ink">Đổi Trả Trong 7 Ngày</p>
              <p className="text-[11.5px] text-ink-muted">Hỗ trợ đổi size nhanh chóng</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-accent-soft dark:bg-accent/20 text-accent flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-ink">Hỗ Trợ 24/7</p>
              <p className="text-[11.5px] text-ink-muted">Hotline: 1900 6868</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1360px] mx-auto px-4 md:px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="mb-3">
            <BrandLogo className="h-9 w-auto" />
          </div>
          <p className="text-[12.5px] text-ink-muted leading-relaxed mb-3">
            Hệ sinh thái trang thiết bị, phụ kiện và trang phục thể thao chính hãng hàng đầu Việt Nam. Dành riêng cho người chơi thể thao nghiêm túc.
          </p>
          <p className="text-[11.5px] text-ink-subtle">
            Địa chỉ: Số 12 Nguyễn Văn Bảo, Phường 4, Quận Gò Vấp, TP. Hồ Chí Minh
          </p>
        </div>

        <div>
          <h4 className="text-[13.5px] font-bold text-ink uppercase tracking-wider mb-3">
            Về Delta Sport
          </h4>
          <ul className="space-y-2 text-[12.5px] text-ink-muted">
            <li><Link to="/products" className="hover:text-accent">Giới thiệu thương hiệu</Link></li>
            <li><Link to="/products" className="hover:text-accent">Hệ thống cửa hàng</Link></li>
            <li><Link to="/products" className="hover:text-accent">Tuyển dụng</Link></li>
            <li><Link to="/products" className="hover:text-accent">Chính sách bảo mật</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[13.5px] font-bold text-ink uppercase tracking-wider mb-3">
            Hỗ Trợ Khách Hàng
          </h4>
          <ul className="space-y-2 text-[12.5px] text-ink-muted">
            <li><Link to="/orders" className="hover:text-accent">Tra cứu đơn hàng</Link></li>
            <li><Link to="/account" className="hover:text-accent">Chính sách đổi trả & bảo hành</Link></li>
            <li><Link to="/account?tab=coupons" className="hover:text-accent">Hướng dẫn săn Voucher</Link></li>
            <li><Link to="/checkout" className="hover:text-accent">Phương thức thanh toán & VNPay</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[13.5px] font-bold text-ink uppercase tracking-wider mb-3">
            Thanh Toán & Vận Chuyển
          </h4>
          <p className="text-[12px] text-ink-muted mb-2">
            Hỗ trợ thanh toán an toàn qua COD, Chuyển khoản QR VNPay, Thẻ tín dụng/ghi nợ.
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">GHN</span>
            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">GHTK</span>
            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">VNPay QR</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-line-subtle py-3 text-center text-[12px] text-ink-subtle">
        © 2026 Delta Sport · Hệ thống TMĐT Thể thao chuẩn Java Spring Boot & React 19 · All rights reserved.
      </div>
    </footer>
  );
}
