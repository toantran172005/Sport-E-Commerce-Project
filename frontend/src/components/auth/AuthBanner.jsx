import { Truck, BadgeCheck, RotateCcw, ShieldCheck } from 'lucide-react';
import BrandLogo from '../common/BrandLogo.jsx';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200';

const BENEFITS = [
  { icon: BadgeCheck, title: 'Hàng chính hãng', desc: 'Giày, trang phục, dụng cụ từ thương hiệu uy tín' },
  { icon: Truck, title: 'Giao nhanh toàn quốc', desc: 'Theo dõi đơn hàng từng bước ngay trên web' },
  { icon: RotateCcw, title: 'Đổi trả dễ dàng', desc: 'Hỗ trợ đổi size, đổi mẫu khi chưa ưng ý' },
  { icon: ShieldCheck, title: 'Thanh toán an toàn', desc: 'COD hoặc chuyển khoản qua cổng VNPay' },
];

const CONTENT = {
  login: {
    eyebrow: 'Chào mừng bạn quay lại',
    heading: 'Sẵn sàng cho',
    highlight: 'trận đấu tiếp theo?',
    description:
      'Đăng nhập để xem giỏ hàng, theo dõi đơn hàng và nhận ưu đãi dành riêng cho thành viên Delta Sport.',
  },
  register: {
    eyebrow: 'Thành viên mới',
    heading: 'Gia nhập cộng đồng',
    highlight: 'Delta Sport',
    description:
      'Tạo tài khoản chỉ trong một phút để mua sắm nhanh hơn, lưu sản phẩm yêu thích và nhận ưu đãi độc quyền.',
  },
  recovery: {
    eyebrow: 'Bảo mật tài khoản',
    heading: 'Tài khoản của bạn',
    highlight: 'luôn được bảo vệ',
    description:
      'Chúng tôi xác thực qua email để đảm bảo chỉ bạn mới truy cập được tài khoản và đơn hàng của mình.',
  },
};

/**
 * Banner thương hiệu bên trái các trang đăng nhập / đăng ký / quên mật khẩu / OTP.
 * Chỉ hiển thị từ màn hình lg trở lên (do trang cha đặt `hidden lg:flex`).
 */
export default function AuthBanner({ variant = 'login', className = '' }) {
  const content = CONTENT[variant] || CONTENT.login;

  return (
    <div
      className={`relative overflow-hidden text-white bg-gradient-to-b from-[#2f6bff] to-[#0b1f5c] ${className}`}
    >
      {/* Ảnh nền thể thao; nếu tải lỗi thì vẫn còn nền gradient phía sau */}
      <img
        src={HERO_IMAGE}
        alt=""
        aria-hidden="true"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1540b8]/70 via-[#2f6bff]/45 to-[#0b1f5c]/95" />
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-28 -left-20 w-80 h-80 rounded-full bg-amber-300/15 blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between w-full p-8 xl:p-10">
        <div className="space-y-8">
          <div className="inline-flex items-center rounded-xl bg-white/95 px-3.5 py-2 shadow-lg shadow-blue-950/20">
            <BrandLogo theme="light" className="h-9 w-auto" />
          </div>

          <div className="space-y-3">
            <span className="inline-block px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-bold uppercase tracking-wider text-amber-200">
              {content.eyebrow}
            </span>
            <h2 className="text-[28px] xl:text-[32px] font-extrabold leading-tight tracking-tight">
              {content.heading} <br />
              <span className="text-amber-300">{content.highlight}</span>
            </h2>
            <p className="text-[13.5px] text-blue-100 leading-relaxed max-w-[340px]">
              {content.description}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-2.5">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-center gap-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 px-3.5 py-2.5"
            >
              <div className="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-amber-300" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold leading-tight">{title}</p>
                <p className="text-[11.5px] text-blue-100 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[11px] text-blue-200">© 2026 Delta Sport · Mua sắm thể thao trực tuyến</p>
      </div>
    </div>
  );
}
