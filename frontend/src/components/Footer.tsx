import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  DownloadCloud,
  Sparkles,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  MessageSquare,
  Facebook,
} from 'lucide-react';
import { settingService } from '../services/settingService';

export const Footer: React.FC = () => {
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({
    social_github: 'https://github.com/viknesh0408',
    social_instagram: 'https://instagram.com',
    social_twitter: 'https://x.com',
    social_linkedin: 'https://linkedin.com',
  });

  useEffect(() => {
    let isMounted = true;
    settingService
      .getPublicSettings()
      .then((settings) => {
        if (isMounted && settings && Object.keys(settings).length > 0) {
          setSocialLinks(settings);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const socialConfig = [
    {
      key: 'social_github',
      icon: Github,
      label: 'GitHub',
      hover: 'hover:text-white hover:border-slate-500',
    },
    {
      key: 'social_twitter',
      icon: Twitter,
      label: 'Twitter / X',
      hover: 'hover:text-sky-400 hover:border-sky-500/50',
    },
    {
      key: 'social_instagram',
      icon: Instagram,
      label: 'Instagram',
      hover: 'hover:text-pink-400 hover:border-pink-500/50',
    },
    {
      key: 'social_youtube',
      icon: Youtube,
      label: 'YouTube',
      hover: 'hover:text-red-400 hover:border-red-500/50',
    },
    {
      key: 'social_linkedin',
      icon: Linkedin,
      label: 'LinkedIn',
      hover: 'hover:text-blue-400 hover:border-blue-500/50',
    },
    {
      key: 'social_discord',
      icon: MessageSquare,
      label: 'Discord',
      hover: 'hover:text-indigo-400 hover:border-indigo-500/50',
    },
    {
      key: 'social_facebook',
      icon: Facebook,
      label: 'Facebook',
      hover: 'hover:text-blue-500 hover:border-blue-500/50',
    },
  ];

  const activeSocials = socialConfig.filter((s) => {
    const url = socialLinks[s.key];
    return url && url.trim().length > 0;
  });

  return (
    <footer className="bg-dark-950 border-t border-dark-800 text-slate-400 text-sm mt-20">
      {/* 1. Features Value Strip */}
      <div className="border-b border-dark-800 py-8 sm:py-10 bg-dark-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sharp-500/10 text-sharp-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">100% Layered PSD</h4>
              <p className="text-xs text-slate-400">Neatly grouped smart objects and organized folders.</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <DownloadCloud className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Instant Secure Access</h4>
              <p className="text-xs text-slate-400">Direct high-speed temporary signed download tokens.</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Verified Razorpay Payments</h4>
              <p className="text-xs text-slate-400">Bank-grade UPI, Cards, NetBanking and QR scanning.</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Commercial Rights</h4>
              <p className="text-xs text-slate-400">Clear royalty-free licenses for client & personal work.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Brand & Social Media Channels */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
        {/* Brand */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sharp-600 to-sharp-500 flex items-center justify-center text-white font-mono font-bold text-sm shadow-sharp-glow">
              SS
            </div>
            <span className="font-black text-xl tracking-wider text-white">
              SHARP<span className="text-sharp-500">SHADOW</span>
            </span>
          </Link>
          <span className="hidden sm:inline text-dark-750">|</span>
          <p className="text-xs text-slate-400 max-w-md">
            Premium curated PSD marketplace for creative professionals, studios, and freelance designers.
          </p>
        </div>

        {/* Social Media Links Section (Dynamic & Managed in Admin Panel) */}
        {activeSocials.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Follow Us:
            </span>
            <div className="flex items-center gap-2">
              {activeSocials.map((s) => {
                const Icon = s.icon;
                const href = socialLinks[s.key];
                return (
                  <a
                    key={s.key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className={`w-9 h-9 rounded-xl bg-dark-900 border border-dark-750 text-slate-400 ${s.hover} flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Simple Horizontal Legal & Policy Style */}
      <div className="border-t border-dark-800/80 py-5 bg-dark-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-7 gap-y-2 text-xs sm:text-sm text-slate-400 font-medium">
            <Link to="/privacy-policy" className="hover:text-white hover:text-sharp-400 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-dark-750 hidden sm:inline">•</span>
            <Link to="/terms" className="hover:text-white hover:text-sharp-400 transition-colors">
              Terms of Service
            </Link>
            <span className="text-dark-750 hidden sm:inline">•</span>
            <Link to="/refund-policy" className="hover:text-white hover:text-sharp-400 transition-colors">
              Refund Policy
            </Link>
            <span className="text-dark-750 hidden sm:inline">•</span>
            <Link to="/license" className="hover:text-white hover:text-sharp-400 transition-colors">
              Licensing Terms
            </Link>
            <span className="text-dark-750 hidden sm:inline">•</span>
            <Link to="/contact" className="hover:text-white hover:text-sharp-400 transition-colors">
              Contact Support
            </Link>
          </nav>
        </div>
      </div>

      {/* 4. Copyright & Developer Attribution */}
      <div className="border-t border-dark-800/80 py-6 text-xs text-slate-400 bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-2">
            <p>© {new Date().getFullYear()} SharpShadow Digital Marketplace. All rights reserved.</p>
            <span className="hidden sm:inline text-dark-700">•</span>
            <p className="flex items-center gap-1.5 text-slate-300">
              <span>Developed by</span>
              <a
                href={socialLinks.social_github || 'https://github.com/viknesh0408'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sharp-400 hover:text-sharp-300 font-semibold inline-flex items-center gap-1.5 transition-colors hover:underline"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Viknesh</span>
              </a>
            </p>
          </div>
          <p className="flex items-center gap-3 text-slate-500">
            <span>Photoshop® and PSD are trademarks of Adobe Inc.</span>
            <span>•</span>
            <Link to="/license" className="hover:text-slate-300 transition-colors">
              Commercial License
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};
