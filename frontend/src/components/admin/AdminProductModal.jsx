import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Upload, Layers, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';

function createId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const SPORT_OPTIONS = [
  'Cầu lông',
  'Bóng đá',
  'Chạy bộ',
  'Tennis',
  'Bóng rổ',
  'Bóng chuyền',
  'Gym & Fitness',
  'Pickleball',
  'Bơi lội',
];

export default function AdminProductModal() {
  const {
    activeModal,
    modalPayload,
    closeModal,
    categoriesList,
    brandsList,
    addProduct,
    updateProduct,
    showToast,
  } = useStore();

  const editProduct = modalPayload?.product;
  const isEditing = Boolean(editProduct);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [sportType, setSportType] = useState('Cầu lông');
  const [basePrice, setBasePrice] = useState(3800000);
  const [salePrice, setSalePrice] = useState(3200000);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('DRAFT');

  const [variants, setVariants] = useState([
    {
      id: createId(),
      sku: 'YNX-N800-3U-DEN',
      size: '3U',
      color: 'Đen',
      stock: 25,
      price: 3200000,
      salePrice: '',
      weight: 83,
      imageUrl: '',
    },
  ]);

  const [images, setImages] = useState([]);

  const [attributes, setAttributes] = useState([
    { id: createId(), name: 'Chất liệu', value: 'Carbon' },
    { id: createId(), name: 'Trọng lượng', value: '83g' },
  ]);

  const [tags, setTags] = useState(['Cầu lông', 'Hàng mới']);
  const [tagInput, setTagInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (activeModal === 'admin_product_modal') {
      if (editProduct) {
        setName(editProduct.name || '');
        setCategoryId(editProduct.categoryId || editProduct.category?.id || '');
        setBrandId(editProduct.brandId || editProduct.brand?.id || '');
        setSportType(editProduct.sportType || 'Cầu lông');
        setBasePrice(editProduct.basePrice ?? '');
        setSalePrice(editProduct.salePrice ?? '');
        setDescription(editProduct.description || '');
        setStatus(editProduct.status || (editProduct.isActive ? 'ACTIVE' : 'DRAFT'));

        if (editProduct.variants && editProduct.variants.length > 0) {
          setVariants(
            editProduct.variants.map((v) => ({
              id: createId(),
              sku: v.sku || `SKU-${Date.now().toString().slice(-4)}`,
              size: v.size || '',
              color: v.color || '',
              stock: v.stock ?? 20,
              price: v.price ?? editProduct.basePrice,
              salePrice: v.salePrice ?? '',
              weight: v.weight ?? v.weightGram ?? 80,
              imageUrl: v.imageUrl || '',
            }))
          );
        } else {
          setVariants([
            {
              id: createId(),
              sku: editProduct.sku || 'SKU-001',
              size: 'Tiêu chuẩn',
              color: 'Tiêu chuẩn',
              stock: editProduct.stock ?? 20,
              price: editProduct.basePrice || 1000000,
              salePrice: editProduct.salePrice || '',
              weight: 80,
              imageUrl: '',
            },
          ]);
        }

        if (editProduct.images && editProduct.images.length > 0) {
          setImages(
            editProduct.images.map((img, idx) => ({
              id: createId(),
              file: null,
              imageUrl: typeof img === 'string' ? img : img.imageUrl,
              previewUrl: typeof img === 'string' ? img : img.imageUrl,
              isPrimary: img.isPrimary ?? idx === 0,
              name: `Ảnh ${idx + 1}`,
              size: 420000,
            }))
          );
        } else if (editProduct.imageUrl) {
          setImages([
            {
              id: createId(),
              file: null,
              imageUrl: editProduct.imageUrl,
              previewUrl: editProduct.imageUrl,
              isPrimary: true,
              name: 'Ảnh chính',
              size: 420000,
            },
          ]);
        } else {
          setImages([]);
        }

        if (editProduct.attributes && editProduct.attributes.length > 0) {
          setAttributes(
            editProduct.attributes.map((attr) => ({
              id: createId(),
              name: attr.attributeName || attr.name || '',
              value: attr.attributeValue || attr.value || '',
            }))
          );
        } else {
          setAttributes([
            { id: createId(), name: 'Chất liệu', value: 'Carbon' },
            { id: createId(), name: 'Trọng lượng', value: '83g' },
          ]);
        }

        if (editProduct.tags && editProduct.tags.length > 0) {
          setTags(editProduct.tags.map((t) => (typeof t === 'string' ? t : t.name)));
        } else {
          setTags(['Cầu lông', 'Hàng mới']);
        }
      } else {
        setName('');
        setCategoryId(categoriesList[0]?.id || '');
        setBrandId(brandsList[0]?.id || '');
        setSportType('Cầu lông');
        setBasePrice(3800000);
        setSalePrice(3200000);
        setDescription('');
        setStatus('DRAFT');
        setVariants([
          {
            id: createId(),
            sku: 'YNX-N800-3U-DEN',
            size: '3U',
            color: 'Đen',
            stock: 25,
            price: 3200000,
            salePrice: '',
            weight: 83,
            imageUrl: '',
          },
        ]);
        setImages([]);
        setAttributes([
          { id: createId(), name: 'Chất liệu', value: 'Carbon' },
          { id: createId(), name: 'Trọng lượng', value: '83g' },
        ]);
        setTags(['Cầu lông', 'Hàng mới']);
      }
      setErrorMsg('');
    }
  }, [activeModal, editProduct, categoriesList, brandsList]);

  if (activeModal !== 'admin_product_modal') return null;

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: createId(),
        sku: `SKU-${Date.now().toString().slice(-4)}`,
        size: 'Size M',
        color: 'Trắng',
        stock: 20,
        price: basePrice || 1000000,
        salePrice: salePrice || '',
        weight: 80,
        imageUrl: '',
      },
    ]);
  };

  const handleRemoveVariant = (id) => {
    if (variants.length <= 1) {
      showToast('Cần ít nhất 1 biến thể sản phẩm');
      return;
    }
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleVariantChange = (id, field, value) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleAddFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList);
    const availableSlots = 8 - images.length;
    if (availableSlots <= 0) {
      showToast('Đã đạt giới hạn tối đa 8 ảnh cho sản phẩm');
      return;
    }

    const validFiles = [];
    for (const file of incoming.slice(0, availableSlots)) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        showToast(`${file.name}: Chỉ hỗ trợ định dạng JPG, PNG hoặc WebP`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast(`${file.name}: Vượt quá 5 MB, không tải lên được`);
        continue;
      }
      validFiles.push({
        id: createId(),
        file,
        imageUrl: URL.createObjectURL(file),
        previewUrl: URL.createObjectURL(file),
        isPrimary: images.length === 0 && validFiles.length === 0,
        name: file.name,
        size: file.size,
      });
    }

    if (validFiles.length > 0) {
      setImages((prev) => [...prev, ...validFiles]);
      showToast(`Đã thêm ${validFiles.length} hình ảnh`);
    }
  };

  const handleSetPrimaryImage = (id) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      }))
    );
  };

  const handleRemoveImage = (id) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const handleAddAttribute = () => {
    setAttributes((prev) => [...prev, { id: createId(), name: '', value: '' }]);
  };

  const handleAttributeChange = (id, field, val) => {
    setAttributes((prev) =>
      prev.map((attr) => (attr.id === id ? { ...attr, [field]: val } : attr))
    );
  };

  const handleRemoveAttribute = (id) => {
    setAttributes((prev) => prev.filter((attr) => attr.id !== id));
  };

  const handleAddTag = (text) => {
    const clean = (text || '').trim().replace(/,/g, '');
    if (!clean) return;
    if (!tags.includes(clean)) {
      setTags((prev) => [...prev, clean]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên sản phẩm');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Vui lòng chọn danh mục cho sản phẩm');
      return;
    }
    if (!basePrice || Number(basePrice) < 0) {
      setErrorMsg('Giá gốc không hợp lệ');
      return;
    }
    if (salePrice && Number(salePrice) >= Number(basePrice)) {
      setErrorMsg('Giá khuyến mãi phải nhỏ hơn giá gốc');
      return;
    }

    const skuList = variants.map((v) => v.sku.trim());
    const skuSet = new Set(skuList);
    if (skuSet.size !== skuList.length) {
      setErrorMsg('Mã SKU giữa các biến thể không được trùng nhau');
      return;
    }

    const selectedCategory = categoriesList.find((c) => String(c.id) === String(categoryId));
    const selectedBrand = brandsList.find((b) => String(b.id) === String(brandId));

    const productPayload = {
      name: name.trim(),
      categoryId: Number(categoryId),
      category: selectedCategory?.name || 'Vợt',
      brandId: brandId ? Number(brandId) : null,
      brand: selectedBrand?.name || 'Sân Nhà',
      sportType: sportType || 'Cầu lông',
      basePrice: Number(basePrice),
      salePrice: salePrice ? Number(salePrice) : null,
      description: description.trim(),
      status,
      isActive: status === 'ACTIVE',
      stock: variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0),
      variants: variants.map((v) => ({
        id: v.id,
        sku: v.sku.trim(),
        size: v.size.trim() || 'Tiêu chuẩn',
        color: v.color.trim() || 'Tiêu chuẩn',
        stock: Number(v.stock) || 0,
        price: Number(v.price) || Number(basePrice),
        salePrice: v.salePrice ? Number(v.salePrice) : null,
        weight: Number(v.weight) || 80,
        imageUrl: v.imageUrl || (images[0]?.imageUrl || ''),
      })),
      images: images.map((img, idx) => ({
        imageUrl: img.imageUrl || img.previewUrl,
        isPrimary: img.isPrimary ?? idx === 0,
        sortOrder: idx,
      })),
      attributes: attributes
        .filter((a) => a.name.trim() && a.value.trim())
        .map((a) => ({
          attributeName: a.name.trim(),
          attributeValue: a.value.trim(),
        })),
      tags: tags.map((t) => ({ name: t })),
    };

    if (isEditing) {
      updateProduct(editProduct.id, productPayload);
    } else {
      addProduct(productPayload);
    }
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-surface rounded-2xl w-full max-w-4xl shadow-2xl border border-line overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150 text-ink">
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-surface-2/40 shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-ink flex items-center gap-2">
              <Layers className="w-5 h-5 text-accent" />
              <span>{isEditing ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</span>
            </h2>
            <p className="text-[12px] text-ink-muted mt-0.5">
              Sản phẩm mới luôn ở trạng thái Nháp. Sau khi lưu, chuyển sang &quot;Đang bán&quot; để hiển thị cho khách.
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="w-8 h-8 rounded-lg bg-surface-2 text-ink-muted hover:text-ink flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-7 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-[12.5px] font-medium">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Thông tin chung */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <h3 className="text-[14px] font-bold text-ink">Thông tin chung</h3>
              {isEditing && (
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-ink-muted">Trạng thái:</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-8 px-2.5 rounded-md bg-page border border-line text-[12px] font-bold text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="DRAFT">Bản nháp (DRAFT)</option>
                    <option value="ACTIVE">Đang bán (ACTIVE)</option>
                    <option value="OUT_OF_STOCK">Hết hàng (OUT_OF_STOCK)</option>
                    <option value="DISCONTINUED">Ngừng kinh doanh (DISCONTINUED)</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[12.5px] font-bold text-ink mb-1">
                Tên sản phẩm <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Vợt Cầu Lông Yonex Nanoflare 800 Pro"
                className="w-full h-10 px-3.5 rounded-lg bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[12.5px] font-bold text-ink mb-1">
                  Danh mục <span className="text-danger">*</span>
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12.5px] font-bold text-ink mb-1">
                  Thương hiệu
                </label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
                >
                  <option value="">-- Không chọn --</option>
                  {brandsList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12.5px] font-bold text-ink mb-1">
                  Môn thể thao
                </label>
                <select
                  value={sportType}
                  onChange={(e) => setSportType(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
                >
                  {SPORT_OPTIONS.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12.5px] font-bold text-ink mb-1">
                  Giá gốc (VNĐ) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-bold text-ink mb-1">
                  Giá khuyến mãi (VNĐ)
                </label>
                <input
                  type="number"
                  min={0}
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="Để trống nếu không giảm"
                  className="w-full h-10 px-3.5 rounded-lg bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent"
                />
                <p className="mt-1 text-[11px] text-ink-subtle">
                  Để trống nếu không giảm giá. Phải nhỏ hơn giá gốc.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[12.5px] font-bold text-ink mb-1">
                Mô tả sản phẩm
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Mô tả công nghệ, đặc điểm nổi bật và trải nghiệm sử dụng"
                className="w-full p-3 rounded-lg bg-page border border-line text-[13px] text-ink focus:outline-none focus:border-accent resize-none"
              />
            </div>
          </section>

          {/* Section 2: Danh sách biến thể */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <div>
                <h3 className="text-[14px] font-bold text-ink">Danh sách biến thể</h3>
                <p className="text-[11.5px] text-ink-muted">
                  Cần ít nhất 1 biến thể. Mã SKU phải duy nhất toàn hệ thống.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-3 py-1.5 rounded-md bg-accent/10 hover:bg-accent/20 text-accent text-[12px] font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm biến thể</span>
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={v.id}
                  className="p-4 rounded-xl border border-line bg-surface-2/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-ink">
                      Biến thể {idx + 1}
                    </span>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(v.id)}
                        className="text-[12px] font-bold text-danger hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-ink mb-1">
                        Mã SKU <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={v.sku}
                        onChange={(e) => handleVariantChange(v.id, 'sku', e.target.value)}
                        placeholder="SKU-001"
                        className="w-full h-8.5 px-2.5 rounded-md bg-page border border-line text-[12px] text-ink focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-ink mb-1">
                        Kích cỡ
                      </label>
                      <input
                        type="text"
                        value={v.size}
                        onChange={(e) => handleVariantChange(v.id, 'size', e.target.value)}
                        placeholder="Ví dụ: 3U / Size L"
                        className="w-full h-8.5 px-2.5 rounded-md bg-page border border-line text-[12px] text-ink focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-ink mb-1">
                        Màu sắc
                      </label>
                      <input
                        type="text"
                        value={v.color}
                        onChange={(e) => handleVariantChange(v.id, 'color', e.target.value)}
                        placeholder="Ví dụ: Đen / Đỏ"
                        className="w-full h-8.5 px-2.5 rounded-md bg-page border border-line text-[12px] text-ink focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-ink mb-1">
                        Tồn kho <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={v.stock}
                        onChange={(e) => handleVariantChange(v.id, 'stock', e.target.value)}
                        className="w-full h-8.5 px-2.5 rounded-md bg-page border border-line text-[12px] text-ink focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-ink mb-1">
                        Giá bán (VNĐ) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={v.price}
                        onChange={(e) => handleVariantChange(v.id, 'price', e.target.value)}
                        className="w-full h-8.5 px-2.5 rounded-md bg-page border border-line text-[12px] text-ink focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-ink mb-1">
                        Giá KM (VNĐ)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={v.salePrice}
                        onChange={(e) => handleVariantChange(v.id, 'salePrice', e.target.value)}
                        placeholder="Tùy chọn"
                        className="w-full h-8.5 px-2.5 rounded-md bg-page border border-line text-[12px] text-ink focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-ink mb-1">
                        Cân nặng (gram)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={v.weight}
                        onChange={(e) => handleVariantChange(v.id, 'weight', e.target.value)}
                        placeholder="83"
                        className="w-full h-8.5 px-2.5 rounded-md bg-page border border-line text-[12px] text-ink focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-ink mb-1">
                        Ảnh biến thể
                      </label>
                      <select
                        value={v.imageUrl || ''}
                        onChange={(e) => handleVariantChange(v.id, 'imageUrl', e.target.value)}
                        className="w-full h-8.5 px-2 rounded-md bg-page border border-line text-[12px] text-ink focus:outline-none focus:border-accent"
                      >
                        <option value="">Dùng ảnh chính</option>
                        {images.map((img, i) => (
                          <option key={img.id} value={img.imageUrl || img.previewUrl}>
                            Ảnh {i + 1} {img.isPrimary ? '(Ảnh chính)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Hình ảnh sản phẩm (Upload & Drag/Drop) */}
          <section className="space-y-3">
            <div className="border-b border-line pb-2">
              <h3 className="text-[14px] font-bold text-ink">Hình ảnh sản phẩm</h3>
              <p className="text-[11.5px] text-ink-muted">
                Tải ảnh từ máy lên. Ảnh đầu tiên là ảnh chính, có thể đổi sang ảnh khác.
              </p>
            </div>

            {/* Dropzone Container */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleAddFiles(e.dataTransfer.files);
              }}
              className="rounded-xl border-2 border-dashed border-line p-6 text-center bg-page/40 hover:border-accent/60 transition cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-[13px] font-semibold text-ink">
                  Kéo thả ảnh vào đây hoặc <span className="text-accent underline font-bold">chọn ảnh từ máy</span>
                </p>
                <p className="text-[11px] text-ink-subtle">
                  JPG, PNG, WebP · tối đa 5 MB mỗi ảnh · tối đa 8 ảnh
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleAddFiles(e.target.files)}
              />
            </div>

            {/* Uploaded Images List */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className={`rounded-xl border overflow-hidden bg-surface relative flex flex-col justify-between transition ${
                      img.isPrimary ? 'border-accent shadow-xs' : 'border-line'
                    }`}
                  >
                    <div className="aspect-square w-full bg-page relative overflow-hidden">
                      <img
                        src={img.previewUrl || img.imageUrl}
                        alt={img.name || `Ảnh ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {img.isPrimary && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-accent text-white text-[10.5px] font-bold shadow-xs">
                          Ảnh chính
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 space-y-1.5 border-t border-line text-[11.5px]">
                      <div className="flex items-center justify-between text-ink-muted">
                        <span className="truncate max-w-[100px] font-medium">{img.name}</span>
                        <span>{formatFileSize(img.size)}</span>
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-1">
                        {!img.isPrimary ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetPrimaryImage(img.id);
                            }}
                            className="text-[11px] font-bold text-accent hover:underline cursor-pointer"
                          >
                            Đặt làm ảnh chính
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-accent flex items-center gap-0.5">
                            <Check className="w-3 h-3" />
                            <span>Chính</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(img.id);
                          }}
                          className="text-[11px] font-bold text-danger hover:underline cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 4: Thông số kỹ thuật (Attributes) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <div>
                <h3 className="text-[14px] font-bold text-ink">Thông số kỹ thuật</h3>
                <p className="text-[11.5px] text-ink-muted">
                  Dòng trống sẽ bị bỏ qua; tên không được trùng nhau.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddAttribute}
                className="px-3 py-1.5 rounded-md bg-accent/10 hover:bg-accent/20 text-accent text-[12px] font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm thuộc tính</span>
              </button>
            </div>

            <div className="space-y-2">
              {attributes.map((attr) => (
                <div key={attr.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={attr.name}
                    onChange={(e) => handleAttributeChange(attr.id, 'name', e.target.value)}
                    placeholder="Tên thuộc tính (Ví dụ: Chất liệu)"
                    className="flex-1 h-9 px-3 rounded-lg bg-page border border-line text-[12.5px] text-ink focus:outline-none focus:border-accent"
                  />
                  <input
                    type="text"
                    value={attr.value}
                    onChange={(e) => handleAttributeChange(attr.id, 'value', e.target.value)}
                    placeholder="Giá trị (Ví dụ: Carbon)"
                    className="flex-1 h-9 px-3 rounded-lg bg-page border border-line text-[12.5px] text-ink focus:outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAttribute(attr.id)}
                    className="w-9 h-9 rounded-lg hover:bg-danger/10 text-ink-muted hover:text-danger flex items-center justify-center transition cursor-pointer"
                    title="Xóa thuộc tính"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Thẻ (Tags) */}
          <section className="space-y-3">
            <div className="border-b border-line pb-2">
              <h3 className="text-[14px] font-bold text-ink">Thẻ (Tags)</h3>
              <p className="text-[11.5px] text-ink-muted">
                Nhấn Enter hoặc dấu phẩy để thêm. Tag chưa có sẽ được tự tạo.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-line bg-page flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full bg-accent-soft text-accent text-[12px] font-bold flex items-center gap-1.5"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:opacity-75 cursor-pointer text-accent"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => handleAddTag(tagInput)}
                placeholder="Thêm tag..."
                className="flex-1 min-w-[120px] bg-transparent text-[12.5px] text-ink focus:outline-none placeholder:text-ink-subtle"
              />
            </div>
          </section>

          {/* Sticky Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2.5 rounded-lg border border-line hover:bg-surface-2 text-[13px] font-bold text-ink transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-[13px] font-bold shadow-xs transition cursor-pointer"
            >
              {isEditing ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
