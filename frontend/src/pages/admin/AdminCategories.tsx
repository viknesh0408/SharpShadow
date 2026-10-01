import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Layers, Loader2, X } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Category } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { success, error } = useToast();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCategories(0, 50);
      setCategories(res.content);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
      status: 'ACTIVE',
    };

    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, payload);
        success('Category updated successfully');
      } else {
        await adminService.createCategory(payload);
        success('Category created successfully');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Delete category "${cat.name}"? If products belong to this category, deletion will be safely rejected.`)) {
      return;
    }
    try {
      await adminService.deleteCategory(cat.id);
      success('Category deleted successfully');
      loadCategories();
    } catch (err: any) {
      error(err.response?.data?.message || 'Could not delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Categories Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Organize PSD assets into searchable design niches</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sharp-600 hover:bg-sharp-500 text-white font-semibold text-xs shadow-sharp-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-card-dark">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading categories...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-950/80 text-slate-400 font-mono uppercase border-b border-dark-800">
                <tr>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Products</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/80 text-slate-300">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-dark-850/50">
                    <td className="py-3.5 px-4 font-semibold text-white">{cat.name}</td>
                    <td className="py-3.5 px-4 font-mono text-sharp-400">{cat.slug}</td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">{cat.description || '-'}</td>
                    <td className="py-3.5 px-4 font-mono text-white">{cat.productCount || 0}</td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                        {cat.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="p-1.5 rounded-lg bg-dark-800 hover:bg-sharp-900 text-slate-400 hover:text-sharp-400"
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
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-dark-900 border border-dark-750 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-dark-800">
              <h3 className="font-bold text-white text-base">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-mono text-slate-400 uppercase block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wedding Suites"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-750 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-slate-400 uppercase block mb-1">Slug (Optional)</label>
                <input
                  type="text"
                  placeholder="Auto-generated if left blank"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-750 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-slate-400 uppercase block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Short description for SEO and category cards..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-750 rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-slate-400 uppercase block mb-1">Cover Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-750 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-dark-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-sharp-600 hover:bg-sharp-500 text-white font-semibold flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Category</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
