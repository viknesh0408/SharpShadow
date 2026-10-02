import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const { error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
      setSubmitted(true);
    } catch (err: any) {
      error(err.response?.data?.message || 'Could not process password reset request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-dark-900 border border-dark-800 rounded-3xl p-8 shadow-card-dark space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-xs text-slate-400">
            Enter the email address associated with your account to reset your credentials.
          </p>
        </div>

        {submitted ? (
          <div className="bg-dark-950 border border-dark-800 rounded-2xl p-6 text-center space-y-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="font-semibold text-white text-sm">Reset Request Processed</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If an account matching <span className="text-slate-200 font-mono">{email}</span> exists, you can proceed to choose a new password.
            </p>

            {resetToken ? (
              <div className="pt-2 space-y-3">
                <Link
                  to={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 text-white font-semibold text-xs shadow-sharp-glow transition-all"
                >
                  Click Here to Reset Password Now →
                </Link>
                <p className="text-[10px] text-slate-500 font-mono">
                  Token: {resetToken.slice(0, 8)}... (Valid for 30 minutes)
                </p>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-block mt-2 text-xs font-semibold text-sharp-400 hover:text-sharp-300"
              >
                Return to Login
              </Link>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 text-white font-semibold text-sm shadow-sharp-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Link</span>}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
