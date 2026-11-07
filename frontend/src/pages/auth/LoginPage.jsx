import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  User,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { authService } from '../../services/authService.js';

export default function LoginPage() {
  const { setUser, showToast } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('toan.tran@gmail.com');
  const [password, setPassword] = useState('123456');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const executeLogin = async (loginEmail, loginPassword) => {
    setError('');
    setLoading(true);
    try {
      const res = await authService.login({ email: loginEmail, password: loginPassword });
      setUser(res.user);
      showToast(`Đăng nhập thành công! Xin chào ${res.user.fullName || res.user.name}`);
      
      if (res.user.role === 'ADMIN' && (redirectUrl === '/' || redirectUrl === '/admin')) {
        navigate('/admin');
      } else {
        navigate(redirectUrl);
      }
    } catch (err) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeLogin(email, password);
  };

  // 1-Click Role Logins
  const handleLoginAsCustomer = () => {
    setEmail('toan.tran@gmail.com');
    setPassword('123456');
    executeLogin('toan.tran@gmail.com', '123456');
  };

  const handleLoginAsAdmin = () => {
    setEmail('admin@sannha.vn');
    setPassword('admin123');
    executeLogin('admin@sannha.vn', 'admin123');
  };

  const handleContinueAsGuest = () => {
    localStorage.removeItem('sport_user');
    localStorage.removeItem('token');
    setUser(null);
    showToast('Đang duyệt web với tư cách Khách vãng lai (Guest)');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-page flex flex-col text-ink transition-colors">
      {/* Top Header */}
      <header className="bg-surface border-b border-line h-16">
        <div className="max-w-[1360px] mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-accent text-white flex items-center justify-center">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="text-[18px] font-extrabold tracking-tight">SÂN NHÀ SPORT</span>
          </Link>

          <Link
            to="/"
            className="text-[12.5px] font-bold text-accent hover:underline flex items-center gap-1"
          >
            <span>Duyệt cửa hàng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="bg-surface rounded-lg shadow-sm border border-line w-full max-w-[1020px] grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[640px]">
          {/* Left Brand Column (5 cols) */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-b from-[#2f6bff] to-[#1540b8] p-8 text-white flex-col justify-between">
            <div className="space-y-6">
              <div className="w-10 h-10 rounded-md bg-surface/15 flex items-center justify-center">
                <Zap className="w-5 h-5 fill-white" />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold uppercase leading-tight tracking-tight">
                  Hệ Thống Phân Quyền <br />
                  <span className="text-amber-300">Đồ Án TMĐT Thể Thao</span>
                </h2>
                <p className="text-[13px] text-blue-100 mt-2 leading-relaxed">
                  Lựa chọn vai trò để trải nghiệm luồng thao tác hoàn chỉnh từ khách hàng đến người bán.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 bg-white/10 p-3 rounded-lg border border-white/10">
                  <User className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[13px] font-bold text-emerald-300">1. Guest (Khách vãng lai)</h4>
                    <p className="text-[11.5px] text-blue-100">Chỉ xem hàng, tìm kiếm và lưu giỏ hàng tạm; khi bấm Thanh toán/Mua ngay hệ thống yêu cầu đăng nhập.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/10 p-3 rounded-lg border border-white/10">
                  <UserCheck className="w-4 h-4 text-blue-200 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[13px] font-bold text-blue-200">2. Customer (Khách hàng)</h4>
                    <p className="text-[11.5px] text-blue-100">Đặt hàng, quản lý đơn mua, tự quản lý sổ địa chỉ riêng, đánh giá — không có giao diện quản lý bán hàng.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/10 p-3 rounded-lg border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[13px] font-bold text-amber-300">3. Admin (Người bán / Shop Owner)</h4>
                    <p className="text-[11.5px] text-blue-100">Đầy đủ quyền mua sắm như khách hàng, cộng thêm quyền vào Kênh Người Bán (Sản phẩm, Đơn hàng, Voucher, Đánh giá, Cài đặt shop).</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-blue-200">
              © 2026 Sân Nhà Sport · Hệ thống chuẩn 3 phân quyền
            </div>
          </div>

          {/* Right Form Column (7 cols) */}
          <div className="lg:col-span-7 p-6 md:p-10 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-ink">
                  Đăng Nhập Tài Khoản
                </h1>
                <p className="text-[13px] text-ink-muted mt-1">
                  Chọn vai trò đăng nhập nhanh hoặc nhập thông tin tài khoản bên dưới
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 text-danger text-[12px] font-medium">
                  {error}
                </div>
              )}

              {/* 3 Quick Role Logins Selection */}
              <div className="space-y-2">
                <p className="text-[11.5px] font-bold text-ink-subtle uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Chọn nhanh vai trò thử nghiệm:</span>
                </p>

                <div className="grid grid-cols-1 gap-2">
                  {/* Option 1: Admin */}
                  <button
                    type="button"
                    onClick={handleLoginAsAdmin}
                    disabled={loading}
                    className="p-3 rounded-lg border border-purple-500/30 hover:border-purple-500 bg-purple-500/5 hover:bg-purple-500/10 text-left transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-bold text-ink group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate">
                          Đăng nhập vai trò Admin (Người bán / Shop Owner)
                        </p>
                        <p className="text-[11px] text-ink-muted truncate">
                          admin@sannha.vn • Có đủ chức năng mua sắm + Kênh Người Bán
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-purple-500 text-white shrink-0 ml-2">
                      Admin
                    </span>
                  </button>

                  {/* Option 2: Customer */}
                  <button
                    type="button"
                    onClick={handleLoginAsCustomer}
                    disabled={loading}
                    className="p-3 rounded-lg border border-accent/30 hover:border-accent bg-accent/5 hover:bg-accent/10 text-left transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-accent-soft text-accent flex items-center justify-center shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-bold text-ink group-hover:text-accent truncate">
                          Đăng nhập vai trò Customer (Khách hàng)
                        </p>
                        <p className="text-[11px] text-ink-muted truncate">
                          toan.tran@gmail.com • Đặt hàng, sổ địa chỉ, không có admin
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-accent text-white shrink-0 ml-2">
                      Customer
                    </span>
                  </button>

                  {/* Option 3: Guest */}
                  <button
                    type="button"
                    onClick={handleContinueAsGuest}
                    className="p-2.5 rounded-lg border border-line hover:border-ink-muted bg-surface-2/40 hover:bg-surface-2 text-left transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-surface-2 text-ink-muted flex items-center justify-center shrink-0 border border-line">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-bold text-ink truncate">
                          Duyệt web với tư cách Khách (Guest)
                        </p>
                        <p className="text-[11px] text-ink-muted truncate">
                          Chưa đăng nhập • Xem hàng, khi đặt đơn sẽ yêu cầu đăng nhập
                        </p>
                      </div>
                    </div>
                    <span className="text-[11.5px] font-bold text-ink-muted group-hover:text-ink shrink-0 ml-2">
                      Vào xem →
                    </span>
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-line w-full" />
                <span className="bg-surface px-3 text-[11px] font-bold text-ink-subtle uppercase tracking-wider absolute">
                  Hoặc đăng nhập thủ công
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email đăng nhập
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@sannha.vn hoặc toan.tran@gmail.com"
                      className="w-full h-10 pl-9 pr-3 rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line text-[13px] focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-300">
                      Mật khẩu
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11.5px] text-accent font-bold hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 pl-9 pr-10 rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line text-[13px] focus:outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10.5 rounded-md bg-accent hover:bg-accent-hover text-white text-[13.5px] font-bold shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="text-center text-[12.5px] text-ink-muted">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-accent font-bold hover:underline">
                  Đăng ký tài khoản mới
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
