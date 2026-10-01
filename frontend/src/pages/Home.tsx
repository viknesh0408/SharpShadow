import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Clock, Search } from 'lucide-react';
import { Product } from '../types';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';
import { SkeletonCard } from '../components/SkeletonCard';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const latest = await productService.getLatest();
        setLatestProducts(latest);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="space-y-24">
      {/* 1. HERO SECTION (Section 6) */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sharp-600/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-cyan-600/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-dark-900 border border-dark-750 text-slate-300 text-xs font-medium mb-8 shadow-inner animate-pulse">
            <span className="w-2 h-2 rounded-full bg-sharp-500 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-sharp-400" />
            <span>Curated Photoshop PSD & Graphics Marketplace</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto font-sans">
            Premium PSD Assets for <span className="bg-gradient-to-r from-sharp-500 via-rose-400 to-amber-300 bg-clip-text text-transparent">Creative Minds</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Discover editable Photoshop templates built to save time and elevate your designs. Layered, organized, and print-ready.
          </p>

          {/* ULTRA-COOL SEARCH BOX (ABOVE EXPLORE PSDS & CATEGORIES) */}
          <div className="mt-8 mb-6 max-w-2xl mx-auto relative group">
            {/* Ambient Multi-Hue Neon Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-sharp-500/40 via-cyan-500/30 to-purple-500/30 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 group-focus-within:opacity-100 transition-all duration-500" />

            {/* Glassmorphism Capsule Card */}
            <div className="relative bg-dark-950/85 backdrop-blur-2xl border border-white/10 hover:border-sharp-500/50 focus-within:border-sharp-400 focus-within:ring-2 focus-within:ring-sharp-400/30 rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-300">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-sharp-500/20 via-sharp-500/10 to-cyan-500/15 border border-sharp-500/30 text-sharp-400 flex items-center justify-center shrink-0 ml-1 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                  <Search className="w-5 h-5 stroke-[2.2]" />
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search PSD files, templates, mockups..."
                  className="w-full bg-transparent text-white placeholder-slate-400/70 text-sm sm:text-base font-medium px-2 focus:outline-none"
                />

                <button
                  type="submit"
                  className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-sharp-600 via-sharp-500 to-cyan-500 hover:from-sharp-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-sharp-glow hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Hero Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/browse"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white font-bold text-base shadow-sharp-glow hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <span>Explore PSDs</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/categories"
              className="px-8 py-4 rounded-2xl bg-dark-900 hover:bg-dark-850 text-slate-200 hover:text-white font-semibold text-base border border-dark-750 hover:border-dark-600 transition-all"
            >
              Browse Categories
            </Link>
          </div>

          {/* Attractive Visual Presentation of PSD Previews */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="relative rounded-3xl p-3 bg-gradient-to-b from-dark-800/80 via-dark-900/60 to-dark-950 border border-dark-750 shadow-2xl backdrop-blur-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group bg-dark-950">
                  <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
                    alt="Wedding Suite"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 text-left">
                    <span className="text-[10px] font-mono font-bold text-sharp-400 uppercase tracking-widest">Wedding Suite</span>
                    <h4 className="text-white text-sm font-semibold">Botanical Floral Invitation</h4>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group bg-dark-950 md:-translate-y-4 shadow-sharp-glow border border-sharp-500/30">
                  <img
                    src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
                    alt="Cyberpunk Pack"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent opacity-80" />
                  <div className="absolute top-3 right-3 bg-sharp-500 text-white font-mono text-[10px] font-black px-2 py-0.5 rounded shadow">
                    BESTSELLER
                  </div>
                  <div className="absolute bottom-3 left-3 text-left">
                    <span className="text-[10px] font-mono font-bold text-sharp-400 uppercase tracking-widest">Social Media</span>
                    <h4 className="text-white text-sm font-semibold">Cyberpunk Neon Pack (12 PSDs)</h4>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group bg-dark-950">
                  <img
                    src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"
                    alt="Business Card"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 text-left">
                    <span className="text-[10px] font-mono font-bold text-sharp-400 uppercase tracking-widest">Corporate</span>
                    <h4 className="text-white text-sm font-semibold">Holo Foil Card Mockup</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LATEST RELEASES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Fresh Additions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Latest Uploads</h2>
          </div>
          <Link to="/browse?sort=newest" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1">
            <span>New Releases</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            latestProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* 5. CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-dark-750 overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-sharp-600/10 blur-[100px] pointer-events-none rounded-full" />
          
          <div className="relative z-10 max-w-2xl">
            <span className="font-mono text-xs font-bold text-sharp-400 uppercase tracking-widest">
              Commercial-Ready Assets
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 leading-tight">
              Ready to create stunning visuals in minutes instead of hours?
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
              Every PSD on SharpShadow is meticulously crafted with smart objects, non-destructive adjustment layers, and organized folder hierarchies.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/browse"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white font-semibold text-sm shadow-sharp-glow transition-all"
              >
                Browse All 100+ Templates
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-200 text-sm font-semibold border border-dark-700 transition-all"
              >
                Create Free Customer Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
