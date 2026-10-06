import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Download, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { downloadService } from '../services/downloadService';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isInCart, toggleWishlist, isWishlisted } = useCart();
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [downloading, setDownloading] = useState(false);

  const inCart = isInCart(product.id);
  const wishlisted = isWishlisted(product.id);

  const isFree = Boolean(
    product.free ||
    product.price === 0 ||
    (product.discountPrice != null && product.discountPrice === 0)
  );

  const isPng = Boolean(
    product.isPng ||
    product.category?.slug?.includes('png') ||
    product.category?.name?.toLowerCase().includes('png') ||
    product.fileName?.toLowerCase().endsWith('.png') ||
    product.photoshopVersion?.toLowerCase().includes('png') ||
    product.title?.toLowerCase().includes('(png)') ||
    product.title?.toLowerCase().includes('.png') ||
    product.title?.toLowerCase().endsWith(' png') ||
    product.slug?.includes('png')
  );

  const hasDiscount = !isFree && product.discountPrice != null && product.discountPrice < product.price;

  const handleAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Free product: instant automatic download without payment
    if (isFree) {
      if (!isAuthenticated) {
        navigate(`/login?redirect=${encodeURIComponent(`/product/${product.slug}`)}`);
        return;
      }

      setDownloading(true);
      try {
        const res = await downloadService.getDownloadUrl(product.id);
        success(`Free download authorized! Starting file download...`);
        window.location.href = res.downloadUrl;
      } catch (err: any) {
        error(err.response?.data?.message || 'Could not initiate free download');
      } finally {
        setDownloading(false);
      }
      return;
    }

    // Paid product: buy now flow
    if (!inCart) {
      addToCart(product);
    }
    navigate('/checkout');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) {
      addToCart(product);
      success(`Added "${product.title}" to cart`);
    } else {
      navigate('/cart');
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-dark-800/80 bg-white dark:bg-dark-900 shadow-sm hover:shadow-xl dark:hover:shadow-sharp-glow/20 transition-all duration-300 break-inside-avoid mb-4 sm:mb-6 w-full inline-block">
      
      {/* Visual Canvas: Thumbnail container that naturally scales to portrait, square, or landscape */}
      <div className="relative w-full overflow-hidden bg-slate-100 dark:bg-dark-950">
        
        {/* Full Image Link */}
        <Link to={`/product/${product.slug}`} className="block w-full">
          <img
            src={product.thumbnailUrl}
            alt={product.title}
            loading="lazy"
            className="w-full h-auto object-cover block group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('unsplash.com')) {
                target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
              }
            }}
          />
        </Link>

        {/* Top Badges (Free, Featured & Discount Offer) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap z-10 pointer-events-none">
          {isFree ? (
            <span className="bg-emerald-600 text-white font-mono text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm uppercase tracking-wider">
              Free
            </span>
          ) : (
            <>
              {product.featured && (
                <span className="bg-sharp-600 dark:bg-gradient-to-r dark:from-sharp-600 dark:to-rose-500 text-white font-mono text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sharp-glow uppercase tracking-wider">
                  Featured
                </span>
              )}
              {hasDiscount && (
                <span className="bg-emerald-600 text-white font-mono text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm uppercase tracking-wider">
                  {Math.round(((product.price - product.discountPrice!) / product.price) * 100)}% off
                </span>
              )}
            </>
          )}
        </div>

        {/* Top Right: Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md border transition-all z-20 ${
            wishlisted
              ? 'bg-sharp-500 text-white border-sharp-400 shadow-sharp-glow scale-105'
              : 'bg-slate-900/60 hover:bg-slate-900/90 text-white border-white/20 hover:scale-105 shadow-sm'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current text-white' : 'text-white'}`} />
        </button>

        {/* Bottom Overlay: Title, Category, Price & Action Buttons appear only on hover */}
        <div className="product-card-overlay absolute inset-x-0 bottom-0 z-10 p-3 sm:p-3.5 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent pt-14 flex flex-col justify-end space-y-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 ease-out">
          
          {/* Category & Title */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="product-card-category font-bold tracking-wider uppercase text-sharp-400">
                {product.category.name}
              </span>
              <span className="product-card-badge font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/15 backdrop-blur-sm text-slate-200">
                {(product.fileName?.split('.').pop() || 'PSD').toUpperCase()}
              </span>
            </div>
            <Link to={`/product/${product.slug}`} className="block">
              <h3
                className="product-card-title text-xs sm:text-sm font-bold line-clamp-2 leading-snug drop-shadow-md transition-colors hover:text-sharp-400 text-white"
              >
                {product.title}
              </h3>
            </Link>
          </div>

          {/* Bottom Bar: Price & Action Buttons (Add to Cart + Buy/Download) */}
          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/15">
            {/* Price or FREE badge */}
            <div className="flex items-baseline gap-1.5 min-w-0">
              {isFree ? (
                <span className="product-card-price text-xs sm:text-sm font-black font-mono text-emerald-400 tracking-wider uppercase bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-md">
                  FREE
                </span>
              ) : (
                <>
                  <span
                    className="product-card-price text-sm sm:text-base font-black font-mono tracking-tight text-white"
                  >
                    ₹{hasDiscount ? product.discountPrice : product.price}
                  </span>
                  {hasDiscount && (
                    <span className="product-card-strike text-[10px] sm:text-xs font-mono line-through text-slate-400">
                      ₹{product.price}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleAddToCart}
                className={`p-2 rounded-xl transition-all border flex items-center justify-center ${
                  inCart
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                    : 'bg-white/15 hover:bg-white/30 text-white border-white/25 hover:border-white/40 backdrop-blur-md active:scale-95'
                }`}
                title={inCart ? 'In Cart (Click to view)' : 'Add to Cart'}
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </button>

              <button
                onClick={handleAction}
                disabled={downloading}
                className={`product-card-buy px-3 py-1.5 rounded-xl font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1 text-white ${
                  isFree
                    ? 'bg-emerald-600 hover:bg-emerald-500 dark:bg-gradient-to-r dark:from-emerald-600 dark:to-emerald-500 dark:hover:from-emerald-500 dark:hover:to-emerald-400 shadow-emerald-500/20'
                    : 'bg-sharp-600 hover:bg-sharp-500 dark:bg-gradient-to-r dark:from-sharp-600 dark:to-sharp-500 dark:hover:from-sharp-500 dark:hover:to-sharp-400 shadow-sharp-glow'
                }`}
                title={isFree ? (isPng ? 'Download Free PNG' : 'Download Free PSD') : 'Buy Now'}
              >
                {downloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isFree ? (
                  <Download className="w-3.5 h-3.5" />
                ) : null}
                <span>{isFree ? 'Free' : 'Buy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
