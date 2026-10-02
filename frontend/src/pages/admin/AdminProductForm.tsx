import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Upload,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Layers,
  Image as ImageIcon,
  FileCode,
  Plus,
  Trash2,
} from 'lucide-react';
import { adminService, ProductPayload } from '../../services/adminService';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import { Category } from '../../types';
import { useToast } from '../../context/ToastContext';

const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().optional(),
  categoryId: z.coerce.number().min(1, 'Please select a valid category'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  discountPrice: z.coerce.number().optional().nullable(),
  dimensions: z.string().optional(),
  resolution: z.string().optional(),
  colorMode: z.string().optional(),
  photoshopVersion: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.string().default('PUBLISHED'),
});

type FormData = z.infer<typeof productSchema>;

export const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // File state
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [privateFileUrl, setPrivateFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // Uploading indicators
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      featured: false,
      status: 'PUBLISHED',
      resolution: '300 DPI',
      colorMode: 'CMYK',
      photoshopVersion: 'Photoshop CC 2024',
      dimensions: 'Custom / Print Standard',
    },
  });

  const titleValue = watch('title');
  const watchPrice = watch('price');
  const watchDiscountPrice = watch('discountPrice');

  const regularPriceNum = Number(watchPrice) || 0;
  const discountPriceNum = Number(watchDiscountPrice) || 0;
  const hasLiveDiscount = regularPriceNum > 0 && discountPriceNum > 0 && discountPriceNum < regularPriceNum;
  const liveDiscountPercent = hasLiveDiscount
    ? Math.round(((regularPriceNum - discountPriceNum) / regularPriceNum) * 100)
    : 0;

  // Load initial data
  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(console.error);

    if (isEdit && id) {
      setLoading(true);
      adminService.getProductById(id)
        .then((product) => {
          setValue('title', product.title);
          setValue('slug', product.slug);
          setValue('categoryId', product.category.id);
          setValue('description', product.description);
          setValue('price', product.price);
          setValue('discountPrice', product.discountPrice);
          setValue('dimensions', product.dimensions || '');
          setValue('resolution', product.resolution || '');
          setValue('colorMode', product.colorMode || '');
          setValue('photoshopVersion', product.photoshopVersion || '');
          setValue('featured', product.featured);
          setValue('status', product.status);

          setThumbnailUrl(product.thumbnailUrl);
          setPrivateFileUrl(product.internalFileUrl || '');
          setFileName(product.fileName || '');
          setFileSize(product.fileSize || '');
          setPreviewImages(product.previewImages || []);
        })
        .catch((err) => {
          error(err.response?.data?.message || 'Could not load product');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, setValue]);

  // Handle Private PSD / ZIP Asset Upload
  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAsset(true);
    try {
      const res = await adminService.uploadAsset(file);
      setPrivateFileUrl(res.fileUrl);
      setFileName(res.originalFileName);
      setFileSize(res.formattedSize); // Automatically calculated file size (Section 16)
      success(`Private asset uploaded: ${res.originalFileName} (${res.formattedSize})`);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to upload asset');
    } finally {
      setUploadingAsset(false);
    }
  };

  // Handle Thumbnail Upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const res = await adminService.uploadImage(file);
      setThumbnailUrl(res.fileUrl);
      success('Thumbnail image uploaded successfully');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to upload thumbnail');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // Handle Preview Image Upload
  const handlePreviewUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPreview(true);
    try {
      const res = await adminService.uploadImage(file);
      setPreviewImages((prev) => [...prev, res.fileUrl]);
      success('Preview gallery image added');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to upload preview');
    } finally {
      setUploadingPreview(false);
    }
  };

  const removePreviewImage = (idx: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data: FormData) => {
    if (!thumbnailUrl) {
      error('Please upload or specify a thumbnail image');
      return;
    }

    setSubmitting(true);
    const payload: ProductPayload = {
      title: data.title,
      slug: data.slug || undefined,
      categoryId: data.categoryId,
      description: data.description,
      price: data.price,
      discountPrice: data.discountPrice || null,
      thumbnailUrl,
      fileUrl: privateFileUrl || 'seed-assets/sample-asset.psd',
      fileName: fileName || `${data.title}.psd`,
      fileSize: fileSize || '120.0 MB',
      dimensions: data.dimensions,
      resolution: data.resolution,
      colorMode: data.colorMode,
      photoshopVersion: data.photoshopVersion,
      featured: data.featured,
      status: data.status,
      previewImages,
    };

    try {
      if (isEdit && id) {
        await adminService.updateProduct(Number(id), payload);
        success('Product updated successfully');
      } else {
        await adminService.createProduct(payload);
        success('Product created and published successfully');
      }
      navigate('/admin/products');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-sharp-500 animate-spin" />
        <span className="text-sm text-slate-400">Loading product...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/admin/products"
          className="p-2 rounded-xl bg-dark-900 border border-dark-800 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Photoshop Asset' : 'Upload New Photoshop PSD Asset'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure metadata, pricing, specifications, and upload private assets
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Core Info */}
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-card-dark">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">1. Basic Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Product Title *</label>
              <input
                type="text"
                placeholder="e.g. Minimalist Botanical Wedding Suite PSD"
                {...register('title')}
                className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
              />
              {errors.title && <p className="text-xs text-sharp-400 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Category *</label>
              <select
                {...register('categoryId')}
                className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-xs text-sharp-400 mt-1">{errors.categoryId.message}</p>}
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">
                URL Slug (Optional, auto-generated)
              </label>
              <input
                type="text"
                placeholder="Leave blank for automatic slug"
                {...register('slug')}
                className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Description *</label>
              <textarea
                rows={4}
                placeholder="Detailed description of Photoshop layers, typography, smart objects, and usage..."
                {...register('description')}
                className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl p-4 text-sm text-white placeholder-slate-500 outline-none"
              />
              {errors.description && <p className="text-xs text-sharp-400 mt-1">{errors.description.message}</p>}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-card-dark">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">2. Pricing (INR)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Regular Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="499.00"
                {...register('price')}
                className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-mono"
              />
              {errors.price && <p className="text-xs text-sharp-400 mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Discount / Sale Price (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="349.00 (Optional)"
                {...register('discountPrice')}
                className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-mono"
              />
            </div>
          </div>

          {/* Live Discount UI Preview (As Requested) */}
          {hasLiveDiscount && (
            <div className="p-3.5 bg-dark-950 border border-dark-750 rounded-2xl flex items-center justify-between flex-wrap gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">Storefront Display Preview:</span>
                <div className="flex items-center gap-2.5 bg-dark-900 border border-dark-800 px-3 py-1.5 rounded-xl">
                  <span className="text-lg font-bold font-mono text-blue-400">
                    ₹{discountPriceNum}
                  </span>
                  <span className="text-xs font-mono text-slate-400 line-through">
                    ₹{regularPriceNum}
                  </span>
                  <span className="text-[11px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded shadow-sm">
                    {liveDiscountPercent}% off
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                Customer saves ₹{(regularPriceNum - discountPriceNum).toFixed(2)} ({liveDiscountPercent}%)
              </span>
            </div>
          )}

          {discountPriceNum > 0 && regularPriceNum > 0 && discountPriceNum >= regularPriceNum && (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400 flex items-center gap-2">
              <span>⚠️ Discount price (₹{discountPriceNum}) should be lower than regular price (₹{regularPriceNum}) to show a sale discount.</span>
            </div>
          )}
        </div>

        {/* File & Private Asset Uploads (Section 16 & 17) */}
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-card-dark">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">3. File Storage & Uploads</h3>

          {/* Private PSD Asset Upload */}
          <div className="p-4 rounded-2xl bg-dark-950 border border-dark-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-sharp-400 uppercase font-bold flex items-center gap-1.5">
                <FileCode className="w-4 h-4" />
                Master PSD or ZIP Asset (Private Storage)
              </label>
              <span className="text-[10px] bg-dark-900 text-slate-400 px-2 py-0.5 rounded font-mono">
                Supports up to 500MB
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-200 border border-dark-700 text-xs font-semibold flex items-center gap-2 transition-colors">
                <Upload className="w-4 h-4" />
                <span>{uploadingAsset ? 'Uploading PSD...' : 'Choose PSD / ZIP File'}</span>
                <input
                  type="file"
                  accept=".psd,.zip"
                  onChange={handleAssetUpload}
                  className="hidden"
                  disabled={uploadingAsset}
                />
              </label>

              {fileName && (
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{fileName} ({fileSize})</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Files are stored privately with UUID obfuscation and are NEVER served directly without a verified purchase signature.
            </p>
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-3">
            <label className="text-xs font-mono text-slate-400 uppercase block">Product Thumbnail Image (4:3 Ratio) *</label>
            <div className="flex items-center gap-4">
              {thumbnailUrl && (
                <img src={thumbnailUrl} alt="Thumbnail" className="w-20 h-20 rounded-xl object-cover bg-dark-950 border border-dark-750" />
              )}
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Paste image URL or upload..."
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-750 rounded-xl px-4 py-2 text-xs text-white outline-none"
                />
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 text-xs font-medium border border-dark-700">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingThumbnail ? 'Uploading...' : 'Upload Image File'}</span>
                  <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Multiple Preview Images Upload */}
          <div className="space-y-3 pt-3 border-t border-dark-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-slate-400 uppercase block">Preview Gallery Images</label>
              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-sharp-400 hover:text-sharp-300 font-semibold">
                <Plus className="w-3.5 h-3.5" />
                <span>{uploadingPreview ? 'Uploading...' : 'Add Preview Image'}</span>
                <input type="file" accept="image/*" onChange={handlePreviewUpload} className="hidden" />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              {previewImages.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-dark-750 group">
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePreviewImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-md bg-black/80 text-sharp-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* File Specifications */}
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-card-dark">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">4. Technical Specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Dimensions</label>
              <input
                type="text"
                placeholder="e.g. 5x7 in / 4000x3000 px"
                {...register('dimensions')}
                className="w-full bg-dark-950 border border-dark-750 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Resolution</label>
              <input
                type="text"
                placeholder="e.g. 300 DPI"
                {...register('resolution')}
                className="w-full bg-dark-950 border border-dark-750 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Color Mode</label>
              <select
                {...register('colorMode')}
                className="w-full bg-dark-950 border border-dark-750 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="CMYK">CMYK (Print Ready)</option>
                <option value="RGB">RGB (Digital Screen)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Photoshop Version</label>
              <input
                type="text"
                placeholder="e.g. Photoshop CC 2020+"
                {...register('photoshopVersion')}
                className="w-full bg-dark-950 border border-dark-750 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Toggles: Featured & Published */}
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-card-dark flex flex-col sm:flex-row items-center justify-between gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('featured')}
              className="w-4 h-4 rounded text-sharp-600 focus:ring-sharp-500 bg-dark-950 border-dark-750"
            />
            <div>
              <span className="font-semibold text-sm text-white block">Featured Product</span>
              <span className="text-xs text-slate-400">Showcase this template on the homepage</span>
            </div>
          </label>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 uppercase">Status:</span>
            <select
              {...register('status')}
              className="bg-dark-950 border border-dark-750 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              <option value="PUBLISHED">PUBLISHED (Active on Marketplace)</option>
              <option value="DRAFT">DRAFT (Hidden)</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/admin/products"
            className="px-5 py-3 rounded-xl bg-dark-900 hover:bg-dark-850 text-slate-300 text-sm font-semibold border border-dark-800"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white font-bold text-sm shadow-sharp-glow transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save & Publish Product</span>}
          </button>
        </div>
      </form>
    </div>
  );
};
