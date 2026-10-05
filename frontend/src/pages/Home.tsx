import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { productService } from '../services/productService';
import { ProductCard } from '../components/ProductCard';
import { SkeletonCard } from '../components/SkeletonCard';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const latestSectionRef = useRef<HTMLElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const loadProducts = async (page: number) => {
    setLoading(true);
    try {
      const pageData = await productService.getProducts({
        page,
        size: 8,
        sort: 'newest',
      });
      setProducts(pageData.content || []);
      setTotalPages(pageData.totalPages || 1);
      setTotalElements(pageData.totalElements || 0);
    } catch (err) {
      console.error('Failed to load home products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage || newPage < 0 || newPage >= totalPages) return;
    setCurrentPage(newPage);
    if (latestSectionRef.current) {
      latestSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION (Section 6) */}
      <section className="relative pt-8 sm:pt-12 pb-14 sm:pb-20 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[250px] sm:h-[350px] bg-sharp-500/10 dark:bg-sharp-600/15 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[250px] sm:w-[350px] h-[180px] sm:h-[250px] bg-cyan-500/10 dark:bg-cyan-600/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs font-medium mb-6 sm:mb-8 shadow-sm dark:shadow-inner animate-pulse max-w-full">
            <span className="w-2 h-2 rounded-full bg-sharp-500 animate-ping shrink-0" />
            <Sparkles className="w-3.5 h-3.5 text-sharp-500 dark:text-sharp-400 shrink-0" />
            <span className="truncate">Curated Photoshop PSD & Graphics Marketplace</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] sm:leading-[1.1] max-w-4xl mx-auto font-sans">
            Premium PSD Assets for <span className="text-gradient-sharp">Creative Minds</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed px-1">
            Discover editable Photoshop templates built to save time and elevate your designs. Layered, organized, and print-ready.
          </p>

          {/* ULTRA-COOL SEARCH BOX (ABOVE EXPLORE PSDS & CATEGORIES) */}
          <div className="mt-6 sm:mt-8 mb-4 sm:mb-6 max-w-2xl mx-auto relative group">
            {/* Ambient Multi-Hue Neon Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-sharp-500/20 via-cyan-500/15 to-purple-500/15 dark:from-sharp-500/40 dark:via-cyan-500/30 dark:to-purple-500/30 rounded-3xl blur-xl opacity-30 dark:opacity-50 group-hover:opacity-60 dark:group-hover:opacity-80 group-focus-within:opacity-80 dark:group-focus-within:opacity-100 transition-all duration-500" />

            {/* Glassmorphism Capsule Card */}
            <div className="relative bg-white dark:bg-dark-950/85 backdrop-blur-2xl border border-slate-200 dark:border-white/10 hover:border-sharp-500/50 focus-within:border-sharp-500 focus-within:ring-2 focus-within:ring-sharp-500/20 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2.5 shadow-lg shadow-slate-200/50 dark:shadow-[0_15px_35px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-300">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-sharp-50 border border-sharp-200 text-sharp-600 dark:bg-gradient-to-br dark:from-sharp-500/20 dark:via-sharp-500/10 dark:to-cyan-500/15 dark:border-sharp-500/30 dark:text-sharp-400 flex items-center justify-center shrink-0 ml-0.5 sm:ml-1 shadow-sm dark:shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search PSD files, templates..."
                  className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-base font-medium px-1 sm:px-2 focus:outline-none min-w-0"
                />

                <button
                  type="submit"
                  className="px-3.5 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-sharp-600 hover:bg-sharp-500 dark:bg-gradient-to-r dark:from-sharp-600 dark:via-sharp-500 dark:to-cyan-500 dark:hover:from-sharp-500 dark:hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-sharp-glow hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1 sm:gap-1.5 shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Hero Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-sm sm:max-w-none mx-auto">
            <Link
              to="/browse"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white font-bold text-sm sm:text-base shadow-sharp-glow hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <span>Explore PSDs</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>

            <Link
              to="/categories"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-50 dark:bg-dark-900 dark:hover:bg-dark-850 text-slate-800 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white font-semibold text-sm sm:text-base border border-slate-200 hover:border-slate-300 dark:border-dark-750 dark:hover:border-dark-600 transition-all text-center shadow-sm dark:shadow-none"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      {/* 2. LATEST RELEASES */}
      <section ref={latestSectionRef} id="latest-uploads" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sharp-600 dark:text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Fresh Additions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">Latest Uploads</h2>
          </div>
          <Link to="/browse?sort=newest" className="text-sm font-medium text-slate-500 hover:text-sharp-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-6 min-h-[300px] masonry-columns">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} aspect={i % 2 === 0 ? 'portrait' : 'landscape'} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-6 min-h-[300px] masonry-columns">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl">
            No PSD templates available yet.
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-dark-800">
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Showing <span className="text-slate-900 dark:text-white font-semibold">{currentPage * 8 + 1}</span>-
              <span className="text-slate-900 dark:text-white font-semibold">{Math.min((currentPage + 1) * 8, totalElements)}</span> of{' '}
              <span className="text-slate-900 dark:text-white font-semibold">{totalElements}</span> PSD templates
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0 || loading}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-900 dark:hover:bg-dark-850 border border-slate-300 dark:border-dark-750 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white text-xs font-medium disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  if (
                    totalPages <= 7 ||
                    idx === 0 ||
                    idx === totalPages - 1 ||
                    Math.abs(idx - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={idx}
                        onClick={() => handlePageChange(idx)}
                        disabled={loading}
                        className={`w-8 h-8 rounded-xl font-mono text-xs font-semibold transition-all ${
                          currentPage === idx
                            ? 'bg-gradient-to-r from-sharp-600 to-sharp-500 text-white shadow-sharp-glow'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-dark-900 dark:hover:bg-dark-850 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-dark-750'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  } else if (
                    (idx === 1 && currentPage > 2) ||
                    (idx === totalPages - 2 && currentPage < totalPages - 3)
                  ) {
                    return (
                      <span key={idx} className="px-1 text-slate-400 dark:text-slate-600 text-xs font-mono">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1 || loading}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-900 dark:hover:bg-dark-850 border border-slate-300 dark:border-dark-750 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white text-xs font-medium disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="Next Page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 5. CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-6 sm:p-14 bg-white dark:bg-gradient-to-r dark:from-dark-900 dark:via-dark-850 dark:to-dark-900 border border-slate-200 dark:border-dark-750 overflow-hidden shadow-xl dark:shadow-2xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-sharp-600/10 blur-[100px] pointer-events-none rounded-full" />
          
          <div className="relative z-10 max-w-2xl">
            <span className="font-mono text-xs font-bold text-sharp-500 dark:text-sharp-400 uppercase tracking-widest">
              Commercial-Ready Assets
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2 leading-tight">
              Ready to create stunning visuals in minutes instead of hours?
            </h2>
            <p className="mt-3 sm:mt-4 text-slate-600 dark:text-slate-400 text-xs sm:text-base leading-relaxed">
              Every PSD on SharpShadow is meticulously crafted with smart objects, non-destructive adjustment layers, and organized folder hierarchies.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                to="/browse"
                className="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white font-semibold text-sm shadow-sharp-glow transition-all"
              >
                Browse All 100+ Templates
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-800 dark:text-slate-200 text-sm font-semibold border border-slate-300 dark:border-dark-700 transition-all"
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
