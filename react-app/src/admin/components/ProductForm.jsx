import { useState, useRef, useCallback } from "react";
import { adminAPI } from "../services/api";
import { getImageUrl } from "../../services/getImageUrl";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = "JPG, JPEG, PNG, WEBP, GIF";

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Invalid file type "${file.name.split(".").pop()}". Allowed: ${ALLOWED_EXTENSIONS}.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File "${file.name}" exceeds 5MB limit.`;
  }
  return null;
}

function ImagePreview({ src, index, isMain, onRemove, onSetMain }) {
  return (
    <div className={`relative group rounded-lg overflow-hidden border-2 ${isMain ? "border-red-500" : "border-gray-200"}`}>
      <img src={getImageUrl(src)} alt={`Preview ${index + 1}`} className="w-full h-28 object-cover" />
      {isMain && (
        <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">Main</span>
      )}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        {!isMain && (
          <button type="button" onClick={onSetMain} className="p-1.5 bg-white rounded-full text-gray-700 hover:text-red-600" title="Set as main image">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </button>
        )}
        <button type="button" onClick={onRemove} className="p-1.5 bg-white rounded-full text-red-600 hover:bg-red-50" title="Remove image">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
}

export default function ProductForm({ product, categories, onClose }) {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    description: product?.description || "",
    category: product?.category || "",
    brand: product?.brand || "",
    price: product?.price || "",
    discount_price: product?.discount_price || 0,
    discount_percent: product?.discount_percent || 0,
    stock: product?.stock || 0,
    low_stock_threshold: product?.low_stock_threshold || 5,
    images: product?.images || [],
    cloudinaryPublicIds: product?.cloudinaryPublicIds || [],
    sizes: product?.sizes || [],
    badge: product?.badge || "",
    is_featured: product?.is_featured || false,
    is_active: product?.is_active !== undefined ? product.is_active : true,
    tags: product?.tags || [],
  });
  const [pendingFiles, setPendingFiles] = useState([]);
  const [pendingPreviews, setPendingPreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const processFiles = useCallback((files) => {
    setUploadError("");
    const valid = [];
    for (const file of files) {
      const err = validateFile(file);
      if (err) {
        setUploadError(err);
        return;
      }
      valid.push(file);
    }
    const newPreviews = valid.map((file) => URL.createObjectURL(file));
    setPendingFiles((prev) => [...prev, ...valid]);
    setPendingPreviews((prev) => [...prev, ...newPreviews]);
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, [processFiles]);

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      processFiles(Array.from(e.target.files));
    }
    e.target.value = "";
  };

  const removePendingFile = (index) => {
    URL.revokeObjectURL(pendingPreviews[index]);
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    setPendingPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      cloudinaryPublicIds: prev.cloudinaryPublicIds.filter((_, i) => i !== index),
    }));
  };

  const setMainImage = (index) => {
    setForm((prev) => {
      const imgs = [...prev.images];
      const pids = [...prev.cloudinaryPublicIds];
      const [main] = imgs.splice(index, 1);
      const [mainPid] = pids.splice(index, 1);
      imgs.unshift(main);
      pids.unshift(mainPid);
      return { ...prev, images: imgs, cloudinaryPublicIds: pids };
    });
  };

  const addImageUrl = () => {
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ""],
      cloudinaryPublicIds: [...prev.cloudinaryPublicIds, ""],
    }));
  };

  const handleImageUrlChange = (index, value) => {
    const newImages = [...form.images];
    newImages[index] = value;
    setForm((prev) => ({ ...prev, images: newImages }));
  };

  const uploadPendingFiles = async () => {
    if (pendingFiles.length === 0) return null;
    setUploading(true);
    setUploadError("");
    try {
      const data = await adminAPI.uploadImages(pendingFiles);
      return { urls: data.urls, publicIds: data.publicIds || [] };
    } catch (err) {
      setUploadError(err.message || "Upload failed.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSizeToggle = (size) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }));
  };

  const handleTagsChange = (value) => {
    setForm((prev) => ({ ...prev, tags: value.split(",").map((t) => t.trim()).filter(Boolean) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let uploadedUrls = [];
      let uploadedPublicIds = [];
      if (pendingFiles.length > 0) {
        const result = await uploadPendingFiles();
        if (result === null) {
          setLoading(false);
          return;
        }
        uploadedUrls = result.urls;
        uploadedPublicIds = result.publicIds;
      }

      const nonEmptyImageCount = form.images.filter(Boolean).length;
      const newPublicIdsSlice = form.cloudinaryPublicIds.slice(0, nonEmptyImageCount);
      const allImages = [...form.images.filter(Boolean), ...uploadedUrls];
      const allPublicIds = [...newPublicIdsSlice, ...uploadedPublicIds];

      const payload = {
        ...form,
        price: Number(form.price),
        discount_price: Number(form.discount_price) || 0,
        stock: Number(form.stock),
        low_stock_threshold: Number(form.low_stock_threshold),
        images: allImages,
        cloudinaryPublicIds: allPublicIds,
      };

      if (product) {
        await adminAPI.updateProduct(product._id, payload);
      } else {
        await adminAPI.createProduct(payload);
      }
      pendingPreviews.forEach((url) => URL.revokeObjectURL(url));
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const totalImages = form.images.filter(Boolean).length + pendingFiles.length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-2xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">{product ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => handleChange("sku", e.target.value.toUpperCase())}
                placeholder="e.g. LSD-001"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (INR) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price</label>
              <input
                type="number"
                value={form.discount_price}
                onChange={(e) => handleChange("discount_price", e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
              <input
                type="number"
                value={form.discount_percent}
                onChange={(e) => handleChange("discount_percent", e.target.value)}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
              <select
                value={form.badge}
                onChange={(e) => handleChange("badge", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">None</option>
                <option value="New">New</option>
                <option value="Best Seller">Best Seller</option>
                <option value="Trending">Trending</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
              <input
                type="number"
                value={form.low_stock_threshold}
                onChange={(e) => handleChange("low_stock_threshold", e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Images Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images {totalImages > 0 && <span className="text-gray-400 font-normal">({totalImages} total)</span>}
            </label>

            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragActive ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-red-400 hover:bg-gray-50"}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-600 mb-1">
                {uploading ? "Uploading..." : "Drag & drop images here or click to browse"}
              </p>
              <p className="text-xs text-gray-400">{ALLOWED_EXTENSIONS} - Max 5MB each</p>
            </div>

            {uploadError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{uploadError}</div>
            )}

            {/* Pending Upload Previews */}
            {pendingPreviews.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">New images (will upload on save):</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {pendingPreviews.map((src, i) => (
                    <div key={`pending-${i}`} className="relative group rounded-lg overflow-hidden border-2 border-dashed border-blue-300">
                      <img src={src} alt={`New ${i + 1}`} className="w-full h-28 object-cover" />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded">New</span>
                      <button
                        type="button"
                        onClick={() => removePendingFile(i)}
                        className="absolute top-1 right-1 p-1 bg-white rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Image Previews */}
            {form.images.filter(Boolean).length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Current images (first is main):</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {form.images.filter(Boolean).map((img, i) => (
                    <ImagePreview
                      key={`existing-${i}`}
                      src={img}
                      index={i}
                      isMain={i === 0}
                      onRemove={() => removeExistingImage(i)}
                      onSetMain={() => setMainImage(i)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Add Upload / URL options */}
            <div className="mt-2 flex items-center gap-4">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-gray-500 hover:text-red-600 font-medium">
                Upload Image
              </button>
              <button type="button" onClick={addImageUrl} className="text-xs text-gray-500 hover:text-red-600 font-medium">
                + Add Image URL instead
              </button>
            </div>
            {form.images.some((img) => !img) && (
              <div className="mt-2 space-y-2">
                {form.images.map((img, i) => (
                  !img && (
                    <div key={`url-${i}`} className="flex gap-2">
                      <input
                        type="url"
                        value={img}
                        onChange={(e) => handleImageUrlChange(i, e.target.value)}
                        placeholder="Paste image URL"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button type="button" onClick={() => removeExistingImage(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  className={`px-3 py-1.5 text-sm rounded-lg border ${form.sizes.includes(size) ? "bg-red-600 text-white border-red-600" : "border-gray-200 text-gray-600 hover:border-red-300"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={form.tags.join(", ")}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="e.g. summer, casual, dress"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => handleChange("is_featured", e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">Featured Product</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => handleChange("is_active", e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50"
            >
              {loading ? "Saving..." : uploading ? "Uploading..." : product ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
