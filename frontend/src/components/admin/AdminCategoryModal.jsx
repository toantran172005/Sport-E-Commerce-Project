import { useState, useEffect, useRef } from 'react';
import { X, Upload, FolderPlus } from 'lucide-react';
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

export default function AdminCategoryModal() {
  const {
    activeModal,
    modalPayload,
    closeModal,
    categoriesList,
    addCategory,
    updateCategory,
    showToast,
  } = useStore();

  const editCategory = modalPayload?.category;
  const isEditing = Boolean(editCategory);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [_imageFile, setImageFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);
  const isManualSlug = useRef(false);

  useEffect(() => {
    if (activeModal === 'admin_category_modal') {
      if (editCategory) {
        setName(editCategory.name || '');
        setSlug(editCategory.slug || '');
        setDescription(editCategory.description || '');
        setParentId(editCategory.parentId || editCategory.parent?.id || '');
        setSortOrder(editCategory.sortOrder ?? 0);
        setImageUrl(editCategory.imageUrl || '');
        setImageFile(null);
        isManualSlug.current = true;
      } else {
        setName('');
        setSlug('');
        setDescription('');
        setParentId('');
        setSortOrder(0);
        setImageUrl('');
        setImageFile(null);
        isManualSlug.current = false;
      }
      setErrorMsg('');
    }
  }, [activeModal, editCategory]);

  if (activeModal !== 'admin_category_modal') return null;

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
      showToast('Ảnh phải có định dạng JPG, PNG hoặc WebP', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ảnh tối đa 5 MB', 'error');
      return;
    }

    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Ảnh phải có định dạng JPG, PNG hoặc WebP', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ảnh tối đa 5 MB', 'error');
      return;
    }

    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên danh mục');
      return;
    }

    const finalSlug = slug.trim() || generateSlug(name);
    const categoryData = {
      name: name.trim(),
      slug: finalSlug,
      description: description.trim(),
      parentId: parentId ? Number(parentId) : null,
      sortOrder: Number(sortOrder) || 0,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      isActive: editCategory?.isActive ?? true,
    };

    if (isEditing) {
      updateCategory(editCategory.id, categoryData);
    } else {
      addCategory(categoryData);
    }
    closeModal();
  };

  const parentOptions = categoriesList.filter(
    (c) => !editCategory || c.id !== editCategory.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-surface rounded-2xl w-full max-w-140 shadow-2xl border border-line overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 text-ink">
        {/* Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-surface-2/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-ink">
                {isEditing ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục'}
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

          {/* Tên danh mục */}
          <div>
            <label className="block text-[12.5px] font-bold text-ink mb-1.5">
              Tên danh mục <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ví dụ: Giày chạy bộ"
              className="w-full h-10 px-3.5 rounded-lg bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
            />
            <p className="mt-1 text-[11.5px] text-ink-subtle">
              Slug dự kiến: <span className="font-bold text-ink">{slug || generateSlug(name) || '---'}</span>
            </p>
          </div>

          {/* Danh mục cha */}
          <div>
            <label className="block text-[12.5px] font-bold text-ink mb-1.5">
              Danh mục cha
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full h-10 px-3.5 rounded-lg bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
            >
              <option value="">— Danh mục gốc —</option>
              {parentOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11.5px] text-ink-subtle">
              Chọn &quot;— Danh mục gốc —&quot; nếu đây là danh mục cấp cao nhất.
            </p>
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
              placeholder="Mô tả ngắn về danh mục"
              className="w-full p-3 rounded-lg bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {/* Ảnh đại diện */}
          <div>
            <label className="block text-[12.5px] font-bold text-ink mb-1.5">
              Ảnh đại diện
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="flex items-center gap-4 rounded-xl border-2 border-dashed border-line p-3.5 bg-page/50 hover:border-accent/50 transition"
            >
              <div className="w-16 h-16 rounded-lg bg-surface border border-line overflow-hidden shrink-0 flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview danh mục"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-ink-muted">
                    {(name?.[0] || 'C').toUpperCase()}
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
                  JPG, PNG, WebP · tối đa 5 MB
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

          {/* Thứ tự hiển thị */}
          <div>
            <label className="block text-[12.5px] font-bold text-ink mb-1.5">
              Thứ tự hiển thị
            </label>
            <input
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full h-10 px-3.5 rounded-lg bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
            />
            <p className="mt-1 text-[11.5px] text-ink-subtle">
              Số nhỏ hiển thị trước.
            </p>
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
              {isEditing ? 'Lưu Thay Đổi' : 'Thêm Danh Mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
