import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
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
  FileText,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { adminService, ProductPayload } from '../../services/adminService';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import { Category } from '../../types';
import { useToast } from '../../context/ToastContext';
import { UploadProgressBar, UploadStatus } from '../../components/UploadProgressBar';

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

  // Master asset upload progress & state
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [assetUploadStatus, setAssetUploadStatus] = useState<UploadStatus>('idle');
  const [assetUploadProgress, setAssetUploadProgress] = useState(0);
  const [assetLoadedBytes, setAssetLoadedBytes] = useState(0);
  const [assetTotalBytes, setAssetTotalBytes] = useState(0);
  const [assetSpeed, setAssetSpeed] = useState('');
  const [assetTimeRemaining, setAssetTimeRemaining] = useState('');
  const [assetErrorMessage, setAssetErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const assetAbortControllerRef = useRef<AbortController | null>(null);
  const assetFileInputRef = useRef<HTMLInputElement | null>(null);
  const lastSelectedAssetFileRef = useRef<File | null>(null);
  const lastUploadTimeRef = useRef<number>(0);
  const lastLoadedRef = useRef<number>(0);

  // Uploading indicators for thumbnail and preview images
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailProgress, setThumbnailProgress] = useState(0);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);

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

  const [searchParams] = useSearchParams();
  const isPngMode = searchParams.get('format') === 'png';

  // Load initial data
  useEffect(() => {
    categoryService.getCategories()
      .then((cats) => {
        setCategories(cats);
        if (!isEdit && isPngMode) {
          const pngCat = cats.find(
            (c) => c.slug.includes('png') || c.name.toLowerCase().includes('png')
          );
          if (pngCat) {
            setValue('categoryId', pngCat.id);
          }
        }
      })
      .catch(console.error);

    if (!isEdit && isPngMode) {
      setValue('price', 0);
      setValue('discountPrice', null);
      setValue('colorMode', 'RGB (Alpha)');
      setValue('photoshopVersion', 'Transparent PNG');
      setValue('resolution', '300 DPI');
      setValue('dimensions', 'Transparent Cutout / High-Res');
    }

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

          if (product.fileName) {
            setAssetUploadStatus('completed');
            setAssetUploadProgress(100);
          }
        })
        .catch((err) => {
          error(err.response?.data?.message || 'Could not load product');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, isPngMode, setValue]);

  // Handle Master PSD / PDF / ZIP Asset Upload with real-time loading bar
  const uploadAssetFile = async (file: File) => {
    lastSelectedAssetFileRef.current = file;

    // Abort existing upload if in-flight
    if (assetAbortControllerRef.current) {
      assetAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    assetAbortControllerRef.current = abortController;

    setUploadingAsset(true);
    setAssetUploadStatus('uploading');
    setAssetUploadProgress(0);
    setAssetLoadedBytes(0);
    setAssetTotalBytes(file.size);
    setFileName(file.name);
    setAssetErrorMessage(null);
    setAssetSpeed('');
    setAssetTimeRemaining('');
    lastUploadTimeRef.current = Date.now();
    lastLoadedRef.current = 0;

    // Auto-adjust tech specs based on file type
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      const currentVersion = watch('photoshopVersion');
      if (!currentVersion || currentVersion === 'Photoshop CC 2024') {
        setValue('photoshopVersion', 'Adobe Acrobat / PDF Document');
      }
      const currentColor = watch('colorMode');
      if (!currentColor || currentColor === 'CMYK') {
        setValue('colorMode', 'CMYK / Print PDF');
      }
    }

    try {
      const res = await adminService.uploadAsset(
        file,
        (percent, loaded, total) => {
          setAssetUploadProgress(percent);
          setAssetLoadedBytes(loaded);
          setAssetTotalBytes(total);

          // Calculate upload speed & ETA
          const now = Date.now();
          const timeDiff = (now - lastUploadTimeRef.current) / 1000;
          if (timeDiff >= 0.4) {
            const bytesDiff = loaded - lastLoadedRef.current;
            const bytesPerSec = bytesDiff / timeDiff;
            if (bytesPerSec > 0) {
              const mbPerSec = (bytesPerSec / (1024 * 1024)).toFixed(1);
              setAssetSpeed(`${mbPerSec} MB/s`);
              const remainingBytes = total - loaded;
              const remainingSeconds = Math.round(remainingBytes / bytesPerSec);
              if (remainingSeconds < 60) {
                setAssetTimeRemaining(`~${Math.max(1, remainingSeconds)}s left`);
              } else {
                setAssetTimeRemaining(`~${Math.round(remainingSeconds / 60)}m left`);
              }
            }
            lastUploadTimeRef.current = now;
            lastLoadedRef.current = loaded;
          }

          if (percent >= 100) {
            setAssetUploadStatus('processing');
          }
        },
        abortController.signal
      );

      setPrivateFileUrl(res.fileUrl);
      setFileName(res.originalFileName);
      setFileSize(res.formattedSize);
      setAssetUploadStatus('completed');
      setAssetUploadProgress(100);
      success(`Private asset uploaded: ${res.originalFileName} (${res.formattedSize})`);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        setAssetUploadStatus('idle');
        return;
      }
      const msg = err.response?.data?.message || (err.response?.status === 413 ? 'File too large (exceeds server limit)' : null) || err.message || 'Failed to upload asset';
      setAssetErrorMessage(msg);
      setAssetUploadStatus('error');
      error(msg);
    } finally {
      setUploadingAsset(false);
      assetAbortControllerRef.current = null;
    }
  };

  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAssetFile(file);
    }
  };

  const handleCancelAssetUpload = () => {
    if (assetAbortControllerRef.current) {
      assetAbortControllerRef.current.abort();
      assetAbortControllerRef.current = null;
    }
    setUploadingAsset(false);
    setAssetUploadStatus('idle');
    setAssetUploadProgress(0);
    setFileName('');
    setFileSize('');
    setPrivateFileUrl('');
    if (assetFileInputRef.current) {
      assetFileInputRef.current.value = '';
    }
  };

  const handleRetryAssetUpload = () => {
    if (lastSelectedAssetFileRef.current) {
      uploadAssetFile(lastSelectedAssetFileRef.current);
    } else {
      assetFileInputRef.current?.click();
    }
  };

  const handleRemoveAsset = () => {
    setPrivateFileUrl('');
    setFileName('');
    setFileSize('');
    setAssetUploadStatus('idle');
    setAssetUploadProgress(0);
    setAssetErrorMessage(null);
    lastSelectedAssetFileRef.current = null;
    if (assetFileInputRef.current) {
      assetFileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadAssetFile(files[0]);
    }
  };

  // Handle Thumbnail Upload with progress
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    setThumbnailProgress(0);
    try {
      const res = await adminService.uploadImage(file, (p) => setThumbnailProgress(p));
      setThumbnailUrl(res.fileUrl);
      success('Thumbnail image uploaded successfully');
    } catch (err: any) {
      const msg = err.response?.data?.message || (err.response?.status === 413 ? 'Image too large (exceeds server limit)' : null) || err.message || 'Failed to upload thumbnail';
      error(msg);
    } finally {
      setUploadingThumbnail(false);
      setThumbnailProgress(0);
    }
  };

  // Handle Preview Image Upload with progress
  const handlePreviewUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPreview(true);
    setPreviewProgress(0);
    try {
      const res = await adminService.uploadImage(file, (p) => setPreviewProgress(p));
      setPreviewImages((prev) => [...prev, res.fileUrl]);
      success('Preview gallery image added');
    } catch (err: any) {
      const msg = err.response?.data?.message || (err.response?.status === 413 ? 'Image too large (exceeds server limit)' : null) || err.message || 'Failed to upload preview';
      error(msg);
    } finally {
      setUploadingPreview(false);
      setPreviewProgress(0);
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
          to={isPngMode ? '/admin/png-products' : '/admin/products'}
          className="p-2 rounded-xl bg-dark-900 border border-dark-800 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isPngMode
              ? 'Upload New Free PNG Asset'
              : isEdit
              ? 'Edit Photoshop Asset'
              : 'Upload New Photoshop PSD Asset'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isPngMode
              ? 'List high-resolution transparent PNG cutouts, 3D assets, and free client graphics'
              : 'Configure metadata, pricing, specifications, and upload private assets'}
          </p>
        </div>
      </div>

      {isPngMode && (
        <div className="bg-gradient-to-r from-cyan-950/70 via-dark-900 to-dark-900 border border-cyan-500/40 rounded-2xl p-4 flex items-center gap-3 shadow-card-dark">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>PNG Elements & Transparent Graphics Mode</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Free Download (₹0)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Category pre-selected to PNG Elements. Price defaulted to ₹0 so clients can download free of cost without payment.
            </p>
          </div>
        </div>
      )}

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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-slate-400 uppercase">Regular Price (₹) *</label>
                <button
                  type="button"
                  onClick={() => {
                    setValue('price', 0, { shouldValidate: true });
                    setValue('discountPrice', null);
                  }}
                  className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-lg transition-colors font-semibold"
                >
                  Set as Free (₹0)
                </button>
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="499.00 (Enter 0 for Free)"
                {...register('price')}
                className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-mono"
              />
              {Number(watchPrice) === 0 && (
                <p className="text-xs text-emerald-400 mt-1 font-mono font-semibold flex items-center gap-1">
                  <span>🎁 Free Asset:</span> Customers can download this product instantly without any payment gateway checkout.
                </p>
              )}
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

          {/* Private Digital Asset Upload (PSD, PDF, ZIP, PNG) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-sharp-400 uppercase font-bold flex items-center gap-1.5">
                <FileCode className="w-4 h-4" />
                Master Digital Asset (.PSD, .PDF, .ZIP, .PNG) *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-dark-950 text-slate-400 border border-dark-800 px-2 py-0.5 rounded font-mono">
                  Max: 1500MB
                </span>
                <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded font-mono font-bold">
                  PSD
                </span>
                <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded font-mono font-bold">
                  PDF
                </span>
              </div>
            </div>

            {/* Hidden native input */}
            <input
              ref={assetFileInputRef}
              type="file"
              accept=".psd,.pdf,.zip,.png,.jpg,.jpeg"
              onChange={handleAssetUpload}
              className="hidden"
              disabled={uploadingAsset}
            />

            {/* Active upload or completed file progress card */}
            {assetUploadStatus !== 'idle' || fileName ? (
              <UploadProgressBar
                fileName={fileName || lastSelectedAssetFileRef.current?.name || 'asset.psd'}
                fileSize={fileSize}
                progress={assetUploadProgress}
                loadedBytes={assetLoadedBytes}
                totalBytes={assetTotalBytes}
                speed={assetSpeed}
                timeRemaining={assetTimeRemaining}
                status={assetUploadStatus}
                errorMessage={assetErrorMessage}
                onCancel={handleCancelAssetUpload}
                onRetry={handleRetryAssetUpload}
                onRemove={handleRemoveAsset}
                onReplace={() => assetFileInputRef.current?.click()}
              />
            ) : (
              /* Drag-and-Drop Zone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => assetFileInputRef.current?.click()}
                className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
                  isDragOver
                    ? 'border-sharp-500 bg-sharp-950/25 scale-[1.005]'
                    : 'border-dark-750 bg-dark-950 hover:border-sharp-500/50 hover:bg-dark-900/60'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-3">
                  {/* File Badges illustration */}
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold text-xs font-mono shadow-sm group-hover:scale-105 transition-transform">
                      PSD
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold text-xs font-mono shadow-sm group-hover:scale-105 transition-transform">
                      PDF
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold text-xs font-mono shadow-sm group-hover:scale-105 transition-transform">
                      ZIP
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-sharp-400 transition-colors">
                      Drag & drop your Photoshop PSD or PDF master file here
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      or click to browse from your computer (.psd, .pdf, .zip, .png)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 pt-1">
                    <span>Up to 1500MB supported</span>
                    <span>•</span>
                    <span>Private storage with UUID obfuscation</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-3 pt-3 border-t border-dark-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-slate-400 uppercase block">Product Thumbnail Image (4:3 Ratio) *</label>
              {uploadingThumbnail && (
                <span className="text-[11px] font-mono text-sharp-400 flex items-center gap-1.5 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Uploading thumbnail ({thumbnailProgress}%)
                </span>
              )}
            </div>

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

                {uploadingThumbnail && (
                  <div className="w-full bg-dark-950 rounded-full h-1.5 overflow-hidden border border-dark-800">
                    <div
                      className="h-full bg-sharp-500 transition-all duration-200"
                      style={{ width: `${thumbnailProgress}%` }}
                    />
                  </div>
                )}

                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 text-xs font-medium border border-dark-700">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingThumbnail ? `Uploading (${thumbnailProgress}%)...` : 'Upload Image File'}</span>
                  <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" disabled={uploadingThumbnail} />
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
                <span>{uploadingPreview ? `Uploading (${previewProgress}%)...` : 'Add Preview Image'}</span>
                <input type="file" accept="image/*" onChange={handlePreviewUpload} className="hidden" disabled={uploadingPreview} />
              </label>
            </div>

            {uploadingPreview && (
              <div className="w-full bg-dark-950 rounded-full h-1.5 overflow-hidden border border-dark-800">
                <div
                  className="h-full bg-cyan-500 transition-all duration-200"
                  style={{ width: `${previewProgress}%` }}
                />
              </div>
            )}

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
            className="px-8 py-3 rounded-xl bg-sharp-600 hover:bg-sharp-500 dark:bg-gradient-to-r dark:from-sharp-600 dark:to-sharp-500 dark:hover:from-sharp-500 dark:hover:to-sharp-400 text-white font-bold text-sm shadow-sharp-glow transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save & Publish Product</span>}
          </button>
        </div>
      </form>
    </div>
  );
};
