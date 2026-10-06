import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Ticket, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { couponService, ApplyCouponResult } from '../services/couponService';
import { useToast } from '../context/ToastContext';

export const Cart: React.FC = () => {
  const {
    items,
    removeFromCart,
    clearCart,
    totalAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    finalTotal,
  } = useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setApplying(true);
    try {
      const res = await couponService.validateCoupon(
        couponCode.trim(),
        items.map((i) => i.id)
      );
      applyCoupon(res);
      setCouponCode('');
      success(res.message || 'Coupon applied successfully!');
    } catch (err: any) {
      error(err.response?.data?.message || 'Invalid or expired coupon code');
    } finally {
      setApplying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-dark-900 border border-dark-800 flex items-center justify-center mx-auto text-slate-500 shadow-xl">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Your Cart is Empty</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Explore our collection of editable Photoshop templates and save hours on your creative projects.
        </p>
        <Link
          to="/browse"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-sharp-600 hover:bg-sharp-500 dark:bg-gradient-to-r dark:from-sharp-600 dark:to-sharp-500 text-white font-semibold text-sm shadow-sharp-glow hover:scale-[1.02] transition-all"
        >
          <span>Explore PSD Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-6 border-b border-dark-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Shopping Cart</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {items.length} {items.length === 1 ? 'asset' : 'assets'} ready for instant digital delivery
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-slate-400 hover:text-sharp-400 transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const hasDiscount = item.discountPrice != null && item.discountPrice < item.price;
            const price = hasDiscount ? item.discountPrice! : item.price;

            return (
              <div
                key={item.id}
                className="bg-dark-900 border border-dark-800 rounded-2xl p-3 sm:p-5 flex items-center gap-3 sm:gap-6 shadow-card-dark"
              >
                {/* Thumbnail */}
                <Link
                  to={`/product/${item.slug}`}
                  className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-dark-950 shrink-0 border border-dark-750"
                >
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono text-sharp-400 uppercase tracking-wider font-bold">
                    {item.category?.name || 'PSD TEMPLATE'}
                  </span>
                  <Link to={`/product/${item.slug}`} className="block">
                    <h3 className="font-semibold text-xs sm:text-base text-white hover:text-sharp-400 transition-colors truncate">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="mt-1 flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-400 font-mono">
                    <span className="hidden xs:inline">{item.fileSize || 'Layered PSD'}</span>
                    <span className="hidden xs:inline">•</span>
                    <span className="text-emerald-400">Instant Access</span>
                  </div>
                </div>

                {/* Price & Remove */}
                <div className="flex flex-col items-end gap-1.5 sm:gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <span className={`font-mono font-bold text-sm sm:text-lg ${hasDiscount ? 'text-blue-400' : 'text-white'}`}>
                      ₹{price}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-[10px] sm:text-xs font-mono text-slate-400 line-through">
                          ₹{item.price}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded leading-none shrink-0 shadow-sm">
                          {Math.round(((item.price - item.discountPrice!) / item.price) * 100)}% off
                        </span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-slate-400 hover:text-sharp-400 rounded-lg hover:bg-dark-800 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-4">
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Order Summary & Coupon (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-6 shadow-card-dark">
            <h3 className="font-bold text-lg text-white">Order Summary</h3>

            {/* Price Breakdown */}
            <div className="space-y-3 text-sm divide-y divide-dark-800">
              <div className="flex justify-between text-slate-300 pt-2">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-mono text-white font-semibold">₹{totalAmount.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400 pt-2 items-center">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Coupon ({appliedCoupon.code})</span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[10px] text-slate-400 hover:text-sharp-400 underline ml-1 cursor-pointer"
                      title="Remove coupon"
                    >
                      Remove
                    </button>
                  </span>
                  <span className="font-mono font-semibold">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-4 text-base font-bold text-white">
                <span>Total Amount</span>
                <span className="text-2xl font-black font-mono text-sharp-400">
                  ₹{finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Coupon Code Input */}
            {appliedCoupon ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-400 block">{appliedCoupon.code}</span>
                    <span className="text-[10px] text-slate-400">Coupon applied</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs text-slate-400 hover:text-sharp-400 font-semibold transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-sharp-400" />
                  Have a Promo Code?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. SHARP20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl px-3 py-2 text-xs font-mono uppercase text-white outline-none"
                  />
                  <button
                    type="submit"
                    disabled={applying || !couponCode.trim()}
                    className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-750 text-white font-medium text-xs border border-dark-700 disabled:opacity-40 transition-colors"
                  >
                    {applying ? 'Checking...' : 'Apply'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">Try code <span className="font-mono text-slate-300">SHARP20</span> for 20% off orders over ₹299</p>
              </form>
            )}

            {/* Checkout Button */}
            <button
              onClick={() => navigate('/checkout', { state: { couponCode: appliedCoupon?.code } })}
              className="w-full py-4 rounded-2xl bg-sharp-600 hover:bg-sharp-500 dark:bg-gradient-to-r dark:from-sharp-600 dark:to-sharp-500 dark:hover:from-sharp-500 dark:hover:to-sharp-400 text-white font-bold text-sm shadow-sharp-glow transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Secure Payment Note */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Razorpay 256-bit encrypted checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
