import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successReset, setSuccessReset] = useState(false);

  const { error, success } = useToast();

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      error('Reset token is required');
      return;
    }
    if (newPassword.length < 6) {
      error('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const msg = await authService.resetPassword({
        token: token.trim(),
        newPassword,
        confirmPassword,
      });
      success(msg || 'Password has been reset successfully!');
      setSuccessReset(true);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to reset password. Token may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-dark-900 border border-dark-800 rounded-3xl p-8 shadow-card-dark space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center mb-2 group">
            <img
              src="/logo.png"
              alt="SharpShadows Logo"
              className="w-14 h-14 rounded-full object-contain shadow-sharp-glow group-hover:scale-105 transition-transform duration-300 ring-2 ring-sharp-500/30"
            />
          </Link>
          <h1 className="text-2xl font-bold text-white">Choose New Password</h1>
          <p className="text-xs text-slate-400">
            Set a secure password for your SharpShadows account to regain access.
          </p>
        </div>

        {successReset ? (
          <div className="bg-dark-950 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-semibold text-white text-base">Password Reset Complete</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your password has been successfully updated. You can now securely log in with your new credentials.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center py-3 rounded-xl bg-sharp-600 hover:bg-sharp-500 text-white font-semibold text-sm shadow-sharp-glow transition-all"
            >
              Sign In to Your Account
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">
                Reset Authorization Token
              </label>
              <input
                type="text"
                required
                placeholder="Enter reset token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl py-2.5 px-4 text-xs font-mono text-white placeholder-slate-600 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 uppercase block mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {newPassword && confirmPassword && (
                <div className="mt-1.5">
                  {newPassword === confirmPassword ? (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-[11px] text-rose-400 font-mono">Passwords do not match</span>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !token.trim() || newPassword.length < 6 || newPassword !== confirmPassword}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 text-white font-semibold text-sm shadow-sharp-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Set New Password</span>
              )}
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
