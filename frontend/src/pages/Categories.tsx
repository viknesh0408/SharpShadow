import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight } from 'lucide-react';
import { Category } from '../types';
import { categoryService } from '../services/categoryService';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService.getCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sharp-500/10 text-sharp-400 text-xs font-mono font-bold mb-3 uppercase">
          <Layers className="w-4 h-4" />
          <span>Asset Categories</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Explore All PSD Categories</h1>
        <p className="text-slate-400 text-sm sm:text-base mt-3">
          Discover hand-crafted Photoshop templates designed for specific commercial design needs and creative workflows.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-40 sm:h-44 bg-dark-900 border border-dark-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative bg-dark-900 border border-dark-800 hover:border-sharp-500/40 rounded-2xl overflow-hidden p-4 sm:p-6 transition-all duration-300 hover:shadow-card-hover flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 dark:bg-gradient-to-tr dark:from-dark-800 dark:to-dark-750 text-sharp-500 dark:text-sharp-400 group-hover:from-sharp-600 group-hover:to-sharp-500 group-hover:text-white transition-all flex items-center justify-center font-bold text-base sm:text-lg shadow">
                  {cat.name.charAt(0)}
                </div>
                <span className="text-[10px] sm:text-xs font-mono text-slate-500 group-hover:text-slate-400">
                  {cat.productCount ? `${cat.productCount} Items` : 'Active'}
                </span>
              </div>

              <div className="mt-5 sm:mt-8">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-sharp-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 hidden xs:block">
                  {cat.description || 'Editable Photoshop graphic assets and smart templates.'}
                </p>
                <div className="mt-3 sm:mt-4 flex items-center gap-1 text-xs font-semibold text-sharp-400 group-hover:translate-x-1 transition-transform">
                  <span>Browse</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
