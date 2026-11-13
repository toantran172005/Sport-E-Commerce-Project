import { useState, useEffect } from 'react';
import { MapPin, X, Plus } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';

export default function AddressModal() {
  const {
    activeModal,
    modalPayload,
    closeModal,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    addAddress,
    updateAddress,
    showToast,
  } = useStore();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('TP. Hồ Chí Minh');
  const [district, setDistrict] = useState('Quận Gò Vấp');
  const [ward, setWard] = useState('Phường 4');
  const [addressLine, setAddressLine] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (activeModal === 'address_modal' && modalPayload?.address) {
      const a = modalPayload.address;
      setRecipientName(a.recipientName || a.name || '');
      setPhoneNumber(a.phoneNumber || a.phone || '');
      setAddressLine(a.addressLine || a.streetAddress || '');
      setCity(a.city || a.province || 'TP. Hồ Chí Minh');
      setDistrict(a.district || 'Quận Gò Vấp');
      setWard(a.ward || 'Phường 4');
      setIsDefault(Boolean(a.isDefault));
      setIsAddingNew(true);
    } else if (activeModal === 'address_modal') {
      setIsAddingNew(false);
      setRecipientName('');
      setPhoneNumber('');
      setAddressLine('');
    }
  }, [activeModal, modalPayload]);

  if (activeModal !== 'address_modal') return null;

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!recipientName.trim() || !phoneNumber.trim() || !addressLine.trim()) {
      showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    try {
      const payload = {
        recipientName: recipientName.trim(),
        phoneNumber: phoneNumber.trim(),
        city,
        district,
        ward,
        addressLine: addressLine.trim(),
        isDefault,
      };
      const editingId = modalPayload?.address?.id;
      if (editingId) {
        await updateAddress(editingId, payload);
        closeModal();
        return;
      }
      await addAddress(payload);
      setIsAddingNew(false);
      setRecipientName('');
      setPhoneNumber('');
      setAddressLine('');
    } catch (err) {
      showToast(err.message || 'Lỗi khi thêm địa chỉ', 'error');
    }
  };

  const handleSelectAddress = (id) => {
    setSelectedAddressId(id);
    showToast('Đã chọn địa chỉ giao hàng', 'success');
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-surface rounded-lg w-full max-w-[560px] shadow-2xl border border-line overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-accent-soft dark:bg-accent/20 text-accent flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">
                Địa Chỉ Nhận Hàng
              </h2>
              <p className="text-[12px] text-ink-subtle">
                Chọn địa chỉ giao hàng hoặc thêm địa chỉ mới
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="w-8 h-8 rounded-md bg-surface-2 dark:bg-surface-2 text-slate-500 hover:text-slate-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {!isAddingNew ? (
            <>
              {/* Existing Address List */}
              <div className="space-y-2.5">
                {addresses.map((addr) => {
                  const isSelected = addr.id === selectedAddressId;
                  const name = addr.recipientName || addr.name;
                  const phone = addr.phoneNumber || addr.phone;
                  const full = addr.addressLine
                    ? `${addr.addressLine}, ${addr.ward}, ${addr.district}, ${addr.city}`
                    : addr.fullAddress;

                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-3.5 rounded-md border flex items-start justify-between gap-3 cursor-pointer transition ${
                        isSelected
                          ? 'border-accent bg-accent-soft dark:bg-accent/10'
                          : 'border-line bg-surface hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full mt-0.5 flex items-center justify-center border shrink-0 ${
                            isSelected
                              ? 'border-accent bg-accent'
                              : 'border-slate-400 bg-surface'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-surface" />}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[13px] font-bold text-ink">
                              {name} · {phone}
                            </span>
                            {addr.isDefault && (
                              <span className="px-2 py-0.2 rounded text-[10.5px] font-bold bg-accent-soft text-accent">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-[12px] text-ink-muted dark:text-slate-300 mt-1">
                            {full}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Button Trigger */}
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="w-full py-2.5 rounded-md border border-dashed border-accent text-accent hover:bg-accent-soft/40 text-[12.5px] font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm địa chỉ giao hàng mới</span>
              </button>
            </>
          ) : (
            /* New Address Form */
            <form onSubmit={handleAddNewAddress} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Họ và tên người nhận *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full h-8.5 px-3 rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line text-[12px] focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full h-8.5 px-3 rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line text-[12px] focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tỉnh / Thành phố
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-8.5 px-2.5 rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line text-[12px] focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Quận / Huyện
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full h-8.5 px-2.5 rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line text-[12px] focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phường / Xã
                  </label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full h-8.5 px-2.5 rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line text-[12px] focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Địa chỉ cụ thể (Số nhà, tên đường, tòa nhà) *
                </label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Ví dụ: 12 Nguyễn Văn Bảo, Phường 4"
                  className="w-full h-8.5 px-3 rounded-md bg-page dark:bg-surface-2 border border-line dark:border-line text-[12px] focus:outline-none focus:border-accent"
                />
              </div>

              <label className="flex items-center gap-2 text-[12px] text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-accent focus:ring-[#2f6bff]"
                />
                <span>Đặt làm địa chỉ nhận hàng mặc định</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 rounded-md border border-line text-[12px] font-bold"
                >
                  Quay lại danh sách
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-[12px] font-bold"
                >
                  Lưu địa chỉ
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!isAddingNew && (
          <div className="px-5 py-3 border-t border-line bg-page dark:bg-surface flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-md bg-surface border border-line text-slate-700 dark:text-slate-300 text-[12.5px] font-bold hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => handleSelectAddress(selectedAddressId)}
              className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-[12.5px] font-bold shadow-xs transition"
            >
              Giao đến địa chỉ này
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
