import { useState } from 'react';
import { Plus, MapPin, Trash2, AlertTriangle } from 'lucide-react';
import { useAddress, useUI } from '../../../context';

export default function AddressesPage() {
  const { addresses: userAddresses, setDefaultAddress, deleteAddress } = useAddress();
  const { openModal } = useUI();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAddress(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      /* ignore */
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-line p-6 space-y-5 shadow-2xs">
      <div className="flex items-center justify-between pb-4 border-b border-line">
        <div>
          <h2 className="text-[17px] font-bold text-ink">Sổ Địa Chỉ Nhận Hàng</h2>
          <p className="text-[12.5px] text-ink-muted">
            Quản lý danh sách địa chỉ giao hàng của bạn để thanh toán nhanh hơn
          </p>
        </div>

        <button
          type="button"
          onClick={() => openModal('address_modal')}
          className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm địa chỉ mới</span>
        </button>
      </div>

      <div className="space-y-3">
        {userAddresses.length === 0 ? (
          <div className="py-12 text-center text-ink-muted text-[13px]">
            Bạn chưa lưu địa chỉ giao hàng nào.
          </div>
        ) : (
          userAddresses.map((addr) => {
            const name = addr.recipientName || addr.name || addr.receiverName;
            const phone = addr.phoneNumber || addr.phone;
            const full =
              addr.fullAddress ||
              `${addr.streetAddress || addr.addressLine || ''}, ${addr.ward || ''}, ${addr.district || ''}, ${addr.province || addr.city || ''}`;

            return (
              <div
                key={addr.id}
                className={`p-4 rounded-md border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                  addr.isDefault
                    ? 'border-accent/40 bg-accent-soft/10'
                    : 'border-line bg-surface hover:border-accent/30'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-ink">{name}</span>
                    <span className="text-ink-subtle">|</span>
                    <span className="text-[13px] text-ink-muted">{phone}</span>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-accent-soft text-accent border border-accent/20">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-ink-muted flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                    <span>{full}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => setDefaultAddress(addr.id)}
                      className="px-3 py-1.5 rounded-md border border-line text-[12px] font-bold text-ink hover:border-accent hover:text-accent transition cursor-pointer"
                    >
                      Thiết lập mặc định
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openModal('address_modal', { address: addr })}
                    className="px-3 py-1.5 rounded-md text-[12px] font-bold text-accent hover:underline cursor-pointer"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(addr)}
                    className="px-3 py-1.5 rounded-md text-[12px] font-bold text-danger hover:underline cursor-pointer"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal xác nhận xóa địa chỉ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-surface rounded-xl p-6 max-w-md w-full border border-line shadow-2xl space-y-4 animate-scaleIn text-ink">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-danger-soft text-danger flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-ink">Xác nhận xóa địa chỉ</h3>
                <p className="text-[12.5px] text-ink-muted">
                  Bạn có chắc chắn muốn xóa địa chỉ của <strong>{deleteTarget.recipientName || deleteTarget.name}</strong>?
                </p>
              </div>
            </div>

            <p className="text-[12px] text-ink-muted bg-surface-2 p-3 rounded-lg border border-line">
              📍 {deleteTarget.fullAddress || `${deleteTarget.addressLine || ''}, ${deleteTarget.ward || ''}, ${deleteTarget.district || ''}, ${deleteTarget.city || ''}`}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-line">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-line text-[12.5px] font-bold text-ink hover:bg-surface-2 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-danger hover:bg-danger-hover text-white text-[12.5px] font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
