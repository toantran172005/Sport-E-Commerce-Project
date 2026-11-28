import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Mail,
  Zap,
  Gift,
  ArrowUpRight,
} from 'lucide-react';
import { ProductCard } from '../../components/product';
import { ProductCardSkeleton } from '../../components/common/Skeleton.jsx';
import { productService } from '../../services/productService.js';
import { useCatalog, useUI } from '@/context';

const HERO_SLIDES = [
  {
    id: 1,
    tag: 'MÙA GIẢI 2026 · BỨT PHÁ TỐC ĐỘ',
    title: 'Trang Thiết Bị Thể Thao Đỉnh Cao Cho Vận Động Viên',
    subtitle: 'Khám phá thế hệ vợt trợ lực cacbon, giày đinh bám sân và trang phục thi đấu đạt tiêu chuẩn quốc tế từ Yonex, Nike, Adidas, Wilson.',
    ctaText: 'Khám phá ngay',
    ctaLink: '/products',
    secondaryText: 'Vợt Cầu Lông & Tennis',
    secondaryLink: '/products?q=vợt',
    bgGradient: 'from-[#080d1e] via-[#101935] to-[#1e2a56]',
    accentColor: 'text-sky-400',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80',
    caption: 'Dòng giày thể thao Pro Speed 2026',
  },
  {
    id: 2,
    tag: 'CẦU LÔNG ĐỈNH CAO · CHÍNH HÃNG 100%',
    title: 'Khai Phá Sức Mạnh Smash Cùng Yonex & Lining',
    subtitle: 'Vợt thân cứng kiểm soát cầu, cước siêu nảy nanogy cùng phụ kiện cuốn cán thi đấu chính hãng bảo hành toàn diện.',
    ctaText: 'Xem BST Cầu Lông',
    ctaLink: '/products?q=cầu lông',
    secondaryText: 'Giày Chuyên Sân',
    secondaryLink: '/products?q=giày cầu lông',
    bgGradient: 'from-[#170a2a] via-[#2a1347] to-[#401b6e]',
    accentColor: 'text-purple-400',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&auto=format&fit=crop&q=80',
    caption: 'Vợt thi đấu Carbon Graphite thế hệ mới',
  },
  {
    id: 3,
    tag: 'CHẠY BỘ KHÔNG GIỚI HẠN · DRY-TECH',
    title: 'Chinh Phục Mọi Cung Đường Marathon Với Đệm Khí Êm Ái',
    subtitle: 'Dòng giày chạy bộ trợ lực gót chân, giảm chấn tối đa kết hợp trang phục thoáng khí nhanh khô cho runner chuyên nghiệp.',
    ctaText: 'Mua Đồ Chạy Bộ',
    ctaLink: '/products?q=chạy bộ',
    secondaryText: 'Phụ Kiện Thể Thao',
    secondaryLink: '/products',
    bgGradient: 'from-[#1a1408] via-[#33230a] to-[#59390f]',
    accentColor: 'text-amber-400',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=80',
    caption: 'Trang phục & Giày chạy bộ Marathon Ultra',
  },
];

const SPORT_CATEGORIES = [
  {
    id: 'football',
    name: 'Bóng Đá',
    english: 'Football & Futsal',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80',
    desc: 'Giày đinh, bóng thi đấu, áo đấu CLB',
    query: 'bóng đá',
    badge: 'Hot nhất',
  },
  {
    id: 'badminton',
    name: 'Cầu Lông',
    english: 'Badminton Pro',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
    desc: 'Vợt Yonex, Lining, giày cày sân bê tông',
    query: 'cầu lông',
    badge: 'Chuyên nghiệp',
  },
  {
    id: 'running',
    name: 'Chạy Bộ',
    english: 'Running & Marathon',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop&q=80',
    desc: 'Giày trợ lực, áo thun dry-fit, tất chạy',
    query: 'chạy bộ',
    badge: 'Xu hướng',
  },
  {
    id: 'tennis',
    name: 'Tennis & Pickleball',
    english: 'Racket Sports',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80',
    desc: 'Vợt Wilson, Head, banh nỉ & vợt pickleball',
    query: 'tennis',
    badge: 'Mới về',
  },
  {
    id: 'gym',
    name: 'Gym & Thể Hình',
    english: 'Fitness & Training',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    desc: 'Quần áo co giãn, bình nước thể thao, găng tay',
    query: 'gym',
    badge: 'Năng động',
  },
];

const TOP_BRANDS = [
  { name: 'Nike', slogan: 'Just Do It', origin: 'USA', color: 'from-slate-900 to-black' },
  { name: 'Adidas', slogan: 'Impossible is Nothing', origin: 'Germany', color: 'from-slate-800 to-slate-950' },
  { name: 'Yonex', slogan: 'Far Beyond Ordinary', origin: 'Japan', color: 'from-blue-900 to-slate-950' },
  { name: 'Lining', slogan: 'Anything is Possible', origin: 'China', color: 'from-red-900 to-slate-950' },
  { name: 'Wilson', slogan: 'More Win', origin: 'USA', color: 'from-rose-950 to-slate-950' },
  { name: 'Puma', slogan: 'Forever Faster', origin: 'Germany', color: 'from-amber-950 to-slate-950' },
  { name: 'Mizuno', slogan: 'Reach Beyond', origin: 'Japan', color: 'from-cyan-950 to-slate-950' },
  { name: 'Asics', slogan: 'Sound Mind, Sound Body', origin: 'Japan', color: 'from-indigo-950 to-slate-950' },
];

