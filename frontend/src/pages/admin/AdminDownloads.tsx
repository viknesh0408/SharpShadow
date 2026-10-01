import React, { useEffect, useState } from 'react';
import { Download, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

export const AdminDownloads: React.FC = () => {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { error } = useToast();

  const loadDownloads = async (page = 0) => {
    setLoading(true);
    try {
      const res = await adminService.getDownloads(page, 25);
      setDownloads(res.content);
      setTotalPages(res.totalPages);
      setCurrentPage(res.pageNumber);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to load downloads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDownloads(currentPage);
  }, [currentPage]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Digital Download Audit Log</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Cryptographic token requests, IP tracking, and customer file access history
        </p>
      </div>

      <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-card-dark">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading download logs...</div>
        ) : downloads.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">No download events logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-dark-950/80 text-slate-400 uppercase border-b border-dark-800">
                <tr>
                  <th className="py-3.5 px-4">Event ID</th>
                  <th className="py-3.5 px-4 font-sans">Photoshop Template</th>
                  <th className="py-3.5 px-4 font-sans">Customer</th>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Client IP</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/80 text-slate-300">
                {downloads.map((d) => (
                  <tr key={d.id} className="hover:bg-dark-850/50">
                    <td className="py-3.5 px-4 font-bold text-slate-400">#{d.id}</td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-white max-w-xs truncate">
                      {d.productTitle}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="text-white block font-medium">{d.userName}</span>
                      <span className="text-slate-500 text-[10px]">{d.userEmail}</span>
                    </td>
                    <td className="py-3.5 px-4 text-sharp-400 font-bold">#{d.orderId}</td>
                    <td className="py-3.5 px-4 text-cyan-400">{d.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(d.downloadedAt).toLocaleString()}
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
    </div>
  );
};
