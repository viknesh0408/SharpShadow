import React, { useEffect, useState } from 'react';
import { X, QrCode, CheckCircle2, Loader2, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { paymentService, QRPaymentInfo } from '../services/paymentService';

interface QRPaymentModalProps {
  orderNumber: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const QRPaymentModal: React.FC<QRPaymentModalProps> = ({ orderNumber, onSuccess, onClose }) => {
  const [qrInfo, setQrInfo] = useState<QRPaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadInfo = async () => {
      try {
        const info = await paymentService.getQrPayment(orderNumber);
        if (isMounted) {
          setQrInfo(info);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Could not load QR payment information');
          setLoading(false);
        }
      }
    };
    loadInfo();

    return () => {
      isMounted = false;
    };
  }, [orderNumber]);

  // Polling backend status every 3 seconds to check if Razorpay verified the transaction
  useEffect(() => {
    if (paid) return;

    const interval = setInterval(async () => {
      try {
        const res = await paymentService.checkStatus(orderNumber);
        if (res.status === 'PAID') {
          setPaid(true);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } catch {
        // Continue polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderNumber, paid, onSuccess]);

  const copyPayload = () => {
    if (qrInfo?.qrCodePayload) {
      navigator.clipboard.writeText(qrInfo.qrCodePayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate QR image via high-reliability QR server API
  const qrImageUrl = qrInfo?.qrCodePayload
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(qrInfo.qrCodePayload)}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-dark-900 border border-dark-750 rounded-3xl max-w-md w-full p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-dark-800 hover:bg-dark-750 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-sharp-500/10 text-sharp-400 flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Scan & Pay with UPI</h3>
          <p className="text-xs text-slate-400 mt-1">
            Scan using Google Pay, PhonePe, Paytm, or any UPI banking app
          </p>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-sharp-500 animate-spin" />
            <span className="text-sm text-slate-400">Generating secure payment payload...</span>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sharp-400 text-sm">{error}</div>
        ) : paid ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-white">Payment Verified!</h4>
            <p className="text-xs text-slate-300">
              Your transaction was verified by Razorpay. Unlocking your downloads now...
            </p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center">
            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-2xl shadow-lg">
              <img
                src={qrImageUrl}
                alt="Scan to pay"
                className="w-56 h-56 rounded-lg"
              />
            </div>

            {/* Details */}
            <div className="w-full mt-5 bg-dark-950/60 border border-dark-800 rounded-xl p-3 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Order Number:</span>
                <span className="text-slate-200 font-semibold">{qrInfo?.orderNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Amount:</span>
                <span className="text-sharp-400 font-bold text-sm">₹{qrInfo?.amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Status indicator */}
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-amber-400">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Waiting for payment confirmation from Razorpay...</span>
            </div>

            {/* Copy UPI link option */}
            <button
              onClick={copyPayload}
              className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'UPI URI Copied!' : 'Copy raw UPI intent string'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
