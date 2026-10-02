import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Lock, Mail, Loader2 } from 'lucide-react';
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginData>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginData) => {
    setLoading(true);
    try {
      await adminLogin(data);
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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sharp-600 to-rose-500 text-white flex items-center justify-center mx-auto shadow-sharp-glow">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">SHARPSHADOW ADMIN</h1>
          <p className="text-xs text-slate-400">
            Protected marketplace management console. Requires administrative privileges.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10">
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="admin"
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
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
