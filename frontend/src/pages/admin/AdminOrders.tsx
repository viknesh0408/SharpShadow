import React, { useEffect, useState } from 'react';
import { ShoppingBag, ChevronLeft, ChevronRight, Eye, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Order } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { error } = useToast();

  const loadOrders = async (page = 0) => {
    setLoading(true);
    try {
      const res = await adminService.getOrders(page, 20);
      setOrders(res.content);
      setTotalPages(res.totalPages);
      setCurrentPage(res.pageNumber);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(currentPage);
  }, [currentPage]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Order Transactions</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Audit customer purchases and Razorpay payment identifiers</p>
      </div>

      <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-card-dark">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">No orders recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-950/80 text-slate-400 font-mono uppercase border-b border-dark-800">
                <tr>
                  <th className="py-3.5 px-4">Order Number</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Product(s)</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment ID</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/80 text-slate-300 font-mono">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-dark-850/50">
                    <td className="py-3.5 px-4 font-semibold text-white">{o.orderNumber}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="text-white block font-medium">{o.userName || 'Customer'}</span>
                      <span className="text-slate-400 text-[11px]">{o.userEmail}</span>
                    </td>
                    <td className="py-3.5 px-4 font-sans max-w-xs truncate">
                      {o.items?.map((it) => it.productTitle).join(', ') || 'PSD Template'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">₹{o.totalAmount.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-400">
                      {o.razorpayPaymentId || o.razorpayOrderId || 'Pending'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : o.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-sharp-500/10 text-sharp-400 border border-sharp-500/30'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white"
                        title="View Full Order Info"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-dark-900 border border-dark-750 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-dark-800">
              <h3 className="font-bold text-white text-base">Order Details: {selectedOrder.orderNumber}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Customer:</span>
                <span className="text-white font-sans">{selectedOrder.userName} ({selectedOrder.userEmail})</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Amount:</span>
                <span className="text-sharp-400 font-bold">₹{selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-emerald-400 font-bold">{selectedOrder.status}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Razorpay Order ID:</span>
                <span className="text-slate-200">{selectedOrder.razorpayOrderId || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Razorpay Payment ID:</span>
                <span className="text-slate-200">{selectedOrder.razorpayPaymentId || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Purchased At:</span>
                <span className="text-slate-200">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-dark-800 space-y-2">
              <span className="font-bold text-white uppercase tracking-wider block">Items Purchased:</span>
              {selectedOrder.items?.map((it) => (
                <div key={it.id} className="flex justify-between items-center py-1.5 px-3 bg-dark-950 rounded-xl font-mono text-slate-300">
                  <span className="font-sans">{it.productTitle}</span>
                  <span className="text-white font-bold">₹{it.price}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-dark-800 text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
