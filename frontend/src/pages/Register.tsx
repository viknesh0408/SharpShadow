import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, User as UserIcon, Loader2, ShieldCheck, KeyRound, RotateCcw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: authRegister, verifyEmail } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otp, setOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [countdown, setCountdown] = useState(60);

  // Countdown timer for Resend OTP button
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const res = await authRegister(data);
      if (res.emailVerified) {
        // In case account is already verified or direct login
        success('Account created successfully! Welcome to SharpShadow.');
        navigate(redirect);
      } else {
        // Move to OTP verification step
        setRegisteredEmail(data.email.trim().toLowerCase());
        setStep('otp');
        setCountdown(60);
        success('Verification code sent to your email inbox!');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      error('Please enter the 6-digit verification code');
      return;
    }

    setOtpLoading(true);
    try {
      await verifyEmail({ email: registeredEmail, otp: cleanOtp });
      success('Email verified successfully! Welcome to SharpShadow.');
      navigate(redirect);
    } catch (err: any) {
      error(err.response?.data?.message || 'Invalid or expired verification code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      await authService.resendOtp(registeredEmail);
      success('A fresh verification code has been sent to your email!');
      setCountdown(60);
      setOtp('');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <div className="max-w-md w-full bg-dark-900 border border-dark-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-card-dark space-y-6">

        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center mb-2 group">
            <img
              src="/logo.png"
              alt="SharpShadow Logo"
              className="w-14 h-14 rounded-full object-contain shadow-sharp-glow group-hover:scale-105 transition-transform duration-300 ring-2 ring-sharp-500/30"
            />
          </Link>
          <h1 className="text-2xl font-bold text-white">
            {step === 'form' ? 'Create Account' : 'Verify Your Email'}
          </h1>
          <p className="text-xs text-slate-400">
            {step === 'form'
              ? 'Join thousands of designers accessing premium Photoshop templates'
              : `We sent a 6-digit security code to ${registeredEmail}`}
          </p>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Bakyanath"
                  {...register('name')}
                  className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                />
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {errors.name && <p className="text-xs text-sharp-400 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {errors.email && <p className="text-xs text-sharp-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {errors.password && <p className="text-xs text-sharp-400 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {errors.confirmPassword && <p className="text-xs text-sharp-400 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white font-semibold text-sm shadow-sharp-glow transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Continue & Send Code</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="bg-dark-950 border border-dark-750/70 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sharp-500/10 border border-sharp-500/20 flex items-center justify-center text-sharp-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs leading-relaxed text-slate-300">
                A 6-digit verification code has been sent to{' '}
                <span className="text-white font-semibold font-mono">{registeredEmail}</span>. Enter it below to activate your account.
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-2 text-center">
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
              disabled={otpLoading || otp.length !== 6}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white font-semibold text-sm shadow-sharp-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify & Activate Account</span>}
            </button>

            <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back / Edit Details
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || resending}
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
        )}

        <div className="text-center text-xs text-slate-400">
          <span>Already have an account? </span>
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-sharp-400 hover:text-sharp-300 font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
