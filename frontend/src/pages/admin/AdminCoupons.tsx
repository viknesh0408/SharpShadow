import React, { useEffect, useState } from 'react';
import { Ticket, Plus, Trash2, Edit2, Loader2, X } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Coupon } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minimumAmount, setMinimumAmount] = useState<number>(299);
  const [usageLimit, setUsageLimit] = useState<number>(500);
  const [submitting, setSubmitting] = useState(false);

  const { success, error } = useToast();

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCoupons(0, 50);
      setCoupons(res.content);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('PERCENTAGE');
    setDiscountValue(20);
    setMinimumAmount(299);
    setUsageLimit(500);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSubmitting(true);
    const payload = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minimumAmount,
      usageLimit,
      status: 'ACTIVE',
    };

    try {
      if (editingCoupon) {
        await adminService.updateCoupon(editingCoupon.id, payload);
        success('Coupon updated successfully');
      } else {
        await adminService.createCoupon(payload);
        success('Coupon created successfully');
      }
      setIsModalOpen(false);
      loadCoupons();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;
    try {
      await adminService.deleteCoupon(coupon.id);
      success('Coupon deleted');
      loadCoupons();
    } catch (err: any) {
      error(err.response?.data?.message || 'Could not delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Promotional Coupons</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Create discount voucher campaigns for the marketplace</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sharp-600 hover:bg-sharp-500 text-white font-semibold text-xs shadow-sharp-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-card-dark">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading coupons...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-dark-950/80 text-slate-400 uppercase border-b border-dark-800">
                <tr>
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Discount Value</th>
                  <th className="py-3.5 px-4">Min Order</th>
                  <th className="py-3.5 px-4">Usage Count</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/80 text-slate-300">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-dark-850/50">
                    <td className="py-3.5 px-4 font-bold text-sharp-400 text-sm">{c.code}</td>
                    <td className="py-3.5 px-4">{c.discountType}</td>
                    <td className="py-3.5 px-4 text-white font-bold">
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    </td>
                    <td className="py-3.5 px-4">₹{c.minimumAmount || 0}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {c.timesUsed || 0} / {c.usageLimit || '∞'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(c)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-750 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-dark-800">
              <h3 className="font-bold text-white text-base">Create Discount Coupon</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-mono text-slate-400 uppercase block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH30"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-dark-950 border border-dark-750 rounded-xl px-3 py-2 text-white font-mono uppercase outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-slate-400 uppercase block mb-1">Type *</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-dark-950 border border-dark-750 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-slate-400 uppercase block mb-1">Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-dark-950 border border-dark-750 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-slate-400 uppercase block mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={minimumAmount}
                    onChange={(e) => setMinimumAmount(Number(e.target.value))}
                    className="w-full bg-dark-950 border border-dark-750 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="font-mono text-slate-400 uppercase block mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full bg-dark-950 border border-dark-750 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
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
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Coupon</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
