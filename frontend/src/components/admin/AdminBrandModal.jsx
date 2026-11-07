import { useState, useEffect, useRef } from 'react';
import { X, Upload, Tag } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';

function generateSlug(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export default function AdminBrandModal() {
  const {
    activeModal,
    modalPayload,
    closeModal,
    addBrand,
    updateBrand,
    showToast,
  } = useStore();

  const editBrand = modalPayload?.brand;
  const isEditing = Boolean(editBrand);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [_logoFile, setLogoFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);
  const isManualSlug = useRef(false);

  useEffect(() => {
    if (activeModal === 'admin_brand_modal') {
      if (editBrand) {
        setName(editBrand.name || '');
        setSlug(editBrand.slug || '');
        setDescription(editBrand.description || '');
        setLogoUrl(editBrand.logoUrl || '');
        setLogoFile(null);
        isManualSlug.current = true;
      } else {
        setName('');
        setSlug('');
        setDescription('');
        setLogoUrl('');
        setLogoFile(null);
        isManualSlug.current = false;
      }
      setErrorMsg('');
    }
  }, [activeModal, editBrand]);

  if (activeModal !== 'admin_brand_modal') return null;

  const handleNameChange = (val) => {
    setName(val);
    if (!isManualSlug.current) {
      setSlug(generateSlug(val));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Logo phải có định dạng JPG, PNG hoặc WebP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Logo tối đa 5 MB');
      return;
    }

    setLogoFile(file);
    setLogoUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Logo phải có định dạng JPG, PNG hoặc WebP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Logo tối đa 5 MB');
      return;
    }

    setLogoFile(file);
    setLogoUrl(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên thương hiệu');
      return;
    }

    const finalSlug = slug.trim() || generateSlug(name);
    const brandData = {
      name: name.trim(),
      slug: finalSlug,
      description: description.trim(),
      logoUrl: logoUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
      isActive: editBrand?.isActive ?? true,
    };

    if (isEditing) {
      updateBrand(editBrand.id, brandData);
    } else {
      addBrand(brandData);
    }
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-surface rounded-2xl w-full max-w-[540px] shadow-2xl border border-line overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 text-ink">
        {/* Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-surface-2/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-ink">
                {isEditing ? 'Chỉnh Sửa Thương Hiệu' : 'Thêm Thương Hiệu'}
              </h2>
              <p className="text-[12px] text-ink-muted">
                Đường dẫn (slug) được sinh tự động từ tên.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="w-8 h-8 rounded-lg bg-surface-2 text-ink-muted hover:text-ink flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-[12.5px] font-medium">
              {errorMsg}
            </div>
          )}

          {/* Tên thương hiệu */}
          <div>
            <label className="block text-[12.5px] font-bold text-ink mb-1.5">
              Tên thương hiệu <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ví dụ: Asics"
              className="w-full h-10 px-3.5 rounded-lg bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
            />
            <p className="mt-1 text-[11.5px] text-ink-subtle">
              Không được trùng với thương hiệu đã có. Slug dự kiến:{' '}
              <span className="font-bold text-ink">{slug || generateSlug(name) || '---'}</span>
            </p>
          </div>

          {/* Logo */}
          <div>
            <label className="block text-[12.5px] font-bold text-ink mb-1.5">
              Logo thương hiệu
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="flex items-center gap-4 rounded-xl border-2 border-dashed border-line p-3.5 bg-page/50 hover:border-accent/50 transition"
            >
              <div className="w-16 h-16 rounded-lg bg-surface border border-line overflow-hidden shrink-0 flex items-center justify-center p-1">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xl font-bold text-accent">
                    {(name?.[0] || 'B').toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-md border border-line bg-surface hover:bg-surface-2 text-[12px] font-bold text-ink transition cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Chọn ảnh từ máy</span>
                </button>
                <p className="mt-1 text-[11px] text-ink-subtle">
                  JPG, PNG, WebP · tối đa 5 MB. Chưa có logo thì hiện chữ cái đầu của tên.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-[12.5px] font-bold text-ink mb-1.5">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Ví dụ: Giày chạy bộ và giày thể thao Nhật Bản"
              className="w-full p-3 rounded-lg bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-lg border border-line hover:bg-surface-2 text-[13px] font-bold text-ink transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-[13px] font-bold shadow-xs transition cursor-pointer"
            >
              {isEditing ? 'Lưu Thay Đổi' : 'Thêm Thương Hiệu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
