import { useState, useEffect, useCallback } from 'react';
import { MapPin, X, Plus } from 'lucide-react';
import { useUI, useAddress } from '@/context';
import { locationService } from '../../services/locationService.js';
import { formatFullAddress, stripAdminPrefix } from '../../utils/address.js';
import LocationSelect from './LocationSelect.jsx';

/** Tìm mục có tên khớp (bỏ tiền tố Tỉnh/Quận/Phường, không dấu) để điền sẵn địa chỉ cũ chưa có mã GHN. */
function findByName(options, name) {
  const target = stripAdminPrefix(name);
  if (!target) return null;
  return options.find((o) => [o.name, ...(o.aliases || [])].some((n) => stripAdminPrefix(n) === target)) || null;
}

export default function AddressModal() {
  const { activeModal, modalPayload, closeModal, showToast } = useUI();
  const {
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    addAddress,
    updateAddress,
  } = useAddress();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  // Mô hình địa chỉ: NEW = Tỉnh > Phường/Xã (từ 01/07/2025), OLD = Tỉnh > Quận/Huyện > Phường/Xã
  const [scheme, setScheme] = useState('NEW');
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [province, setProvince] = useState(null);
  const [district, setDistrict] = useState(null);
  const [ward, setWard] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState({ province: false, district: false, ward: false });
  const [locError, setLocError] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const setLoading = (key, value) => setLoadingLoc((prev) => ({ ...prev, [key]: value }));

  const resetLocation = useCallback(() => {
    setProvince(null);
    setDistrict(null);
    setWard(null);
    setProvinces([]);
    setDistricts([]);
    setWards([]);
  }, []);

  const loadProvinces = useCallback(async (sch) => {
    setLoading('province', true);
    setLocError('');
    try {
      const list = await locationService.getProvinces(sch);
      setProvinces(list);
      return list;
    } catch (err) {
      setProvinces([]);
      setLocError(err?.message || 'Không tải được danh sách Tỉnh/Thành');
      return [];
    } finally {
      setLoading('province', false);
    }
  }, []);

  const loadDistricts = useCallback(async (provinceId) => {
    setLoading('district', true);
    try {
      const list = await locationService.getDistricts(provinceId);
      setDistricts(list);
      return list;
    } catch (err) {
      setDistricts([]);
      setLocError(err?.message || 'Không tải được danh sách Quận/Huyện');
      return [];
    } finally {
      setLoading('district', false);
    }
  }, []);

  const loadWards = useCallback(async (sch, provinceId, districtId) => {
    setLoading('ward', true);
    try {
      const list = await locationService.getWards({ scheme: sch, provinceId, districtId });
      setWards(list);
      return list;
    } catch (err) {
      setWards([]);
      setLocError(err?.message || 'Không tải được danh sách Phường/Xã');
      return [];
    } finally {
      setLoading('ward', false);
    }
  }, []);

  const handleSchemeChange = (next) => {
    if (next === scheme) return;
    setScheme(next);
    resetLocation();
    loadProvinces(next);
  };

  const handleProvinceChange = (option) => {
    setProvince(option);
    setDistrict(null);
    setWard(null);
    setDistricts([]);
    setWards([]);
    if (!option) return;
    if (scheme === 'OLD') loadDistricts(option.id);
    else loadWards('NEW', option.id);
  };

  const handleDistrictChange = (option) => {
    setDistrict(option);
    setWard(null);
    setWards([]);
    if (option) loadWards('OLD', province?.id, option.id);
  };

  /** Điền sẵn Tỉnh/Quận/Phường khi sửa địa chỉ: ưu tiên mã GHN đã lưu, nếu chưa có thì khớp theo tên. */
  const prefillLocation = useCallback(
    async (a) => {
      const sch = a.addressScheme === 'NEW' ? 'NEW' : 'OLD';
      setScheme(sch);
      resetLocation();
      const provList = await loadProvinces(sch);
      const prov =
        (a.ghnProvinceId != null && provList.find((o) => String(o.id) === String(a.ghnProvinceId))) ||
        findByName(provList, a.city || a.province);
      if (!prov) return;
      setProvince(prov);

      let distId = null;
      if (sch === 'OLD') {
        const distList = await loadDistricts(prov.id);
        const dist =
          (a.ghnDistrictId != null && distList.find((o) => String(o.id) === String(a.ghnDistrictId))) ||
          findByName(distList, a.district);
        if (!dist) return;
        setDistrict(dist);
        distId = dist.id;
      }
      const wardList = await loadWards(sch, prov.id, distId);
      const w =
        (a.ghnWardCode && wardList.find((o) => String(o.id) === String(a.ghnWardCode))) ||
        findByName(wardList, a.ward);
      if (w) setWard(w);
    },
    [loadProvinces, loadDistricts, loadWards, resetLocation]
  );

  useEffect(() => {
    if (activeModal === 'address_modal' && modalPayload?.address) {
      const a = modalPayload.address;
      setRecipientName(a.recipientName || a.name || '');
      setPhoneNumber(a.phoneNumber || a.phone || '');
      setAddressLine(a.addressLine || a.streetAddress || '');
      setIsDefault(Boolean(a.isDefault));
      setIsAddingNew(true);
      prefillLocation(a);
    } else if (activeModal === 'address_modal') {
      setIsAddingNew(false);
      setRecipientName('');
      setPhoneNumber('');
      setAddressLine('');
      setScheme('NEW');
      resetLocation();
    }
  }, [activeModal, modalPayload, prefillLocation, resetLocation]);

  // Mở form thêm mới: tải sẵn danh sách Tỉnh/Thành của mô hình đang chọn
  useEffect(() => {
    if (activeModal === 'address_modal' && isAddingNew && !modalPayload?.address && provinces.length === 0) {
      loadProvinces(scheme);
    }
  }, [activeModal, isAddingNew, modalPayload, provinces.length, scheme, loadProvinces]);

  if (activeModal !== 'address_modal') return null;

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!recipientName.trim() || !phoneNumber.trim() || !addressLine.trim()) {
      showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }
    if (!province || (scheme === 'OLD' && !district) || !ward) {
      showToast(
        scheme === 'OLD'
          ? 'Vui lòng chọn Tỉnh/Thành, Quận/Huyện và Phường/Xã từ danh sách'
          : 'Vui lòng chọn Tỉnh/Thành và Phường/Xã từ danh sách',
        'error'
      );
      return;
    }

    try {
      const payload = {
        recipientName: recipientName.trim(),
        phoneNumber: phoneNumber.trim(),
        addressScheme: scheme,
        city: province.name,
        district: scheme === 'OLD' ? district.name : null,
        ward: ward.name,
        ghnProvinceId: Number(province.id),
        ghnDistrictId: scheme === 'OLD' ? Number(district.id) : null,
        ghnWardCode: String(ward.id),
        addressLine: addressLine.trim(),
        isDefault,
      };
      const editingId = modalPayload?.address?.id;
      if (editingId) {
        await updateAddress(editingId, payload);
        closeModal();
        return;
      }
      const created = await addAddress(payload);
      if (created?.id) {
        setSelectedAddressId(created.id);
      }
      closeModal();
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
                  const full = formatFullAddress(addr) || addr.fullAddress;

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

              <div>
                <div className="flex items-center gap-4 text-[12px] text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">Kiểu địa chỉ:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="address-scheme"
                      checked={scheme === 'NEW'}
                      onChange={() => handleSchemeChange('NEW')}
                    />
                    <span>Địa chỉ mới (Tỉnh, Phường/Xã)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="address-scheme"
                      checked={scheme === 'OLD'}
                      onChange={() => handleSchemeChange('OLD')}
                    />
                    <span>Địa chỉ cũ (Tỉnh, Quận/Huyện, Phường/Xã)</span>
                  </label>
                </div>
                <p className="text-[11px] text-ink-subtle mt-1">
                  Chọn đúng kiểu địa chỉ bạn đang dùng. Dữ liệu lấy từ danh mục của đơn vị vận chuyển nên vận đơn được tạo chính xác.
                </p>
              </div>

              <div className={`grid gap-2 ${scheme === 'OLD' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <LocationSelect
                  label="Tỉnh / Thành phố"
                  required
                  value={province?.id ?? ''}
                  options={provinces}
                  loading={loadingLoc.province}
                  placeholder="Gõ để tìm tỉnh/thành"
                  onChange={handleProvinceChange}
                />
                {scheme === 'OLD' && (
                  <LocationSelect
                    label="Quận / Huyện"
                    required
                    value={district?.id ?? ''}
                    options={districts}
                    loading={loadingLoc.district}
                    disabled={!province}
                    placeholder="Gõ để tìm quận/huyện"
                    onChange={handleDistrictChange}
                  />
                )}
                <LocationSelect
                  label="Phường / Xã"
                  required
                  value={ward?.id ?? ''}
                  options={wards}
                  loading={loadingLoc.ward}
                  disabled={scheme === 'OLD' ? !district : !province}
                  placeholder="Gõ để tìm phường/xã"
                  onChange={setWard}
                />
              </div>
              {locError && <p className="text-[11.5px] text-red-600">{locError}</p>}

              <div>
                <label className="block text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Địa chỉ cụ thể (Số nhà, tên đường, tòa nhà) *
                </label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Số nhà, tên đường (không cần ghi lại Phường, Quận)"
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
