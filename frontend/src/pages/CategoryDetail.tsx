import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Layers, Loader2 } from 'lucide-react';
import { Product, Category } from '../types';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { ProductCard } from '../components/ProductCard';
import { SkeletonCard } from '../components/SkeletonCard';

export const CategoryDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const loadCategoryData = async () => {
      setLoading(true);
      try {
        const [cat, prods] = await Promise.all([
          categoryService.getBySlug(slug),
          productService.getProducts({ category: slug, size: 24 }),
        ]);
        setCategory(cat);
        setProducts(prods.content);
        document.title = `${cat.name} PSD Templates — SharpShadow`;
      } catch (err) {
        console.error('Failed to load category', err);
      } finally {
        setLoading(false);
      }
    };
    loadCategoryData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-sharp-500 animate-spin" />
        <span className="text-sm text-slate-400">Loading category templates...</span>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Category Not Found</h2>
        <Link to="/categories" className="text-xs text-sharp-400 font-semibold">Back to Categories</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="space-y-4">
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ALL CATEGORIES</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-dark-800">
          <div>
            <div className="flex items-center gap-2 text-sharp-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Photoshop Niche</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">{category.name} PSDs</h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">{category.description}</p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-dark-900 border border-dark-800 px-3 py-1.5 rounded-xl shrink-0">
            {products.length} {products.length === 1 ? 'Template' : 'Templates'}
          </span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-16 text-center space-y-4">
          <Layers className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Templates in this Category Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Our creative designers are constantly preparing new PSD assets for this niche.
          </p>
          <Link to="/browse" className="inline-block px-5 py-2.5 rounded-xl bg-sharp-600 text-white text-xs font-semibold">
            Explore All PSDs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
