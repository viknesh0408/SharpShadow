import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CreditCard, QrCode, Lock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { QRPaymentModal } from '../components/QRPaymentModal';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Checkout: React.FC = () => {
  const { items, clearCart, totalAmount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const couponCode = (location.state as any)?.couponCode;

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'qr'>('razorpay');
  const [processing, setProcessing] = useState(false);
  const [qrModalOrder, setQrModalOrder] = useState<string | null>(null);

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
      // 1. Create order on backend (computes price from DB)
      const order = await orderService.createOrder(
        items.map((i) => i.id),
        couponCode
      );

      // If user selected QR payment mode, open QR modal
      if (paymentMethod === 'qr') {
        setQrModalOrder(order.orderNumber);
        setProcessing(false);
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

  const handleQrPaymentSuccess = () => {
    setQrModalOrder(null);
    clearCart();
    success('Payment confirmed via QR! Unlocking your downloads...');
    navigate('/account?tab=downloads');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Checkout Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Secure Checkout</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review your items and choose your preferred payment option
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Payment Methods (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-card-dark">
            <h3 className="font-bold text-base text-white">Select Payment Method</h3>

            {/* Option 1: Razorpay Instant Checkout */}
            <label
              onClick={() => setPaymentMethod('razorpay')}
              className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'razorpay'
                  ? 'bg-dark-850 border-sharp-500 shadow-sharp-glow/20'
                  : 'bg-dark-950 border-dark-800 hover:border-dark-750'
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'razorpay'}
                onChange={() => setPaymentMethod('razorpay')}
                className="mt-1 text-sharp-600 focus:ring-sharp-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sharp-400" />
                  <span className="font-semibold text-sm text-white">Razorpay Standard Checkout</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Instant checkout supporting UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, and NetBanking.
                </p>
              </div>
            </label>

            {/* Option 2: Scan & Pay QR (Section 14) */}
            <label
              onClick={() => setPaymentMethod('qr')}
              className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'qr'
                  ? 'bg-dark-850 border-sharp-500 shadow-sharp-glow/20'
                  : 'bg-dark-950 border-dark-800 hover:border-dark-750'
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'qr'}
                onChange={() => setPaymentMethod('qr')}
                className="mt-1 text-sharp-600 focus:ring-sharp-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-sm text-white">Scan & Pay (Dynamic UPI QR)</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Displays an authentic Razorpay-compatible dynamic QR code to scan from your phone. Verified automatically.
                </p>
              </div>
            </label>

            {/* Customer Details Snapshot */}
            <div className="pt-4 border-t border-dark-800 space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Billing Customer</span>
              <div className="p-3 bg-dark-950 rounded-xl border border-dark-800 text-xs text-slate-300 flex justify-between items-center font-mono">
                <div>
                  <span className="font-semibold text-white block">{user?.name}</span>
                  <span className="text-slate-400">{user?.email}</span>
                </div>
                <span className="text-emerald-400">Authenticated</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handlePayWithRazorpay}
              disabled={processing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white font-bold text-base shadow-sharp-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting to Razorpay...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Pay Securely & Get Instant Access</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Order Review (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-card-dark">
            <h3 className="font-bold text-base text-white">Items in Order ({items.length})</h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-dark-800/60 last:border-0">
                  <img src={item.thumbnailUrl} alt={item.title} className="w-12 h-12 rounded-lg object-cover bg-dark-950 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Layered PSD</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-white shrink-0">
                    ₹{item.discountPrice != null ? item.discountPrice : item.price}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-dark-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono text-white">₹{totalAmount.toFixed(2)}</span>
              </div>
              {couponCode && (
                <div className="flex justify-between text-emerald-400">
                  <span>Applied Promo:</span>
                  <span className="font-mono">{couponCode}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-dark-800 text-sm font-bold text-white">
                <span>Total Charge:</span>
                <span className="font-mono text-xl text-sharp-400">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal when selected */}
      {qrModalOrder && (
        <QRPaymentModal
          orderNumber={qrModalOrder}
          onSuccess={handleQrPaymentSuccess}
          onClose={() => setQrModalOrder(null)}
        />
      )}
    </div>
  );
};
