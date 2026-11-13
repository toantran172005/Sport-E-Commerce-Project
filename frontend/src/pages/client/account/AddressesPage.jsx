import { Plus, MapPin } from 'lucide-react';
import { useAddress, useUI } from '../../../context';

export default function AddressesPage() {
  const { addresses: userAddresses, setDefaultAddress, deleteAddress } = useAddress();
  const { openModal } = useUI();

  const userAddresses = useMemo(() => {
    const currentUserId = user?.id || 4;
    const effectiveList = addresses && addresses.length > 0 ? addresses : fallbackAddresses;
    const list = effectiveList.filter(
      (a) => !a.userId || a.userId === currentUserId || a.userId === 4 || a.userId === 1
    );
    const resultList = list.length > 0 ? list : effectiveList;

    const defaultIndex = resultList.findIndex((a) => a.isDefault);
    const resolvedDefaultIndex = defaultIndex >= 0 ? defaultIndex : 0;

    return resultList.map((a, idx) => ({
      ...a,
      isDefault: idx === resolvedDefaultIndex,
    }));
  }, [addresses, user?.id]);

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
                    onClick={() => {
                      if (window.confirm('Bạn chắc chắn muốn xóa địa chỉ này?')) deleteAddress(addr.id);
                    }}
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
    </div>
  );
}