export default function HomePageAdvance() {
  const { brandsList } = useCatalog();
  const { showToast } = useUI();
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingBest, setLoadingBest] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingNew(true);
    productService
      .getProducts({
        page: 0,
        size: 8,
        sort: 'newest',
        status: 'ACTIVE',
      })
      .then((res) => {
        if (!cancelled) {
          setNewArrivals(res.items || res.content || []);
        }
      })
      .catch((err) => {
        console.warn('Lỗi tải sản phẩm mới về:', err);
      })
      .finally(() => {
        if (!cancelled) setLoadingNew(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingBest(true);
    productService
      .getProducts({
        page: 0,
        size: 8,
        sort: 'best_seller',
        status: 'ACTIVE',
      })
      .then((res) => {
        if (!cancelled) {
          setBestSellers(res.items || res.content || []);
        }
      })
      .catch((err) => {
        console.warn('Lỗi tải sản phẩm bán chạy:', err);
      })
      .finally(() => {
        if (!cancelled) setLoadingBest(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Vui lòng nhập địa chỉ email hợp lệ', 'warning');
      return;
    }
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      showToast('Chúc mừng! Mã voucher DELTA50K đã được gửi đến email của bạn', 'success');
      setNewsletterEmail('');
    }, 600);
  };

  const handleBrandClick = (brandName) => {
    const matchedBrand = brandsList.find(
      (b) => b.name.toLowerCase() === brandName.toLowerCase()
    );
    if (matchedBrand) {
      navigate(`/products?brandId=${matchedBrand.id}`);
    } else {
      navigate(`/products?q=${encodeURIComponent(brandName)}`);
    }
  };

  return (
    <div className="max-w-340 w-full mx-auto px-4 md:px-6 py-6 space-y-12">
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px]">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>Bạn đang xem bản thử nghiệm: <strong>HomePageAdvance (Pro Sport Edition)</strong></span>
        </div>
        <Link
          to="/"
          className="px-3 py-1 rounded bg-surface hover:bg-subtle text-ink font-bold border border-line transition shrink-0"
        >
          Quay lại Trang Chủ Gốc
        </Link>
      </div>

      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group transition-all duration-700">
        <div className={`p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 bg-linear-to-r ${slide.bgGradient} text-white min-h-[420px]`}>
          <div className="space-y-5 max-w-2xl z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11.5px] font-extrabold uppercase tracking-widest text-sky-300 shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-sky-300" />
              <span>{slide.tag}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
              {slide.title}
            </h1>
            <p className="text-[14px] md:text-[15px] text-slate-300 leading-relaxed max-w-xl">
              {slide.subtitle}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                to={slide.ctaLink}
                className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-[13.5px] font-extrabold transition shadow-lg shadow-accent/25 flex items-center gap-2 transform active:scale-95"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={slide.secondaryLink}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[13.5px] font-bold transition backdrop-blur-sm border border-white/15"
              >
                {slide.secondaryText}
              </Link>
            </div>
          </div>

          <div className="relative w-full md:w-96 h-64 md:h-80 rounded-xl overflow-hidden shrink-0 border border-white/15 shadow-2xl">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover transition duration-1000 transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-end p-5">
              <span className="text-[12.5px] text-slate-200 font-medium flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                {slide.caption}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 border border-white/15 cursor-pointer"
          title="Slide trước"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 border border-white/15 cursor-pointer"
          title="Slide tiếp theo"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {HERO_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide ? 'w-8 bg-accent' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              title={`Chuyển đến slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <section className="space-y-5">
        <div className="flex items-end justify-between border-b border-line pb-3">
          <div>
            <div className="flex items-center gap-2 text-accent text-[12px] font-extrabold uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Chuyên Mục Nổi Bật</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-ink tracking-tight mt-0.5">
              Khám Phá Theo Bộ Môn Thể Thao
            </h2>
          </div>
          <Link
            to="/products"
            className="text-[13px] font-bold text-accent hover:underline flex items-center gap-1 group"
          >
            <span>Tất cả môn</span>
            <ChevronRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {SPORT_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?q=${encodeURIComponent(cat.query)}`}
              className="group relative rounded-xl overflow-hidden aspect-[4/5] bg-surface border border-line hover:border-accent hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-4 cursor-pointer"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent transition duration-300 group-hover:via-black/50" />

              <div className="relative z-10 space-y-1">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-accent/90 text-white uppercase tracking-wider">
                  {cat.badge}
                </span>
                <h3 className="text-[17px] font-black text-white leading-tight group-hover:text-accent-hover transition">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {cat.desc}
                </p>
                <div className="pt-1 flex items-center gap-1 text-[11px] font-bold text-white/90 group-hover:text-accent transition">
                  <span>Xem sản phẩm</span>
                  <ArrowRight className="w-3 h-3 transition group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-line">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-xl md:text-2xl font-black text-ink tracking-tight">
              Sản Phẩm Mới Về
            </h2>
          </div>
          <Link
            to="/products?sort=newest"
            className="text-[13px] font-bold text-accent hover:underline flex items-center gap-1 group"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        {loadingNew && newArrivals.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative rounded-2xl overflow-hidden p-8 bg-linear-to-br from-amber-600 via-orange-600 to-rose-700 text-white flex flex-col justify-between min-h-[220px] shadow-lg border border-white/10 group">
          <div className="space-y-2 z-10 max-w-sm">
            <span className="px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-amber-200">
              Bộ Sưu Tập Giày Thi Đấu
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Sẵn Sàng Bứt Phá Mọi Giới Hạn Sân Cỏ
            </h3>
            <p className="text-[13px] text-amber-100">
              Công nghệ đế đinh bám sân và đệm khí êm ái hỗ trợ tối đa cho từng bước bứt tốc.
            </p>
          </div>
          <div className="pt-4 z-10">
            <Link
              to="/products?q=giày"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-extrabold text-[13px] hover:bg-slate-100 transition shadow-md"
            >
              <span>Săn Deal Giày Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden p-8 bg-linear-to-br from-blue-700 via-indigo-700 to-slate-900 text-white flex flex-col justify-between min-h-[220px] shadow-lg border border-white/10 group">
          <div className="space-y-2 z-10 max-w-sm">
            <span className="px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-sky-200">
              Công Nghệ Dry-Tech 2026
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Trang Phục Thể Thao Siêu Thoáng Khí
            </h3>
            <p className="text-[13px] text-slate-200">
              Vải dệt kim cấu trúc tổ ong thấm hút mồ hôi cực nhanh, sẵn sàng cho những buổi tập cường độ cao.
            </p>
          </div>
          <div className="pt-4 z-10">
            <Link
              to="/products?q=áo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-extrabold text-[13px] hover:bg-accent-hover transition shadow-md"
            >
              <span>Khám Phá BST Mùa Hè</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-line">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-warning" />
            <h2 className="text-xl md:text-2xl font-black text-ink tracking-tight">
              Bán Chạy Nhất Tuần
            </h2>
          </div>
          <Link
            to="/products?sort=best_seller"
            className="text-[13px] font-bold text-accent hover:underline flex items-center gap-1 group"
          >
            <span>Xem thêm</span>
            <ChevronRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        {loadingBest && bestSellers.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-[12px] font-extrabold text-accent uppercase tracking-wider">
            Đối Tác Chính Hãng
          </span>
          <h2 className="text-xl md:text-2xl font-black text-ink tracking-tight">
            Thương Hiệu Thể Thao Hàng Đầu Thế Giới
          </h2>
          <p className="text-[13px] text-ink-muted">
            100% sản phẩm có chứng nhận xuất xứ, tem bảo hành chính hãng từ nhà sản xuất
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {TOP_BRANDS.map((brand) => (
            <button
              key={brand.name}
              type="button"
              onClick={() => handleBrandClick(brand.name)}
              className="p-4 rounded-xl bg-surface border border-line hover:border-accent hover:shadow-lg transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-accent/10 transition">
                <span className="text-[14px] font-black text-ink group-hover:text-accent">
                  {brand.name[0]}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[13.5px] font-black text-ink group-hover:text-accent block">
                  {brand.name}
                </span>
                <span className="text-[10px] text-ink-subtle uppercase tracking-wider block">
                  {brand.origin}
                </span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-ink-subtle group-hover:text-accent transition opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 border border-white/10 p-8 md:p-12 text-white shadow-xl">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-[12px] font-bold text-sky-300">
            <Gift className="w-4 h-4" />
            <span>Đặc Quyền Thành Viên Mới</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Gia Nhập Delta Sport Club - Nhận Ngay Voucher 50.000₫
          </h2>
          <p className="text-[13.5px] text-slate-300 max-w-lg mx-auto">
            Đăng ký email để nhận mã giảm giá cho đơn hàng đầu tiên, cùng các thông tin sớm nhất về đợt mở bán vợt và giày phiên bản giới hạn.
          </p>
          <form onSubmit={handleSubscribe} className="pt-2 flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
            <div className="relative w-full">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Nhập địa chỉ email của bạn..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-[13.5px] focus:outline-none focus:border-accent focus:bg-white/15 transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubscribing}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-[13.5px] font-extrabold transition shadow-lg shrink-0 cursor-pointer disabled:opacity-60"
            >
              {isSubscribing ? 'Đang gửi...' : 'Nhận Voucher'}
            </button>
          </form>
          <p className="text-[11px] text-slate-400">
            Chúng tôi cam kết bảo mật 100% thông tin và không gửi thư rác.
          </p>
        </div>
      </section>
    </div>
  );
}
