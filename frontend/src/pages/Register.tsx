import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

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
  const { register: authRegister } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const [loading, setLoading] = useState(false);

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
      await authRegister(data);
      success('Account created successfully! Welcome to SharpShadow.');
      navigate(redirect);
    } catch (err: any) {
      error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-dark-900 border border-dark-800 rounded-3xl p-8 shadow-card-dark space-y-6">

        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sharp-600 to-sharp-500 flex items-center justify-center text-white font-mono font-bold text-lg shadow-sharp-glow">
              SS
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-xs text-slate-400">
            Join thousands of designers accessing premium Photoshop templates
          </p>
        </div>

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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
          </button>
        </form>

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
