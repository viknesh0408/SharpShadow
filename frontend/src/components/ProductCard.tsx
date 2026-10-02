import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isInCart, toggleWishlist, isWishlisted } = useCart();
  const { success } = useToast();
  const navigate = useNavigate();

  const inCart = isInCart(product.id);
  const wishlisted = isWishlisted(product.id);

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inCart) {
      addToCart(product);
    }
    navigate('/checkout');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inCart) {
      addToCart(product);
      success(`Added "${product.title}" to cart`);
    } else {
      navigate('/cart');
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;

  return (
    <div className="group relative bg-dark-900 border border-dark-800 hover:border-sharp-500/40 rounded-2xl overflow-hidden shadow-card-dark hover:shadow-card-hover transition-all duration-300 flex flex-col h-full">
      
      {/* Thumbnail Container - Square on mobile for maximum visibility */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-square sm:aspect-[4/3] overflow-hidden bg-dark-950">
        <img
          src={product.thumbnailUrl}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('unsplash.com')) {
              target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
            }
          }}
        />
        
        {/* Subtle dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/70 via-transparent to-black/20 opacity-50 group-hover:opacity-30 transition-opacity" />

        {/* Badges: Featured & Offer Percentage */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap z-10">
          {product.featured && (
            <span className="bg-gradient-to-r from-sharp-600 to-rose-500 text-white font-mono text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow-sharp-glow uppercase tracking-wider">
              Featured
            </span>
          )}
          {hasDiscount && (
            <span className="bg-emerald-600 text-white font-mono text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider">
              {Math.round(((product.price - product.discountPrice!) / product.price) * 100)}% off
            </span>
          )}
        </div>

        {/* Wishlist Button Overlay */}
        <button
          onClick={handleWishlist}
          className={`absolute bottom-2.5 right-2.5 p-2 rounded-full backdrop-blur-md border transition-all ${
            wishlisted
              ? 'bg-sharp-500 text-white border-sharp-400 shadow-sharp-glow'
              : 'bg-dark-900/80 text-slate-300 border-dark-700 hover:text-white hover:bg-dark-850'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
        </button>
      </Link>

      {/* Card Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & PSD label */}
          <div className="flex items-center justify-between gap-1">
            <Link
              to={`/category/${product.category.slug}`}
              className="text-[10px] sm:text-[11px] font-mono text-sharp-400 hover:text-sharp-300 uppercase tracking-wider font-semibold transition-colors truncate block"
            >
              {product.category.name}
            </Link>
            <span className="text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0 font-medium">
              PSD
            </span>
          </div>

          {/* Title */}
          <Link to={`/product/${product.slug}`} className="block mt-1">
            <h3 className="font-semibold text-xs sm:text-base text-slate-100 hover:text-white line-clamp-2 transition-colors leading-snug">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Price & Action Row */}
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-dark-800/80 flex items-center justify-between gap-2">
          
          {/* Price */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className={`text-sm sm:text-lg font-bold font-mono ${hasDiscount ? 'text-blue-400' : 'text-white'} truncate`}>
                ₹{hasDiscount ? product.discountPrice : product.price}
              </span>
              {hasDiscount && (
                <span className="text-[10px] sm:text-xs font-mono text-slate-400 line-through">
                  ₹{product.price}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleAddToCart}
              className={`p-2 rounded-xl transition-all border flex items-center justify-center ${
                inCart
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-sharp-600/20 hover:bg-sharp-600 text-sharp-400 hover:text-white border-sharp-500/40 shadow-sm'
              }`}
              title={inCart ? 'In Cart (Click to view)' : 'Add to Cart'}
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={handleQuickBuy}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white font-semibold text-xs shadow-sharp-glow transition-all"
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
