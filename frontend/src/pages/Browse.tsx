import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, Category } from '../types';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { ProductCard } from '../components/ProductCard';
import { SkeletonCard } from '../components/SkeletonCard';

export const Browse: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const sortParam = searchParams.get('sort') || 'newest';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);

  // Filter local states
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedSort, setSelectedSort] = useState(sortParam);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state when URL params change
  useEffect(() => {
    setSearchQuery(queryParam);
    setSelectedCategory(categoryParam);
    setSelectedSort(sortParam);
  }, [queryParam, categoryParam, sortParam]);

  // Fetch categories once
  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch filtered products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productService.getProducts({
          q: searchQuery || undefined,
          category: selectedCategory || undefined,
          sort: selectedSort,
          minPrice,
          maxPrice,
          page: currentPage,
          size: 16,
        });
        setProducts(res.content);
        setTotalElements(res.totalElements);
        setTotalPages(res.totalPages);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQuery, selectedCategory, selectedSort, minPrice, maxPrice, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    const newParams: Record<string, string> = {};
    if (searchQuery.trim()) newParams.q = searchQuery.trim();
    if (selectedCategory) newParams.category = selectedCategory;
    if (selectedSort !== 'newest') newParams.sort = selectedSort;
    setSearchParams(newParams);
  };

  const handleCategoryChange = (slug: string) => {
    const next = selectedCategory === slug ? '' : slug;
    setSelectedCategory(next);
    setCurrentPage(0);
    const newParams: Record<string, string> = {};
    if (searchQuery.trim()) newParams.q = searchQuery.trim();
    if (next) newParams.category = next;
    if (selectedSort !== 'newest') newParams.sort = selectedSort;
    setSearchParams(newParams);
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    setCurrentPage(0);
    const newParams: Record<string, string> = {};
    if (searchQuery.trim()) newParams.q = searchQuery.trim();
    if (selectedCategory) newParams.category = selectedCategory;
    if (sort !== 'newest') newParams.sort = sort;
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSort('newest');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setCurrentPage(0);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-dark-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {searchQuery ? `Search Results for "${searchQuery}"` : selectedCategory ? `Category: ${categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}` : 'Explore All PSD Templates'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {totalElements} assets available • Layered Photoshop files
          </p>
        </div>

        {/* Search input in page */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by keywords, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-900 border border-dark-750 focus:border-sharp-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-sharp-600 hover:bg-sharp-500 text-white font-medium text-sm transition-colors shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      <div className="mt-8 flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-900 border border-dark-750 text-slate-200 text-sm font-medium"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <select
            value={selectedSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="bg-dark-900 border border-dark-750 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none"
          >
            <option value="newest">Newest Releases</option>
            <option value="popular">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Sidebar Filters (Desktop & Mobile Drawer) */}
        <aside
          className={`lg:w-64 shrink-0 space-y-6 ${
            mobileFilterOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider font-mono flex items-center gap-2">
                <Filter className="w-4 h-4 text-sharp-400" />
                Filters
              </h3>
              {(selectedCategory || searchQuery || minPrice || maxPrice) && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-sharp-400 hover:text-sharp-300 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Sort Dropdown for Desktop */}
            <div className="space-y-2 hidden lg:block">
              <label className="text-xs font-mono text-slate-400 uppercase">Sort By</label>
              <select
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full bg-dark-950 border border-dark-750 rounded-xl p-2.5 text-sm text-slate-200 outline-none focus:border-sharp-500"
              >
                <option value="newest">Newest Releases</option>
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* Categories */}
            <div className="space-y-2.5">
              <label className="text-xs font-mono text-slate-400 uppercase">Categories</label>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !selectedCategory ? 'bg-sharp-500 text-white' : 'text-slate-400 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-sharp-500 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-dark-800'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {cat.productCount ? (
                      <span className="text-[10px] opacity-70 font-mono">{cat.productCount}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2.5 pt-4 border-t border-dark-800">
              <label className="text-xs font-mono text-slate-400 uppercase">Price Range (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice ?? ''}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-dark-950 border border-dark-750 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-sharp-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice ?? ''}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-dark-950 border border-dark-750 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-sharp-500"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid (4 col desktop, 3 tablet, 2 mobile - Section 8) */}
        <main className="flex-1">
          {loading ? (
            <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-6 masonry-columns">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} aspect={i % 2 === 0 ? 'portrait' : 'landscape'} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl p-6 sm:p-12 text-center space-y-4 shadow-sm dark:shadow-none">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-dark-800 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No PSD templates found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                We couldn't find any templates matching your criteria. Try adjusting your search keywords, price range, or category filter.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 rounded-xl bg-sharp-600 text-white font-medium text-sm hover:bg-sharp-500 transition-colors shadow-sharp-glow"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-6 masonry-columns">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    className="p-2.5 rounded-xl bg-dark-900 border border-dark-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-mono text-xs text-slate-400">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    className="p-2.5 rounded-xl bg-dark-900 border border-dark-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
