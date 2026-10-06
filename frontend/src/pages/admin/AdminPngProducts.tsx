import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Search,
  Download,
  Image as ImageIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Product } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminPngProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'free' | 'paid'>('all');
  const { success, error } = useToast();

  const loadPngProducts = async (page = 0) => {
    setLoading(true);
    try {
      const res = await adminService.getPngProducts(page, 20);
      setProducts(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
      setCurrentPage(res.pageNumber || 0);
    } catch (err: any) {
      try {
        const fallback = await adminService.getProducts(page, 50);
        const pngItems = (fallback.content || []).filter((p) =>
          Boolean(
            p.isPng ||
            p.category?.slug?.includes('png') ||
            p.category?.name?.toLowerCase().includes('png') ||
            p.fileName?.toLowerCase().endsWith('.png') ||
            p.photoshopVersion?.toLowerCase().includes('png')
          )
        );
        setProducts(pngItems);
        setTotalPages(1);
        setTotalElements(pngItems.length);
        setCurrentPage(0);
      } catch {
        error(err.response?.data?.message || 'Failed to load PNG products');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPngProducts(currentPage);
  }, [currentPage]);

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      await adminService.deleteProduct(id);
      success('PNG product deleted successfully');
      loadPngProducts(currentPage);
    } catch (err: any) {
      error(err.response?.data?.message || 'Could not delete PNG product');
    }
  };

  // Filter products locally for search & price filter within current dataset
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.fileName && p.fileName.toLowerCase().includes(search.toLowerCase())) ||
      (p.category?.name && p.category.name.toLowerCase().includes(search.toLowerCase()));

    const isFree = Boolean(
      p.free || p.price === 0 || (p.discountPrice != null && p.discountPrice === 0)
    );

    if (filterType === 'free') return matchesSearch && isFree;
    if (filterType === 'paid') return matchesSearch && !isFree;
    return matchesSearch;
  });

  const totalFreeInBatch = products.filter(
    (p) => Boolean(p.free || p.price === 0 || (p.discountPrice != null && p.discountPrice === 0))
  ).length;

  const totalDownloadsInBatch = products.reduce((acc, p) => acc + (p.downloadCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <ImageIcon className="w-4 h-4" />
            <span>Dedicated Asset Section</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">PNG Products & Cutouts</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage transparent background graphics, isolated design elements, and free client PNG downloads
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/products"
            className="px-3.5 py-2.5 rounded-xl bg-dark-900 hover:bg-dark-850 text-slate-300 text-xs font-semibold border border-dark-750 transition-colors"
          >
            All PSDs
          </Link>
          <Link
            to="/admin/products/new?format=png"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sharp-600 hover:bg-sharp-500 dark:bg-gradient-to-r dark:from-sharp-600 dark:to-sharp-500 dark:hover:from-sharp-500 dark:hover:to-sharp-400 text-white font-semibold text-xs shadow-sharp-glow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload Free PNG</span>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 flex items-center justify-between shadow-card-dark">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">Total PNG Assets</span>
            <div className="text-2xl font-black font-mono text-white mt-1">{totalElements}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 flex items-center justify-between shadow-card-dark">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">Free Listings (₹0)</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {totalFreeInBatch}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 flex items-center justify-between shadow-card-dark">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">PNG Downloads</span>
            <div className="text-2xl font-black font-mono text-sky-400 mt-1">
              {totalDownloadsInBatch}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search PNG title, filename, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-sharp-600 text-white font-semibold'
                : 'bg-dark-950 text-slate-400 hover:text-white border border-dark-750'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('free')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'free'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-dark-950 text-slate-400 hover:text-white border border-dark-750'
            }`}
          >
            Free Only
          </button>
          <button
            onClick={() => setFilterType('paid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'paid'
                ? 'bg-sharp-600 text-white font-semibold'
                : 'bg-dark-950 text-slate-400 hover:text-white border border-dark-750'
            }`}
          >
            Paid
          </button>
        </div>
      </div>

      {/* PNG Products Table */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-card-dark">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading PNG catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm font-medium">No PNG products found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start by uploading your first transparent PNG graphic, 3D element, or cutout.
            </p>
            <Link
              to="/admin/products/new?format=png"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sharp-600 hover:bg-sharp-500 text-white text-xs font-semibold shadow-sharp-glow transition-all mt-2"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create PNG Product</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-950/80 text-slate-400 font-mono uppercase border-b border-dark-800">
                <tr>
                  <th className="py-3.5 px-4">Preview</th>
                  <th className="py-3.5 px-4">Asset Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Format / Alpha</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Downloads</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/80 text-slate-300">
                {filtered.map((p) => {
                  const isFree = Boolean(
                    p.free || p.price === 0 || (p.discountPrice != null && p.discountPrice === 0)
                  );

                  return (
                    <tr key={p.id} className="hover:bg-dark-850/50 transition-colors">
                      <td className="py-3.5 px-4">
                        {/* Checkerboard preview pattern for PNG transparency */}
                        <div
                          className="w-12 h-12 rounded-xl border border-dark-750 overflow-hidden relative"
                          style={{
                            backgroundImage:
                              'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)',
                            backgroundSize: '8px 8px',
                            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                            backgroundColor: '#0f172a',
                          }}
                        >
                          <img
                            src={p.thumbnailUrl}
                            alt={p.title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-white truncate text-sm" title={p.title}>
                          {p.title}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                          {p.fileName || `${p.slug}.png`} • {p.fileSize || 'Asset'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-dark-950 text-slate-300 font-mono text-[11px] border border-dark-750">
                          {p.category?.name || 'PNG Elements'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold border border-cyan-500/20">
                            PNG
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {p.colorMode || 'RGB Alpha'}
                          </span>
                        </div>
                        {p.dimensions && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {p.dimensions}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isFree ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold">
                            <Sparkles className="w-3 h-3" />
                            Free (₹0)
                          </span>
                        ) : (
                          <span className="font-mono text-white font-bold">
                            ₹{p.discountPrice != null ? p.discountPrice : p.price}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        <div className="flex items-center gap-1">
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span>{p.downloadCount || 0}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/product/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-dark-950 hover:bg-dark-800 text-slate-400 hover:text-white transition-colors"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            to={`/admin/products/${p.id}/edit`}
                            className="p-1.5 rounded-lg bg-dark-950 hover:bg-dark-800 text-slate-400 hover:text-white transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            className="p-1.5 rounded-lg bg-dark-950 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete PNG"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-dark-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>
              Page {currentPage + 1} of {totalPages} ({totalElements} total assets)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0 || loading}
                className="px-3 py-1.5 rounded-lg bg-dark-950 hover:bg-dark-800 text-white disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1 || loading}
                className="px-3 py-1.5 rounded-lg bg-dark-950 hover:bg-dark-800 text-white disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
