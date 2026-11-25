import { useState, useMemo } from 'react';
import {
  Ticket,
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Clock,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import AdminLayout from '../../layouts/AdminLayout';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function AdminCouponsPage() {
  const {
    coupons = [],
    toggleCouponActive,
    deleteCoupon,
    openModal,
    showConfirmModal,
    showToast,
  } = useStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const handleDeleteCoupon = (c) => {
    showConfirmModal({
      title: 'Xóa mã khuyến mãi',
      message: `Bạn có chắc chắn muốn xóa mã khuyến mãi "${c.code}"? Thao tác này không thể hoàn tác.`,
      confirmText: 'Xóa vĩnh viễn',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          await deleteCoupon(c.id || c.code);
        } catch (err) {
          showToast(err.message || 'Không thể xóa mã khuyến mãi', 'error');
        }
      },
    });
  };

  const handleToggleCoupon = async (c) => {
    try {
      await toggleCouponActive(c.id || c.code);
    } catch (err) {
      showToast(err.message || 'Không thể cập nhật trạng thái mã khuyến mãi', 'error');
    }
  };

  const filtered = useMemo(() => {
    return coupons.filter((c) => {
      if (filterType !== 'ALL' && c.discountType !== filterType) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const codeMatch = (c.code || '').toLowerCase().includes(q);
        const descMatch = (c.description || c.desc || '').toLowerCase().includes(q);
        return codeMatch || descMatch;
      }
      return true;
    });
  }, [coupons, filterType, search]);

  const totalUsed = useMemo(() => {
    return coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
  }, [coupons]);

  // Strip thống kê: Đang diễn ra, Sắp diễn ra, Đã hết hạn
  const { activeCampaignsCount, upcomingCampaignsCount, expiredCampaignsCount } = useMemo(() => {
    const now = new Date();
    let active = 0;
    let upcoming = 0;
    let expired = 0;

    coupons.forEach((c) => {
      const isStatusActive = c.isActive !== false;
      const start = c.startDate ? new Date(c.startDate) : null;
      const end = c.endDate ? new Date(c.endDate) : null;

      if (!isStatusActive || (end && !isNaN(end.getTime()) && now > end)) {
        expired++;
      } else if (start && !isNaN(start.getTime()) && now < start) {
        upcoming++;
      } else {
        active++;
      }
    });

    return {
      activeCampaignsCount: active,
      upcomingCampaignsCount: upcoming,
      expiredCampaignsCount: expired,
    };
  }, [coupons]);

  return (
    <AdminLayout
      searchPlaceholder="Tìm kiếm mã khuyến mãi (SPORT50K, FREESHIP, YONEX20...)"
      onSearchChange={setSearch}
    >
      <div className="space-y-6 text-ink">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-extrabold text-ink flex items-center gap-2">
              <Ticket className="w-6 h-6 text-accent" />
              <span>Quản Lý Mã Khuyến Mãi &amp; Voucher</span>
            </h1>
            <p className="text-[13px] text-ink-muted mt-0.5">
              Quản trị bảng <code className="font-bold text-accent">coupons</code> &amp;{' '}
              <code className="font-bold text-accent">coupon_usages</code>
            </p>
          </div>

          <button
            type="button"
            onClick={() => openModal('admin_coupon_modal')}
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Mã Giảm Giá Mới</span>
          </button>
        </div>

        {/* Summary Strip (Active / Upcoming / Expired / Total Usages) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-surface rounded-xl border border-line p-4 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-extrabold uppercase text-ink-muted">
                ĐANG DIỄN RA
              </p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {activeCampaignsCount} <span className="text-xs font-normal text-ink-muted">mã</span>
              </p>
              <p className="text-[11px] text-ink-subtle mt-0.5">
                Đủ điều kiện áp dụng
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-line p-4 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-extrabold uppercase text-ink-muted">
                SẮP DIỄN RA
              </p>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {upcomingCampaignsCount} <span className="text-xs font-normal text-ink-muted">mã</span>
              </p>
              <p className="text-[11px] text-ink-subtle mt-0.5">
                Chưa đến ngày hiệu lực
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-line p-4 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-extrabold uppercase text-ink-muted">
                HẾT HẠN / TẠM DỪNG
              </p>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {expiredCampaignsCount} <span className="text-xs font-normal text-ink-muted">mã</span>
              </p>
              <p className="text-[11px] text-ink-subtle mt-0.5">
                Quá hạn hoặc đã ngắt
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-line p-4 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] font-extrabold uppercase text-ink-muted">
                TỔNG LƯỢT ĐÃ DÙNG
              </p>
              <p className="text-2xl font-black text-accent mt-1">
                {totalUsed.toLocaleString('vi-VN')} <span className="text-xs font-normal text-ink-muted">lượt</span>
              </p>
              <p className="text-[11px] text-ink-subtle mt-0.5">
                Kích cầu chuyển đổi
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Coupons List Table */}
        <div className="bg-surface rounded-xl border border-line p-6 space-y-4 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'ALL', label: 'Tất cả loại mã' },
                { id: 'FIXED_AMOUNT', label: 'Giảm cố định (₫)' },
                { id: 'PERCENTAGE', label: 'Giảm theo %' },
                { id: 'FREE_SHIPPING', label: 'Miễn phí ship' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFilterType(t.id)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-bold transition cursor-pointer ${
                    filterType === t.id
                      ? 'bg-accent text-white shadow-xs'
                      : 'bg-surface-2 text-ink-muted hover:text-ink'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <span className="text-[12.5px] text-ink-muted">
              Tổng cộng <strong className="text-ink">{filtered.length}</strong> mã khuyến mãi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-surface-2 text-[11px] font-extrabold uppercase text-ink-muted border-b border-line">
                  <th className="py-3 px-3">MÃ VOUCHER</th>
                  <th className="py-3 px-3">LOẠI GIẢM</th>
                  <th className="py-3 px-3">MỨC GIẢM</th>
                  <th className="py-3 px-3">ĐƠN TỐI THIỂU</th>
                  <th className="py-3 px-3">THỜI GIAN ÁP DỤNG</th>
                  <th className="py-3 px-3">LƯỢT DÙNG</th>
                  <th className="py-3 px-3">TRẠNG THÁI</th>
                  <th className="py-3 px-3 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((coupon) => {
                  const isActive = coupon.isActive !== false;
                  const discountDisplay =
                    coupon.discountType === 'PERCENTAGE'
                      ? `${coupon.discountValue || coupon.discount || 0}%`
                      : coupon.discountType === 'FREE_SHIPPING'
                      ? 'FreeShip'
                      : formatCurrency(coupon.discountValue || coupon.discount || 0);

                  return (
                    <tr
                      key={coupon.id || coupon.code}
                      className="hover:bg-surface-2/60 transition"
                    >
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded bg-accent-soft text-accent font-mono font-bold text-[12.5px] border border-accent/20">
                            {coupon.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-muted mt-1 max-w-[220px] line-clamp-1">
                          {coupon.description || coupon.desc}
                        </p>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-[12px] font-bold text-ink">
                          {coupon.discountType || 'FIXED_AMOUNT'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-bold text-accent">
                          {discountDisplay}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-ink">
                        {formatCurrency(coupon.minOrderAmount || coupon.minOrder || 0)}
                      </td>

                      <td className="py-3.5 px-3 text-[11.5px] text-ink-muted">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span>Từ: {formatDate(coupon.startDate) || '01/01/2026'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400">
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span>Đến: {formatDate(coupon.endDate) || '31/12/2026'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-ink">
                        {coupon.usedCount || 0}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''} lượt
                      </td>

                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleCoupon(coupon)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-surface-2 text-ink-muted border border-line'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Hoạt động</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Đã tạm dừng</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              openModal('admin_coupon_modal', { coupon })
                            }
                            className="p-1.5 rounded-md hover:bg-surface-2 text-ink-muted hover:text-accent transition cursor-pointer border border-line"
                            title="Chỉnh sửa mã khuyến mãi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(coupon)}
                            className="p-1.5 rounded-md hover:bg-danger-soft text-ink-muted hover:text-danger transition cursor-pointer border border-line"
                            title="Xóa mã khuyến mãi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
