import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Download,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles,
  Maximize2,
  FileCheck,
  Loader2,
  Share2,
} from 'lucide-react';
import { Product } from '../types';
import { productService } from '../services/productService';
import { downloadService } from '../services/downloadService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/ProductCard';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart, toggleWishlist, isWishlisted } = useCart();
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const loadProduct = async () => {
      setLoading(true);
      try {
        const item = await productService.getBySlug(slug);
        setProduct(item);
        setActiveImage(item.thumbnailUrl);

        // SEO meta
        document.title = `${item.title} — SharpShadow`;

        // Load related
        const related = await productService.getRelated(item.id);
        setRelatedProducts(related);
      } catch (err: any) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-sharp-500 animate-spin" />
        <span className="text-sm text-slate-400">Loading template details...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Product Not Found</h2>
        <p className="text-slate-400 text-sm">The requested Photoshop template does not exist or has been unpublished.</p>
        <Link to="/browse" className="inline-block px-5 py-2.5 rounded-xl bg-sharp-600 text-white text-sm font-medium">
          Browse Catalog
        </Link>
      </div>
    );
  }

  const inCart = isInCart(product.id);
  const wishlisted = isWishlisted(product.id);
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;

  const handleAddToCart = () => {
    if (!inCart) {
      addToCart(product);
      success(`Added "${product.title}" to cart`);
    } else {
      navigate('/cart');
    }
  };

  const handleBuyNow = () => {
    if (!inCart) {
      addToCart(product);
    }
    navigate('/checkout');
  };

  const handleDownload = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setDownloading(true);
    try {
      const res = await downloadService.getDownloadUrl(product.id);
      success('Download authorized! Starting file download...');
      // Trigger download
      window.location.href = res.downloadUrl;
    } catch (err: any) {
      error(err.response?.data?.message || 'Could not initiate download. Please verify your purchase.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    success('Link copied to clipboard');
  };

  const allGalleryImages = [product.thumbnailUrl, ...(product.previewImages || [])].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10 sm:space-y-16">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-slate-400">
        <Link to="/" className="hover:text-white transition-colors">HOME</Link>
        <span>/</span>
        <Link to="/categories" className="hover:text-white transition-colors">CATEGORIES</Link>
        <span>/</span>
        <Link to={`/category/${product.category.slug}`} className="hover:text-sharp-400 text-sharp-400 transition-colors uppercase">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-slate-300 truncate max-w-[160px] sm:max-w-xs">{product.title}</span>
      </nav>

      {/* Main Top Grid: Gallery & Purchase Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
        
        {/* Left: Preview Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-dark-900 border border-dark-800 shadow-2xl group">
            <img
              src={activeImage}
              alt={product.title}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('unsplash.com')) {
                  target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
                }
              }}
            />
            {/* Top Badges (Featured & Offer Percentage) */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 flex-wrap z-10">
              {product.featured && (
                <span className="bg-gradient-to-r from-sharp-600 to-rose-500 text-white font-mono text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg shadow-sharp-glow uppercase tracking-wider">
                  Featured Asset
                </span>
              )}
              {hasDiscount && (
                <span className="bg-emerald-600 text-white font-mono text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg shadow-md uppercase tracking-wider">
                  {Math.round(((product.price - product.discountPrice!) / product.price) * 100)}% off
                </span>
              )}
            </div>
            <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-dark-950/80 backdrop-blur-md border border-dark-750 text-slate-200 font-mono text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg flex items-center gap-1 sm:gap-1.5">
              <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sharp-400" />
              Layered PSD
            </span>
          </div>

          {/* Thumbnails Row */}
          {allGalleryImages.length > 1 && (
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scroll-touch no-scrollbar">
              {allGalleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activeImage === img ? 'border-sharp-500 shadow-sharp-glow scale-105' : 'border-dark-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('unsplash.com')) {
                        target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
                      }
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Buy Box & Key Specs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-6 shadow-card-dark">
            
            {/* Title & Category */}
            <div>
              <Link
                to={`/category/${product.category.slug}`}
                className="text-xs font-mono text-sharp-400 hover:text-sharp-300 uppercase tracking-widest font-bold"
              >
                {product.category.name}
              </Link>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white mt-1 leading-tight">
                {product.title}
              </h1>
            </div>

            {/* Price Row */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 pb-5 sm:pb-6 border-b border-dark-800 flex-wrap">
              <span className={`text-2xl sm:text-4xl font-black font-mono ${hasDiscount ? 'text-blue-400' : 'text-white'}`}>
                ₹{hasDiscount ? product.discountPrice : product.price}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base sm:text-xl font-mono text-slate-400 line-through">
                    ₹{product.price}
                  </span>
                  <span className="text-xs sm:text-sm font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded shadow-sm">
                    {Math.round(((product.price - product.discountPrice!) / product.price) * 100)}% off
                  </span>
                </>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              {product.hasPurchased ? (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  <span>Download PSD Asset</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white font-bold text-base shadow-sharp-glow hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Buy Now</span>
                  </button>

                  <button
                    onClick={handleAddToCart}
                    className={`w-full py-3.5 rounded-2xl border font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      inCart
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-dark-850 hover:bg-dark-800 text-slate-200 border-dark-750 hover:border-dark-600'
                    }`}
                  >
                    <span>{inCart ? 'View in Cart' : 'Add to Cart'}</span>
                  </button>
                </>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                    wishlisted
                      ? 'bg-sharp-500/10 border-sharp-500/40 text-sharp-400'
                      : 'bg-dark-950 border-dark-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                  <span>{wishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl bg-dark-950 border border-dark-800 text-slate-300 hover:text-white transition-colors"
                  title="Share link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick File Specs Badge List */}
            <div className="pt-4 border-t border-dark-800/80 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-dark-950/60 p-3 rounded-xl border border-dark-800">
                <span className="text-slate-400 block font-mono text-[10px] uppercase">Format</span>
                <span className="font-semibold text-slate-200">PSD (Adobe Photoshop)</span>
              </div>
              <div className="bg-dark-950/60 p-3 rounded-xl border border-dark-800">
                <span className="text-slate-400 block font-mono text-[10px] uppercase">File Size</span>
                <span className="font-semibold text-slate-200">{product.fileSize || '120 MB'}</span>
              </div>
              <div className="bg-dark-950/60 p-3 rounded-xl border border-dark-800">
                <span className="text-slate-400 block font-mono text-[10px] uppercase">Resolution</span>
                <span className="font-semibold text-slate-200">{product.resolution || '300 DPI'}</span>
              </div>
              <div className="bg-dark-950/60 p-3 rounded-xl border border-dark-800">
                <span className="text-slate-400 block font-mono text-[10px] uppercase">Color Mode</span>
                <span className="font-semibold text-slate-200">{product.colorMode || 'CMYK'}</span>
              </div>
            </div>

            {/* Guarantee Note */}
            <div className="flex items-center gap-2.5 text-xs text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant download access with Razorpay verified payment confirmation.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sections: Description, Features, What's Included, License (Section 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content (2 cols) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Description */}
          <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-xl font-bold text-white">Product Description</h3>
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Features & What's Included */}
          <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-bold text-white">Features & Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sharp-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <h4 className="text-white font-semibold">100% Layered & Organized</h4>
                  <p className="text-xs text-slate-400">Organized into labeled color-coded folders.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sharp-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <h4 className="text-white font-semibold">Smart Object Placeholders</h4>
                  <p className="text-xs text-slate-400">Double click and drop your imagery instantly.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sharp-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <h4 className="text-white font-semibold">Print-Ready Dimensions</h4>
                  <p className="text-xs text-slate-400">Includes safety margins and 0.125-inch bleeds.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sharp-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <h4 className="text-white font-semibold">Free Fonts Used</h4>
                  <p className="text-xs text-slate-400">Documentation text file with all font download links.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-dark-800 space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">What's Included</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sharp-500" />
                  <span>1x High-Resolution Adobe Photoshop Master File (.PSD)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sharp-500" />
                  <span>Comprehensive PDF Quick Start & Customization Guide</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sharp-500" />
                  <span>Font Documentation link manifest (.txt)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Detailed File Specs & License (1 col) */}
        <div className="space-y-6">
          
          {/* File Information Table */}
          <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-sharp-400" />
              File Information
            </h3>
            <div className="space-y-3 text-xs divide-y divide-dark-800">
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Format:</span>
                <span className="font-mono text-white">.PSD / Layered</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">File Size:</span>
                <span className="font-mono text-white">{product.fileSize || 'N/A'}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Dimensions:</span>
                <span className="font-mono text-white">{product.dimensions || 'Print Standard'}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Resolution:</span>
                <span className="font-mono text-white">{product.resolution || '300 DPI'}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Color Mode:</span>
                <span className="font-mono text-white">{product.colorMode || 'CMYK'}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Photoshop Version:</span>
                <span className="font-mono text-white">{product.photoshopVersion || 'Photoshop CC+'}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Total Downloads:</span>
                <span className="font-mono text-sharp-400 font-bold">{product.downloadCount}</span>
              </div>
            </div>
          </div>

          {/* License Info */}
          <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 space-y-3">
            <h3 className="font-bold text-white text-base">Standard Commercial License</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Purchasing this asset grants you a non-exclusive license to use the design in unlimited commercial client projects, personal branding, print runs, and social media campaigns.
            </p>
            <Link to="/license" className="text-xs text-sharp-400 hover:text-sharp-300 font-semibold block pt-1">
              Read Complete Licensing Terms →
            </Link>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-dark-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold text-white">Related PSD Templates</h3>
            <Link to={`/category/${product.category.slug}`} className="text-xs sm:text-sm text-slate-400 hover:text-sharp-400 transition-colors">
              More from {product.category.name} →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
