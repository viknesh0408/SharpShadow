import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Lock, Mail, Loader2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid administrator email'),
  password: z.string().min(1, 'Password is required'),
});

type AdminLoginData = z.infer<typeof adminLoginSchema>;

export const AdminLogin: React.FC = () => {
  const { adminLogin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isDev = import.meta.env.DEV;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdminLoginData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: isDev ? 'admin@sharpshadow.com' : '',
      password: '',
    },
  });

  const handleAutoFill = () => {
    setValue('email', 'admin@sharpshadow.com', { shouldValidate: true });
    setValue('password', 'Admin#SharpShadow2026!', { shouldValidate: true });
  };

  const onSubmit = async (data: AdminLoginData) => {
    setLoading(true);
    try {
      await adminLogin({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });
      success('Admin authorized successfully');
      navigate('/admin');
    } catch (err: any) {
      error(err.response?.data?.message || 'Admin authentication failed. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-dark-900 border border-dark-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-sharp-600/20 blur-[80px] pointer-events-none rounded-full" />

        <div className="text-center space-y-2 relative z-10">
          <Link to="/" className="inline-block group mb-1">
            <img
              src="/logo.png"
              alt="SharpShadow Admin"
              className="w-16 h-16 rounded-full object-contain mx-auto shadow-sharp-glow group-hover:scale-105 transition-transform ring-2 ring-sharp-500/30"
            />
          </Link>
          <h1 className="text-2xl font-black text-white tracking-wide">SHARPSHADOW ADMIN</h1>
          <p className="text-xs text-slate-400">
            Protected marketplace management console. Requires administrative privileges.
          </p>
        </div>

        {/* Credentials Helper Pill - Only visible during local development */}
        {isDev && (
          <div className="relative z-10 bg-dark-950/80 border border-dark-750 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-sharp-400" />
                <span>Dev Admin Credentials:</span>
              </div>
              <div className="text-slate-400 font-mono text-[11px] truncate">
                admin@sharpshadow.com
              </div>
            </div>
            <button
              type="button"
              onClick={handleAutoFill}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-sharp-500/15 hover:bg-sharp-500/25 text-sharp-400 border border-sharp-500/30 transition-all flex items-center gap-1 shrink-0"
            >
              Auto-fill
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10">
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="admin@sharpshadow.com"
                {...register('email')}
                className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {errors.email && <p className="text-xs text-sharp-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-sharp-400 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white font-bold text-sm shadow-sharp-glow transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Authenticate as Administrator</span>}
          </button>
        </form>
      </div>
    </div>
  );
};
