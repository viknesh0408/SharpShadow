import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2, Inbox } from 'lucide-react';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err: any) {
      error(err.response?.data?.message || 'Could not process password reset request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-dark-900 border border-dark-800 rounded-3xl p-8 shadow-card-dark space-y-6">

        {submitted ? (
          /* ── Success State ── */
          <div className="text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <Inbox className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-white">Check Your Inbox</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                If <span className="text-slate-200 font-mono">{email}</span> is registered with
                SharpShadow, we've sent a password reset link to that address.
              </p>
            </div>

            <div className="bg-dark-950 border border-dark-800 rounded-2xl p-4 text-left space-y-2">
              <p className="text-[11px] font-mono text-slate-300 font-semibold uppercase tracking-wider">What to do next</p>
              <ol className="space-y-1.5 text-xs text-slate-400 list-decimal list-inside">
                <li>Open your email inbox (check Spam/Junk if needed)</li>
                <li>Click the <span className="text-white font-semibold">"Reset My Password"</span> button in the email</li>
                <li>Choose a new password within <span className="text-amber-400 font-semibold">30 minutes</span></li>
              </ol>
            </div>

            <p className="text-[10px] text-slate-500">
              Didn't receive it? Make sure you used the correct email, or{' '}
              <button
                onClick={() => { setSubmitted(false); }}
                className="text-sharp-400 hover:text-sharp-300 font-semibold"
              >
                try again
              </button>
              .
            </p>

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          /* ── Form State ── */
          <>
            <div className="text-center space-y-2">
              <Link to="/" className="inline-flex items-center justify-center mb-2 group">
                <img
                  src="/logo.png"
                  alt="SharpShadow Logo"
                  className="w-14 h-14 rounded-full object-contain shadow-sharp-glow group-hover:scale-105 transition-transform duration-300 ring-2 ring-sharp-500/30"
                />
              </Link>
              <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
              <p className="text-xs text-slate-400">
                Enter your account email and we'll send you a secure reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 text-white font-semibold text-sm shadow-sharp-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
