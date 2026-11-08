import { useCallback, useEffect, useState } from 'react';
import { UserCog, Plus, Search, X, RefreshCw, Copy, CheckCircle2, KeyRound } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Pagination from '../../components/common/Pagination';
import { useUI } from '../../context/UIContext.jsx';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/formatters';

const PAGE_SIZE = 10;
const EMPTY_FORM = { fullName: '', email: '', phoneNumber: '' };

const STATUS_LABEL = {
  ACTIVE: { text: 'Hoạt động', cls: 'bg-emerald-500/15 text-emerald-600' },
  LOCKED: { text: 'Đã khóa', cls: 'bg-danger/15 text-danger' },
  PENDING: { text: 'Chờ xác thực', cls: 'bg-amber-500/15 text-amber-600' },
};

function CreateStaffModal({ onClose, onCreated }) {
  const { showToast } = useUI();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await userService.createStaff({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
      });
      setResult(res);
      onCreated();
    } catch (err) {
      showToast(err.message || 'Không thể tạo tài khoản nhân viên');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCredentials = async () => {
    const text = `Email: ${result.user.email}\nMật khẩu tạm: ${result.temporaryPassword}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Đã sao chép thông tin đăng nhập');
    } catch {
      showToast('Không thể sao chép, vui lòng chép thủ công');
    }
  };

  const inputCls =
    'w-full h-10 px-3.5 rounded-md bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface rounded-lg border border-line shadow-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="text-[15px] font-bold text-ink flex items-center gap-2">
            <UserCog className="w-4.5 h-4.5 text-accent" />
            <span>{result ? 'Đã tạo tài khoản nhân viên' : 'Tạo tài khoản nhân viên'}</span>
          </h2>
          <button type="button" onClick={onClose} className="text-ink-subtle hover:text-ink cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {result ? (
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-2 text-emerald-600 text-[13px] font-semibold">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Tài khoản STAFF cho {result.user.fullName} đã được tạo.</span>
            </div>
            <div className="rounded-md bg-page border border-line p-3.5 space-y-1.5 text-[13px]">
              <div>
                <span className="text-ink-muted">Email đăng nhập: </span>
                <b className="text-ink">{result.user.email}</b>
              </div>
              <div className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-accent" />
                <span className="text-ink-muted">Mật khẩu mặc định: </span>
                <b className="text-ink font-mono">{result.temporaryPassword}</b>
              </div>
            </div>
            <p className="text-[12px] text-ink-muted">
              Hãy gửi thông tin này cho nhân viên. Ở lần đăng nhập đầu tiên, nhân viên bắt buộc phải đổi mật khẩu.
              Mật khẩu mặc định sẽ không hiển thị lại sau khi đóng cửa sổ này.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={copyCredentials}
                className="px-4 py-2 rounded-md border border-line text-[13px] font-bold text-ink hover:bg-surface-2 flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-[13px] font-bold cursor-pointer"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-[12.5px] font-bold text-ink mb-1.5">
                Họ và tên <span className="text-danger">*</span>
              </label>
              <input required maxLength={150} value={form.fullName} onChange={setField('fullName')} className={inputCls} placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label className="block text-[12.5px] font-bold text-ink mb-1.5">
                Email <span className="text-danger">*</span>
              </label>
              <input required type="email" value={form.email} onChange={setField('email')} className={inputCls} placeholder="nhanvien@sannha.vn" />
            </div>
            <div>
              <label className="block text-[12.5px] font-bold text-ink mb-1.5">Số điện thoại</label>
              <input value={form.phoneNumber} onChange={setField('phoneNumber')} className={inputCls} placeholder="0901234567 (không bắt buộc)" />
            </div>
            <p className="text-[12px] text-ink-muted">
              Tài khoản được tạo với vai trò <b>STAFF</b> và mật khẩu mặc định của hệ thống. Nhân viên sẽ phải đổi mật
              khẩu ở lần đăng nhập đầu tiên.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md border border-line text-[13px] font-bold text-ink hover:bg-surface-2 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-[13px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{submitting ? 'Đang tạo...' : 'Tạo tài khoản'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminStaffPage() {
  const { showToast } = useUI();
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ content: [], totalPages: 1, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Chờ người dùng gõ xong 350ms rồi mới gọi API tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [keyword]);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getStaff({ keyword: debouncedKeyword, page, size: PAGE_SIZE });
      setData(res);
    } catch (err) {
      showToast(err.message || 'Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, page, showToast]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  return (
    <AdminLayout searchPlaceholder="Tìm nhân viên theo tên, email, SĐT..." onSearchChange={setKeyword}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-extrabold text-ink flex items-center gap-2">
              <UserCog className="w-5 h-5 text-accent" />
              <span>Tài Khoản Nhân Viên</span>
            </h1>
            <p className="text-[12.5px] text-ink-muted mt-0.5">
              {data.totalElements} nhân viên · Tài khoản mới dùng mật khẩu mặc định và phải đổi ở lần đăng nhập đầu
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="px-4 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-white text-[13px] font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Nhân Viên</span>
          </button>
        </div>

        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại..."
            className="w-full h-10 pl-9 pr-3 rounded-md bg-surface border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
          />
        </div>

        <div className="bg-surface rounded-lg border border-line overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-surface-2 text-ink-muted text-[12px] uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 font-bold">Họ tên</th>
                <th className="px-4 py-3 font-bold">Email</th>
                <th className="px-4 py-3 font-bold">SĐT</th>
                <th className="px-4 py-3 font-bold">Trạng thái</th>
                <th className="px-4 py-3 font-bold">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : data.content.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                    Chưa có nhân viên nào. Nhấn "Tạo Nhân Viên" để thêm tài khoản mới.
                  </td>
                </tr>
              ) : (
                data.content.map((u) => {
                  const st = STATUS_LABEL[u.status] || { text: u.status, cls: 'bg-surface-2 text-ink-muted' };
                  return (
                    <tr key={u.id} className="hover:bg-surface-2/50">
                      <td className="px-4 py-3 font-semibold text-ink">{u.fullName}</td>
                      <td className="px-4 py-3 text-ink-muted">{u.email}</td>
                      <td className="px-4 py-3 text-ink-muted">{u.phoneNumber || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${st.cls}`}>{st.text}</span>
                          {u.mustChangePassword && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600">
                              Chờ đổi mật khẩu
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{u.createdAt ? formatDate(u.createdAt) : '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {data.totalPages > 1 && (
          <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
        )}
      </div>

      {showCreate && (
        <CreateStaffModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setPage(0);
            loadStaff();
          }}
        />
      )}
    </AdminLayout>
  );
}
