import { Link } from 'react-router-dom';
import { Home, ShoppingBag } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 text-ink">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto text-2xl font-black border border-accent/20">
          404
        </div>
        <h1 className="text-[22px] font-extrabold text-ink">
          Không Tìm Thấy Trang Yêu Cầu
        </h1>
        <p className="text-[13.5px] text-ink-muted leading-relaxed">
          Đường dẫn bạn đang truy cập có thể đã bị di chuyển, đổi tên hoặc tạm thời không khả dụng.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/products"
            className="px-4 py-2.5 rounded-lg bg-surface border border-line hover:bg-surface-2 text-[13px] font-bold text-ink flex items-center gap-2 transition"
          >
            <ShoppingBag className="w-4 h-4 text-ink-muted" />
            <span>Xem sản phẩm</span>
          </Link>
          <Link
            to="/"
            className="px-4 py-2.5 rounded-lg bg-accent hover:bg-accent/90 text-white text-[13px] font-bold flex items-center gap-2 transition shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
