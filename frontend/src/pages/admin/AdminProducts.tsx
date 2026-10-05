import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Eye, Search, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Product } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const { success, error } = useToast();

  const loadProducts = async (page = 0) => {
    setLoading(true);
    try {
      const res = await adminService.getProducts(page, 20);
      setProducts(res.content);
      setTotalPages(res.totalPages);
      setCurrentPage(res.pageNumber);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(currentPage);
  }, [currentPage]);

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      await adminService.deleteProduct(id);
      success('Product deleted successfully');
      loadProducts(currentPage);
    } catch (err: any) {
      error(err.response?.data?.message || 'Could not delete product');
    }
  };

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Product Catalog Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage Photoshop PSD files, pricing, and assets</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white font-semibold text-xs shadow-sharp-glow transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload New PSD</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Filter products in this page..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
        />
      </div>

      {/* Products Table */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-card-dark">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading product catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-950/80 text-slate-400 font-mono uppercase border-b border-dark-800">
                <tr>
                  <th className="py-3.5 px-4">Preview</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">File Info</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Downloads</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/80 text-slate-300">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-dark-850/50">
                    <td className="py-3 px-4">
                      <img
                        src={p.thumbnailUrl}
                        alt={p.title}
                        className="w-12 h-12 rounded-xl object-cover bg-dark-950 shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('unsplash.com')) {
                            target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
                          }
                        }}
                      />
                    </td>
                    <td className="py-3 px-4 font-semibold text-white max-w-xs truncate">
                      {p.title}
                      <span className="inline-flex items-center gap-1.5 ml-2">
                        {p.featured && (
                          <span className="text-[9px] bg-sharp-500/20 text-sharp-400 border border-sharp-500/40 px-1.5 py-0.5 rounded font-mono">
                            FEATURED
                          </span>
                        )}
                        {p.discountPrice != null && p.discountPrice < p.price && (
                          <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                            {Math.round(((p.price - p.discountPrice) / p.price) * 100)}% OFF
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{p.category?.name}</td>
                    <td className="py-3 px-4 font-mono">
                      {p.price === 0 || (p.discountPrice != null && p.discountPrice === 0) ? (
                        <span className="font-bold text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded">
                          FREE
                        </span>
                      ) : p.discountPrice != null && p.discountPrice < p.price ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-blue-400 text-sm">₹{p.discountPrice}</span>
                          <span className="text-[11px] text-slate-400 line-through">₹{p.price}</span>
                          <span className="text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded leading-none">
                            {Math.round(((p.price - p.discountPrice) / p.price) * 100)}% off
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-white">₹{p.price}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      <span>{p.fileSize || 'PSD'}</span>
                      <span className="block text-[10px] text-slate-500">{p.resolution}</span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'PUBLISHED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-dark-800 text-slate-400 border border-dark-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{p.downloadCount}</td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <Link
                        to={`/product/${p.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white inline-block"
                        title="View live"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white inline-block"
                        title="Edit product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="p-1.5 rounded-lg bg-dark-800 hover:bg-sharp-900 text-slate-400 hover:text-sharp-400 inline-block"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-dark-800 flex items-center justify-between text-xs text-slate-400">
            <span>Page {currentPage + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className="p-2 rounded-lg bg-dark-800 text-white disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                className="p-2 rounded-lg bg-dark-800 text-white disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
