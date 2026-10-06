import React, { useEffect, useState } from 'react';
import {
  Save,
  Globe,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  MessageSquare,
  Facebook,
  Mail,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { settingService } from '../../services/settingService';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

export const AdminSettings: React.FC = () => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Admin password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [form, setForm] = useState({
    social_github: '',
    social_twitter: '',
    social_instagram: '',
    social_youtube: '',
    social_linkedin: '',
    social_discord: '',
    social_facebook: '',
    public_contact_email: 'sharpshadowss@gmail.com',
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingService.getAllSettings();
        setForm({
          social_github: data.social_github || '',
          social_twitter: data.social_twitter || '',
          social_instagram: data.social_instagram || '',
          social_youtube: data.social_youtube || '',
          social_linkedin: data.social_linkedin || '',
          social_discord: data.social_discord || '',
          social_facebook: data.social_facebook || '',
          public_contact_email: data.public_contact_email || 'sharpshadowss@gmail.com',
        });
      } catch (err: any) {
        error(err.response?.data?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingService.updateSettings(form);
      success('Settings & Social Links updated successfully!');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      error('Please enter your current administrator password');
      return;
    }
    if (newPassword.length < 6) {
      error('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      const msg = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      success(msg || 'Administrator password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update administrator password');
    } finally {
      setChangingPassword(false);
    }
  };

  const platforms = [
    {
      key: 'social_github' as const,
      label: 'GitHub URL',
      icon: Github,
      color: 'text-white hover:text-white',
      placeholder: 'https://github.com/your-username',
    },
    {
      key: 'social_twitter' as const,
      label: 'Twitter / X URL',
      icon: Twitter,
      color: 'text-sky-400 hover:text-sky-300',
      placeholder: 'https://x.com/your-handle',
    },
    {
      key: 'social_instagram' as const,
      label: 'Instagram URL',
      icon: Instagram,
      color: 'text-pink-400 hover:text-pink-300',
      placeholder: 'https://instagram.com/your-profile',
    },
    {
      key: 'social_youtube' as const,
      label: 'YouTube URL',
      icon: Youtube,
      color: 'text-red-400 hover:text-red-300',
      placeholder: 'https://youtube.com/@your-channel',
    },
    {
      key: 'social_linkedin' as const,
      label: 'LinkedIn URL',
      icon: Linkedin,
      color: 'text-blue-400 hover:text-blue-300',
      placeholder: 'https://linkedin.com/company/your-page',
    },
    {
      key: 'social_discord' as const,
      label: 'Discord Community URL',
      icon: MessageSquare,
      color: 'text-indigo-400 hover:text-indigo-300',
      placeholder: 'https://discord.gg/your-server',
    },
    {
      key: 'social_facebook' as const,
      label: 'Facebook Page URL',
      icon: Facebook,
      color: 'text-blue-500 hover:text-blue-400',
      placeholder: 'https://facebook.com/your-page',
    },
  ];

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-sharp-500 animate-spin" />
        <span className="text-xs text-slate-400 font-mono">Loading marketplace settings...</span>
      </div>
    );
  }

  const activeLinksCount = Object.values(form).filter((v) => v.trim().length > 0).length;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-dark-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketplace Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure social media links and external channels displayed across the footer.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white font-semibold text-xs shadow-sharp-glow transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Contact Email Section */}
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-card-dark">
          <div className="flex items-center justify-between pb-4 border-b border-dark-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sharp-500/10 text-sharp-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
                  Official Support & Client Contact Email
                </h3>
                <p className="text-xs text-slate-400">
                  Displayed on the Contact & Support page, footer links, and customer inquiries.
                </p>
              </div>
            </div>
            {form.public_contact_email.trim() && (
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 bg-dark-950 border border-dark-750 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </span>
            )}
          </div>

          <div className="max-w-xl space-y-2">
            <label className="text-xs font-mono text-slate-300 uppercase flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-sharp-400" />
              <span>Contact Email Address</span>
            </label>
            <input
              type="email"
              value={form.public_contact_email}
              onChange={(e) => handleChange('public_contact_email' as any, e.target.value)}
              placeholder="e.g. sharpshadowss@gmail.com"
              className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono placeholder:text-slate-600 transition-colors"
            />
            <p className="text-[11px] text-slate-500">
              Client verified contact address. Fallback is <span className="text-slate-300 font-mono">sharpshadowss@gmail.com</span>.
            </p>
          </div>
        </div>

        {/* Social Media Links Section */}
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-card-dark">
          <div className="flex items-center justify-between pb-4 border-b border-dark-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sharp-500/10 text-sharp-400 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
                  Footer Social Media Channels
                </h3>
                <p className="text-xs text-slate-400">
                  Links will automatically appear as interactive icon badges in the footer. Leave empty to hide.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono bg-dark-950 text-emerald-400 border border-dark-750 px-2.5 py-1 rounded-lg">
              {activeLinksCount} Active {activeLinksCount === 1 ? 'Link' : 'Links'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {platforms.map((p) => {
              const Icon = p.icon;
              const val = form[p.key];
              const isFilled = val.trim().length > 0;

              return (
                <div key={p.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-slate-300 uppercase flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${p.color}`} />
                      <span>{p.label}</span>
                    </label>
                    {isFilled && (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Visible
                      </span>
                    )}
                  </div>
                  <input
                    type="url"
                    value={val}
                    onChange={(e) => handleChange(p.key, e.target.value)}
                    placeholder={p.placeholder}
                    className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono placeholder:text-slate-600 transition-colors"
                  />
                </div>
              );
            })}
          </div>

          {/* Real-time Preview in Admin Console */}
          <div className="pt-4 border-t border-dark-800 space-y-3">
            <span className="text-xs font-mono text-slate-400 uppercase flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Live Footer Preview
            </span>
            <div className="p-4 bg-dark-950 rounded-2xl border border-dark-800 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-slate-400">Connect With SharpShadows:</span>
              <div className="flex items-center gap-2">
                {platforms
                  .filter((p) => form[p.key].trim().length > 0)
                  .map((p) => {
                    const Icon = p.icon;
                    return (
                      <div
                        key={p.key}
                        className="w-9 h-9 rounded-xl bg-dark-900 border border-dark-750 flex items-center justify-center text-slate-300 shadow-sm"
                        title={p.label}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                    );
                  })}
                {activeLinksCount === 0 && (
                  <span className="text-xs text-slate-500 italic">No social links configured yet</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white font-bold text-sm shadow-sharp-glow transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Admin Security & Password Section */}
      <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-card-dark">
        <div className="flex items-center justify-between pb-4 border-b border-dark-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sharp-500/10 text-sharp-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
                Administrator Password & Security
              </h3>
              <p className="text-xs text-slate-400">
                Update your administrative console password. Minimum 6 characters required.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono bg-dark-950 text-sharp-400 border border-dark-750 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <Lock className="w-3 h-3" /> Root Access
          </span>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
          <div>
            <label className="text-xs font-mono text-slate-300 uppercase block mb-1.5">
              Current Admin Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                required
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={changingPassword}
                className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl px-4 py-2.5 pr-10 text-xs text-white outline-none font-mono placeholder:text-slate-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-300 uppercase block mb-1.5">
                New Admin Password
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={changingPassword}
                  className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl px-4 py-2.5 pr-10 text-xs text-white outline-none font-mono placeholder:text-slate-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 uppercase block mb-1.5">
                Confirm New Password
              </label>
              <input
                type={showNewPw ? 'text' : 'password'}
                required
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={changingPassword}
                className="w-full bg-dark-950 border border-dark-750 focus:border-sharp-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono placeholder:text-slate-600 transition-colors"
              />
            </div>
          </div>

          {newPassword && confirmPassword && (
            <div>
              {newPassword === confirmPassword ? (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" /> Passwords match
                </span>
              ) : (
                <span className="text-[11px] text-rose-400 font-mono">Passwords do not match</span>
              )}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={
                changingPassword ||
                !currentPassword.trim() ||
                newPassword.length < 6 ||
                newPassword !== confirmPassword
              }
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white font-semibold text-xs shadow-sharp-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Admin Password...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Update Admin Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
