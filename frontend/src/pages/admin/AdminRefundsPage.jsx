import { useCallback, useEffect, useState } from 'react';
import { Banknote, CheckCircle2, RefreshCw } from 'lucide-react';
import { useUI } from '@/context';
import AdminLayout from '../../layouts/AdminLayout';
import { refundService } from '../../services/refundService';
import { useLiveRefresh } from '../../hooks/useLiveRefresh.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const TABS = [
  { key: false, label: 'Chờ hoàn tiền' },
  { key: true, label: 'Đã hoàn tiền' },
];

export default function AdminRefundsPage() {
  const { showToast, showConfirmModal } = useUI();
  const [refunded, setRefunded] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState({});
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await refundService.getRefunds(refunded));
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách hoàn tiền');
    } finally {
      setLoading(false);
    }
  }, [refunded]);

  useEffect(() => {
    load();
  }, [load]);

  // Có đơn hủy/hoàn trả mới cần hoàn tiền: tự tải lại danh sách
  useLiveRefresh('refunds', load);

  const handleMarkRefunded = (item) => {
    showConfirmModal({
      title: 'Xác nhận đã hoàn tiền',
      message: `Xác nhận bạn đã hoàn ${formatCurrency(item.amount)} cho khách của đơn ${item.orderCode}? Thao tác này không thể hoàn tác.`,
      confirmText: 'Đã hoàn tiền',
      onConfirm: async () => {
        setBusyId(item.paymentId);
        try {
          await refundService.markRefunded(item.paymentId, notes[item.paymentId]);
          setItems((prev) => prev.filter((i) => i.paymentId !== item.paymentId));
          showToast('Đã xác nhận hoàn tiền', 'success');
        } catch (err) {
          showToast(err.message || 'Không thể xác nhận hoàn tiền', 'error');
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  return (
    <AdminLayout searchPlaceholder="Hoàn tiền cho khách hàng">
      <div className="space-y-6 text-ink">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-extrabold text-ink flex items-center gap-2">
              <Banknote className="w-6 h-6 text-accent" />
              <span>Hoàn Tiền Cho Khách</span>
            </h1>
            <p className="text-[13px] text-ink-muted mt-0.5">
              Đơn đã thanh toán nhưng bị hủy hoặc trả hàng. Hoàn tiền cho khách rồi bấm xác nhận.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="px-3 py-2 rounded-md border border-line text-[12.5px] font-bold text-ink-muted hover:text-accent hover:border-accent transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Tải lại
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-line">
          {TABS.map((tab) => (
            <button
              key={String(tab.key)}
              type="button"
              onClick={() => setRefunded(tab.key)}
              className={`px-4 py-2 text-[13px] font-bold border-b-2 -mb-px transition cursor-pointer ${
                refunded === tab.key
                  ? 'border-accent text-accent'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && <p className="text-[13px] text-danger">{error}</p>}

        <div className="bg-surface rounded-xl border border-line overflow-x-auto shadow-2xs">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="text-[11px] font-extrabold uppercase text-ink-muted border-b border-line">
                <th className="py-3 px-3">Đơn hàng</th>
                <th className="py-3 px-3">Khách hàng</th>
                <th className="py-3 px-3">Số tiền</th>
                <th className="py-3 px-3">Phương thức / Mã GD</th>
                <th className="py-3 px-3">{refunded ? 'Đã hoàn lúc / Ghi chú' : 'Đã thu lúc'}</th>
                {!refunded && <th className="py-3 px-3 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((item) => (
                <tr key={item.paymentId} className="hover:bg-surface-2/60 transition">
                  <td className="py-3 px-3">
                    <p className="font-mono font-bold text-accent">{item.orderCode}</p>
                    <p className="text-[11px] text-ink-muted">{item.orderStatus}</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-ink">{item.customerName || '—'}</p>
                    <p className="text-[11.5px] text-ink-muted">{item.customerEmail}</p>
                    {item.customerPhone && (
                      <p className="text-[11.5px] text-ink-muted">{item.customerPhone}</p>
                    )}
                  </td>
                  <td className="py-3 px-3 font-bold text-ink">{formatCurrency(item.amount)}</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-ink">{item.method}</p>
                    <p className="text-[11.5px] text-ink-muted font-mono">{item.transactionCode || '—'}</p>
                  </td>
                  <td className="py-3 px-3 text-[12px] text-ink-muted">
                    {refunded ? (
                      <>
                        <p>{formatDateTime(item.refundedAt)}</p>
                        <p>{item.refundNote || '—'}</p>
                      </>
                    ) : (
                      formatDateTime(item.paidAt)
                    )}
                  </td>
                  {!refunded && (
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="text"
                          maxLength={255}
                          value={notes[item.paymentId] || ''}
                          onChange={(e) =>
                            setNotes((prev) => ({ ...prev, [item.paymentId]: e.target.value }))
                          }
                          placeholder="Ghi chú (mã GD hoàn tiền...)"
                          className="h-8 w-44 px-2.5 rounded-md bg-page border border-line text-[12px] text-ink focus:outline-none focus:border-accent"
                        />
                        <button
                          type="button"
                          onClick={() => handleMarkRefunded(item)}
                          disabled={busyId === item.paymentId}
                          className="px-3 h-8 rounded-md bg-accent hover:bg-accent-hover text-white text-[12px] font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã hoàn tiền
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={refunded ? 5 : 6} className="py-10 text-center text-ink-muted">
                    {refunded ? 'Chưa có khoản nào được hoàn tiền.' : 'Không có khoản nào đang chờ hoàn tiền.'}
                  </td>
                </tr>
              )}
              {loading && items.length === 0 && (
                <tr>
                  <td colSpan={refunded ? 5 : 6} className="py-10 text-center text-ink-muted">
                    Đang tải...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
