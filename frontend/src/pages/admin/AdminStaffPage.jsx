import { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Lock,
  Unlock,
  Edit2,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatDateTime } from '../../utils/formatters';
import Pagination from '../../components/common/Pagination';
import AdminLayout from '../../layouts/AdminLayout';

const ITEMS_PER_PAGE = 8;

export default function AdminStaffPage() {
  const {
    staffMembers = [],
    setStaffStatus,
    removeStaff,
    openModal,
    showConfirmModal,
    showToast,
  } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);

  // Compute stats
  const totalCount = staffMembers.length;
  const activeCount = useMemo(
    () => staffMembers.filter((s) => s.status === 'ACTIVE').length,
    [staffMembers]
  );
  const lockedCount = totalCount - activeCount;

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    let list = [...staffMembers];

    if (statusFilter !== 'ALL') {
      list = list.filter((s) => s.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          (s.phone && s.phone.includes(q))
      );
    }

    return list;
  }, [staffMembers, statusFilter, search]);

  const totalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE) || 1;
  const paginatedStaff = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return filteredStaff.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStaff, currentPage]);

  const handleToggleStatus = (staff) => {
    const nextStatus = staff.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    const actionLabel = nextStatus === 'ACTIVE' ? 'mở khóa' : 'khóa';

    showConfirmModal({
      title: `${nextStatus === 'ACTIVE' ? 'Mở khóa' : 'Khóa'} tài khoản nhân viên`,
      message: `Bạn có chắc chắn muốn ${actionLabel} quyền truy cập của nhân viên "${staff.name}" (${staff.email})?`,
      confirmText: nextStatus === 'ACTIVE' ? 'Mở khóa ngay' : 'Khóa tài khoản',
      confirmVariant: nextStatus === 'ACTIVE' ? 'primary' : 'warning',
      onConfirm: () => {
        setStaffStatus(staff.id, nextStatus);
        showToast(`Đã ${actionLabel} thành công tài khoản ${staff.name}`, 'success');
      },
    });
  };

  const handleDeleteStaff = (staff) => {
    showConfirmModal({
      title: 'Xóa nhân viên vĩnh viễn',
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn nhân viên "${staff.name}" (${staff.email}) khỏi hệ thống? Thao tác này không thể hoàn tác.`,
      confirmText: 'Xóa vĩnh viễn',
      confirmVariant: 'danger',
      onConfirm: () => {
        removeStaff(staff.id);
        showToast(`Đã xóa nhân viên ${staff.name}`, 'info');
      },
    });
  };

  return (
    <AdminLayout
      searchPlaceholder="Tìm kiếm nhân viên theo tên, email hoặc SĐT..."
      onSearchChange={setSearch}
    >
      <div className="space-y-6 text-ink">
        {/* Page Title & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-line">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-ink flex items-center gap-2">
              <Users className="w-6 h-6 text-accent" />
              <span>Quản Lý Nhân Viên</span>
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Danh sách tài khoản nhân viên (STAFF) phụ trách xử lý đơn hàng, hỗ trợ khách hàng và vận hành.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openModal('admin_staff_modal', { mode: 'create' })}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-bold shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm nhân viên mới</span>
          </button>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-surface border border-line flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-semibold text-ink-muted uppercase">Tổng số nhân viên</p>
              <p className="text-2xl font-black text-ink mt-0.5">{totalCount}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-line flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-semibold text-ink-muted uppercase">Đang hoạt động</p>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">{activeCount}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-line flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-semibold text-ink-muted uppercase">Đã khóa</p>
              <p className="text-2xl font-black text-amber-600 mt-0.5">{lockedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3.5 bg-surface rounded-xl border border-line flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(0);
              }}
              placeholder="Tìm theo họ tên, email hoặc SĐT nhân viên..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-surface-2 border border-line rounded-lg text-ink placeholder:text-ink-subtle focus:outline-hidden focus:border-accent focus:bg-surface transition-all"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-2 rounded-lg border border-line/70 self-start md:self-auto">
            {[
              { id: 'ALL', label: `Tất cả (${totalCount})` },
              { id: 'ACTIVE', label: `Hoạt động (${activeCount})` },
              { id: 'LOCKED', label: `Đã khóa (${lockedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(0);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-surface text-ink shadow-xs border border-line/60'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-surface rounded-xl border border-line overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-surface-2 text-ink-muted uppercase font-bold text-[11px] tracking-wider border-b border-line">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Nhân viên</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Ngày tạo / Đăng nhập</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {paginatedStaff.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-ink-muted">
                      Không tìm thấy nhân viên nào phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  paginatedStaff.map((staff, idx) => {
                    const globalIdx = currentPage * ITEMS_PER_PAGE + idx + 1;
                    const isLocked = staff.status === 'LOCKED';

                    return (
                      <tr
                        key={staff.id}
                        className="hover:bg-surface-2/60 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-center font-bold text-ink-subtle">
                          {globalIdx}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 text-accent font-black flex items-center justify-center text-sm shrink-0">
                              {staff.name ? staff.name.charAt(0).toUpperCase() : 'N'}
                            </div>
                            <div>
                              <p className="font-bold text-ink line-clamp-1">{staff.name}</p>
                              <p className="text-[11.5px] text-ink-muted">{staff.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-ink-muted">
                          {staff.phone || 'Chưa cập nhật'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isLocked
                                ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isLocked ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                            />
                            {isLocked ? 'Đã khóa' : 'Đang hoạt động'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-ink-muted">
                          <div>
                            Tạo: {staff.createdAt ? formatDateTime(staff.createdAt) : 'N/A'}
                          </div>
                          <div className="text-[11px] text-ink-subtle">
                            Đăng nhập: {staff.lastLoginAt ? formatDateTime(staff.lastLoginAt) : 'Chưa'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openModal('admin_staff_modal', { mode: 'edit', staff })}
                              title="Chỉnh sửa thông tin"
                              className="p-1.5 rounded-md text-ink-muted hover:text-accent hover:bg-surface-2 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(staff)}
                              title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                isLocked
                                  ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                  : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                              }`}
                            >
                              {isLocked ? (
                                <Unlock className="w-4 h-4" />
                              ) : (
                                <Lock className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteStaff(staff)}
                              title="Xóa nhân viên"
                              className="p-1.5 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-line flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-ink-muted">
                Hiển thị {paginatedStaff.length} / {filteredStaff.length} nhân viên
              </span>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
