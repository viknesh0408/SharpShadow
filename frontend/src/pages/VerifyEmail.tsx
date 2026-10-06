import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, KeyRound, Mail, Loader2, RotateCcw, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';

export const VerifyEmail: React.FC = () => {
  const { verifyEmail } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialEmail = searchParams.get('email') || '';
  const initialOtp = searchParams.get('otp') || '';
  const redirect = searchParams.get('redirect') || '/account';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(initialOtp);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // If email and OTP are provided via URL (1-click link from email), verify automatically!
  useEffect(() => {
    if (initialEmail && initialOtp && initialOtp.length === 6) {
      handleAutoVerify(initialEmail, initialOtp);
    }
  }, []);

  const handleAutoVerify = async (verifyEmailAddr: string, verifyOtpVal: string) => {
    setLoading(true);
    try {
      await verifyEmail({ email: verifyEmailAddr.trim().toLowerCase(), otp: verifyOtpVal.trim() });
      success('Email verified successfully! Welcome to SharpShadows.');
      navigate(redirect);
    } catch (err: any) {
      error(err.response?.data?.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim().replace(/\D/g, '');

    if (!cleanEmail) {
      error('Please enter your email address');
      return;
    }
    if (cleanOtp.length !== 6) {
      error('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail({ email: cleanEmail, otp: cleanOtp });
      success('Email verified successfully! You are now logged in.');
      navigate(redirect);
    } catch (err: any) {
      error(err.response?.data?.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      error('Please enter your email address first to resend code');
      return;
    }
    if (countdown > 0 || resending) return;

    setResending(true);
    try {
      await authService.resendOtp(cleanEmail);
      success('A fresh verification code has been sent to your email!');
      setCountdown(60);
      setOtp('');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to resend verification code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <div className="max-w-md w-full bg-dark-900 border border-dark-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-card-dark space-y-6">

        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center mb-2 group">
            <img
              src="/logo.png"
              alt="SharpShadows Logo"
              className="w-14 h-14 rounded-full object-contain shadow-sharp-glow group-hover:scale-105 transition-transform duration-300 ring-2 ring-sharp-500/30"
            />
          </Link>
          <h1 className="text-2xl font-bold text-white">Verify Your Email</h1>
          <p className="text-xs text-slate-400">
            Enter the 6-digit code received in your email inbox to activate your SharpShadows account.
          </p>
        </div>

        <div className="bg-dark-950 border border-dark-750/70 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sharp-500/10 border border-sharp-500/20 flex items-center justify-center text-sharp-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs leading-relaxed text-slate-300">
            Check your spam/junk folder if the email doesn't appear in your primary inbox within 1 minute.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors font-mono"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5 text-center">
              6-Digit Verification Code
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full bg-dark-950 border-2 border-dark-750 focus:border-sharp-500 rounded-xl py-3 text-center text-2xl font-mono font-bold tracking-[0.4em] text-white placeholder-slate-700 outline-none transition-colors"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6 || !email}
            className="w-full py-3 rounded-xl bg-sharp-600 hover:bg-sharp-500 dark:bg-gradient-to-r dark:from-sharp-600 dark:to-sharp-500 dark:hover:from-sharp-500 dark:hover:to-sharp-400 text-white font-semibold text-sm shadow-sharp-glow transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify & Activate Account</span>}
          </button>

          <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
            <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
              Back to Sign In
            </Link>

            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || resending || !email}
              className="inline-flex items-center gap-1 text-sharp-400 hover:text-sharp-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              {resending
                ? 'Sending...'
                : countdown > 0
                ? `Resend in ${countdown}s`
                : 'Resend Code'}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-dark-800">
          <span>Need a new account? </span>
          <Link to="/register" className="text-sharp-400 hover:text-sharp-300 font-semibold">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
