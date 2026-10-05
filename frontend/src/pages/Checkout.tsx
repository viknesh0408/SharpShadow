import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CreditCard, Lock, CheckCircle2, Loader2, Ticket, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { couponService } from '../services/couponService';
import { downloadService } from '../services/downloadService';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Checkout: React.FC = () => {
  const {
    items,
    clearCart,
    totalAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    finalTotal,
  } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const stateCouponCode = (location.state as any)?.couponCode;

  const [processing, setProcessing] = useState(false);
  const [inputCoupon, setInputCoupon] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // If a coupon code came via route state but context hasn't loaded it, validate & apply
  useEffect(() => {
    if (stateCouponCode && !appliedCoupon && items.length > 0) {
      couponService
        .validateCoupon(stateCouponCode, items.map((i) => i.id))
        .then((res) => {
          applyCoupon(res);
        })
        .catch(() => {});
    }
  }, [stateCouponCode, appliedCoupon, items]);

  const handleApplyCheckoutCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await couponService.validateCoupon(
        inputCoupon.trim(),
        items.map((i) => i.id)
      );
      applyCoupon(res);
      setInputCoupon('');
      success(res.message || 'Coupon applied successfully!');
    } catch (err: any) {
      error(err.response?.data?.message || 'Invalid or expired coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Your cart is empty</h2>
        <p className="text-xs text-slate-400">Please select at least one PSD asset before checking out.</p>
        <Link to="/browse" className="inline-block px-4 py-2 rounded-xl bg-sharp-600 text-white text-xs font-semibold">
          Browse Templates
        </Link>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 bg-dark-900 border border-dark-800 rounded-3xl p-8 text-center space-y-5 my-12 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-sharp-500/10 text-sharp-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Account Required for Checkout</h2>
        <p className="text-xs text-slate-400">
          Please log in or create an account so your purchased PSD assets are securely assigned to your account for unlimited re-downloads.
        </p>
        <div className="flex flex-col gap-2.5 pt-2">
          <Link
            to={`/login?redirect=${encodeURIComponent('/checkout')}`}
            className="w-full py-3 rounded-xl bg-sharp-600 hover:bg-sharp-500 text-white font-semibold text-sm transition-colors"
          >
            Login to Existing Account
          </Link>
          <Link
            to={`/register?redirect=${encodeURIComponent('/checkout')}`}
            className="w-full py-3 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-200 font-semibold text-sm border border-dark-700 transition-colors"
          >
            Create New Account
          </Link>
        </div>
      </div>
    );
  }

  const handlePayWithRazorpay = async () => {
    setProcessing(true);
    try {
      // 1. Create order on backend with applied coupon (computes price from DB)
      const order = await orderService.createOrder(
        items.map((i) => i.id),
        appliedCoupon?.code || stateCouponCode
      );

      // If order is free, backend automatically marks it PAID without payment!
      if (order.status === 'PAID' || order.totalAmount === 0) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });

        clearCart();
        success('Free order confirmed! Your PSD downloads are now ready.');

        // Auto-download if single item
        if (items.length === 1) {
          try {
            const dl = await downloadService.getDownloadUrl(items[0].id);
            window.location.href = dl.downloadUrl;
          } catch (e) {}
        }

        navigate('/account?tab=downloads');
        return;
      }

      // 2. Open standard Razorpay Checkout Modal
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      const options = {
        key: order.razorpayKeyId,
        amount: Math.round(order.totalAmount * 100),
        currency: order.currency,
        name: 'SharpShadow Digital',
        description: `Order #${order.orderNumber}`,
        order_id: order.razorpayOrderId,
        handler: async (response: any) => {
          try {
            // 3. Backend verifies signature and updates order
            await paymentService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentMethod: 'razorpay_checkout',
            });

            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
            });

            clearCart();
            success('Payment confirmed! Your PSD downloads are now ready.');
            navigate('/account?tab=downloads');
          } catch (err: any) {
            error(err.response?.data?.message || 'Payment signature verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#e63946',
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        error(response.error.description || 'Payment was unsuccessful');
        setProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Could not initiate checkout');
      setProcessing(false);
    }
  };

  const isFreeCheckout = finalTotal === 0;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Checkout Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {isFreeCheckout ? 'Claim Free Assets' : 'Secure Checkout'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isFreeCheckout
            ? 'Review your selected free PSD templates and get instant download access'
            : 'Review your items and complete payment securely via Razorpay'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Payment Methods (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-5 sm:space-y-6 shadow-sm dark:shadow-card-dark">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isFreeCheckout ? 'Order Information' : 'Payment Method'}
            </h3>

            {/* Free or Razorpay Checkout */}
            {isFreeCheckout ? (
              <div className="p-4 rounded-2xl border bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">100% Free Order</span>
                  </div>
                  <span className="text-[10px] bg-emerald-200/60 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded font-mono font-bold">
                    NO PAYMENT NEEDED
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  All items in this order are completely free. You do not need to enter payment details. Click below to claim and start your download immediately.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border bg-slate-50 dark:bg-dark-850 border-sharp-500/40 shadow-sharp-glow/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-sharp-600 dark:text-sharp-400" />
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">Razorpay Secure Checkout</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded font-mono font-medium">
                    VERIFIED GATEWAY
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Supports UPI (Google Pay, PhonePe, Paytm, QR Scan), Debit &amp; Credit Cards, and NetBanking via Razorpay's PCI-DSS compliant secure checkout.
                </p>
              </div>
            )}

            {/* Customer Details Snapshot */}
            <div className="pt-4 border-t border-slate-200 dark:border-dark-800 space-y-2">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">Billing Customer</span>
              <div className="p-3 bg-slate-50 dark:bg-dark-950 rounded-xl border border-slate-200 dark:border-dark-800 text-xs text-slate-700 dark:text-slate-300 flex justify-between items-center font-mono">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">{user?.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">{user?.email}</span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Authenticated</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handlePayWithRazorpay}
              disabled={processing}
              className={`w-full py-4 rounded-2xl text-white font-bold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                isFreeCheckout
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-600/25 hover:scale-[1.01]'
                  : 'bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 shadow-sharp-glow hover:scale-[1.01]'
              }`}
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isFreeCheckout ? 'Claiming Free Assets...' : 'Connecting to Razorpay...'}</span>
                </>
              ) : isFreeCheckout ? (
                <>
                  <Download className="w-5 h-5" />
                  <span>Claim Free Download ({items.length} {items.length === 1 ? 'Asset' : 'Assets'})</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Pay ₹{finalTotal.toFixed(2)} & Get Instant Access</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Order Review (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-4 shadow-sm dark:shadow-card-dark">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Items in Order ({items.length})</h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-dark-800/60 last:border-0">
                  <img src={item.thumbnailUrl} alt={item.title} className="w-12 h-12 rounded-lg object-cover bg-dark-950 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Layered PSD</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`font-mono text-xs font-bold ${item.discountPrice != null && item.discountPrice < item.price ? 'text-blue-400' : 'text-white'}`}>
                      ₹{item.discountPrice != null && item.discountPrice < item.price ? item.discountPrice : item.price}
                    </span>
                    {item.discountPrice != null && item.discountPrice < item.price && (
                      <span className="font-mono text-[10px] text-slate-400 line-through">
                        ₹{item.price}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Inline Coupon Input for Checkout */}
            {!appliedCoupon && (
              <form onSubmit={handleApplyCheckoutCoupon} className="pt-2 border-t border-dark-800">
                <label className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5 mb-1.5">
                  <Ticket className="w-3 h-3 text-sharp-400" />
                  Have a Promo Code?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. SHARP20"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                    className="flex-1 bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl px-3 py-1.5 text-xs font-mono uppercase text-white outline-none"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon || !inputCoupon.trim()}
                    className="px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-white font-medium text-xs border border-dark-700 disabled:opacity-40 transition-colors"
                  >
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
              </form>
            )}

            <div className="pt-3 border-t border-dark-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({items.length} items):</span>
                <span className="font-mono text-white">₹{totalAmount.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400 items-center">
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
              <div className="flex justify-between items-baseline pt-2 border-t border-dark-800 text-sm font-bold text-white">
                <span>Total Charge:</span>
                <span className="font-mono text-xl text-sharp-400">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
