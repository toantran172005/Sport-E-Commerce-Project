import { useCallback, useEffect, useState } from 'react';
import { MonitorSmartphone, Smartphone, Monitor, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { userService } from '../../../services/userService';
import { formatDateTime } from '../../../utils/formatters';

const SESSION_LIMIT_BY_ROLE = { CUSTOMER: 5, STAFF: 2, ADMIN: 1 };

function DeviceIcon({ name = '' }) {
  const mobile = /android|ios/i.test(name);
  const Icon = mobile ? Smartphone : Monitor;
  return <Icon className="w-5 h-5 text-accent" />;
}

export default function DevicesPage() {
  const { user, showToast, showConfirmModal } = useStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const limit = SESSION_LIMIT_BY_ROLE[user?.role] ?? 5;

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await userService.getSessions();
      setSessions(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleRevoke = (session) => {
    showConfirmModal({
      title: 'Đăng xuất thiết bị',
      message: `Đăng xuất "${session.deviceName}" (IP ${session.ipAddress || 'không rõ'}) khỏi tài khoản?`,
      confirmText: 'Đăng xuất thiết bị',
      confirmVariant: 'danger',
      onConfirm: async () => {
        setBusyId(session.id);
        try {
          await userService.revokeSession(session.id);
          setSessions((prev) => prev.filter((s) => s.id !== session.id));
          showToast('Đã đăng xuất thiết bị', 'success');
        } catch (err) {
          showToast(err.message || 'Không thể đăng xuất thiết bị', 'error');
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const handleRevokeOthers = () => {
    showConfirmModal({
      title: 'Đăng xuất các thiết bị khác',
      message: 'Tất cả thiết bị khác sẽ bị đăng xuất. Thiết bị này vẫn giữ đăng nhập.',
      confirmText: 'Đăng xuất tất cả thiết bị khác',
      confirmVariant: 'danger',
      onConfirm: async () => {
        setBusyId('all');
        try {
          await userService.revokeOtherSessions();
          setSessions((prev) => prev.filter((s) => s.current));
          showToast('Đã đăng xuất các thiết bị khác', 'success');
        } catch (err) {
          showToast(err.message || 'Không thể đăng xuất các thiết bị khác', 'error');
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const otherCount = sessions.filter((s) => !s.current).length;

  return (
    <div className="bg-surface rounded-lg border border-line p-6 space-y-5 shadow-2xs">
      <div className="border-b border-line pb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold text-ink flex items-center gap-2">
            <MonitorSmartphone className="w-5 h-5 text-accent" />
            <span>Thiết Bị Đăng Nhập</span>
          </h2>
          <p className="text-[12.5px] text-ink-muted mt-0.5">
            Tài khoản của bạn được đăng nhập tối đa trên {limit} thiết bị cùng lúc. Đăng nhập thêm thiết bị mới sẽ
            tự đăng xuất thiết bị cũ nhất.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSessions}
          disabled={loading}
          className="px-3 py-2 rounded-md border border-line text-[12.5px] font-bold text-ink-muted hover:text-accent hover:border-accent transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Tải lại
        </button>
      </div>

      {error && <p className="text-[13px] text-danger">{error}</p>}

      {loading && sessions.length === 0 ? (
        <p className="text-[13px] text-ink-muted">Đang tải danh sách thiết bị...</p>
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => (
            <li
              key={s.id}
              className={`p-4 rounded-md border flex items-center justify-between gap-3 ${
                s.current ? 'border-accent bg-accent-soft' : 'border-line bg-page'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <DeviceIcon name={s.deviceName} />
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold text-ink flex items-center gap-2 flex-wrap">
                    {s.deviceName}
                    {s.current && (
                      <span className="px-1.5 py-0.5 rounded text-[10.5px] font-bold bg-accent text-white flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Thiết bị này
                      </span>
                    )}
                  </p>
                  <p className="text-[12px] text-ink-muted">
                    IP {s.ipAddress || 'không rõ'} · Hoạt động gần nhất {formatDateTime(s.lastUsedAt)}
                  </p>
                </div>
              </div>
              {!s.current && (
                <button
                  type="button"
                  onClick={() => handleRevoke(s)}
                  disabled={busyId === s.id || busyId === 'all'}
                  className="shrink-0 px-3 py-1.5 rounded-md border border-line text-[12px] font-bold text-danger hover:bg-danger-soft transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Đăng xuất
                </button>
              )}
            </li>
          ))}
          {sessions.length === 0 && !error && (
            <li className="text-[13px] text-ink-muted">Không có thiết bị nào đang đăng nhập.</li>
          )}
        </ul>
      )}

      {otherCount > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={handleRevokeOthers}
            disabled={busyId === 'all'}
            className="px-5 py-2.5 rounded-md bg-danger hover:opacity-90 text-white text-[13px] font-bold shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất tất cả thiết bị khác ({otherCount})
          </button>
        </div>
      )}
    </div>
  );
}
