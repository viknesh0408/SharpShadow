import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, DownloadCloud, Sparkles, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-950 border-t border-dark-800 text-slate-400 text-sm mt-20">
      {/* Features Value Strip */}
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

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10">
        
        {/* Brand */}
        <div className="col-span-2 sm:col-span-2 md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sharp-600 to-sharp-500 flex items-center justify-center text-white font-mono font-bold text-sm">
              SS
            </div>
            <span className="font-black text-lg tracking-wider text-white">
              SHARP<span className="text-sharp-500">SHADOW</span>
            </span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed pr-6">
            SharpShadow is an independent digital asset marketplace dedicated to high-end Photoshop templates, mockups, social graphics, and creative assets built to save time and elevate professional design work.
          </p>
          <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
            <span>Secured with 256-Bit SSL Encryption</span>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider font-mono">Popular PSDs</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/category/wedding" className="hover:text-white transition-colors">Wedding Suites</Link></li>
            <li><Link to="/category/business" className="hover:text-white transition-colors">Business Cards</Link></li>
            <li><Link to="/category/social-media" className="hover:text-white transition-colors">Social Media Packs</Link></li>
            <li><Link to="/category/flyers" className="hover:text-white transition-colors">Flyer Templates</Link></li>
            <li><Link to="/category/posters" className="hover:text-white transition-colors">Poster Mockups</Link></li>
            <li><Link to="/categories" className="hover:text-sharp-400 transition-colors font-medium">All Categories →</Link></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider font-mono">Explore</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/browse" className="hover:text-white transition-colors">All PSD Templates</Link></li>
            <li><Link to="/browse?sort=newest" className="hover:text-white transition-colors">Latest Releases</Link></li>
            <li><Link to="/browse?sort=popular" className="hover:text-white transition-colors">Bestsellers</Link></li>
            <li><Link to="/account" className="hover:text-white transition-colors">Customer Portal</Link></li>
            <li><Link to="/admin/login" className="hover:text-white transition-colors">Admin Portal</Link></li>
          </ul>
        </div>

        {/* Legal & Policy (Section 25) */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider font-mono">Legal & Policy</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
            <li><Link to="/license" className="hover:text-white transition-colors">Licensing Terms</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-dark-800/80 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-2">
            <p>© {new Date().getFullYear()} SharpShadow Digital Marketplace. All rights reserved.</p>
            <span className="hidden sm:inline text-dark-700">•</span>
            <p className="flex items-center gap-1.5 text-slate-300">
              <span>Developed by</span>
              <a
                href="https://github.com/viknesh0408"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sharp-400 hover:text-sharp-300 font-semibold inline-flex items-center gap-1.5 transition-colors hover:underline"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Viknesh</span>
              </a>
            </p>
          </div>
          <p className="flex items-center gap-3">
            <span>Photoshop® and PSD are trademarks of Adobe Inc.</span>
            <span>•</span>
            <Link to="/license" className="hover:text-slate-300">Commercial License</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};
