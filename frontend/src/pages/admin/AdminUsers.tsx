import React, { useEffect, useState } from 'react';
import { Users, Shield, User as UserIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { success, error } = useToast();

  const loadUsers = async (page = 0) => {
    setLoading(true);
    try {
      const res = await adminService.getUsers(page, 20);
      setUsers(res.content);
      setTotalPages(res.totalPages);
      setCurrentPage(res.pageNumber);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(currentPage);
  }, [currentPage]);

  const handleRoleToggle = async (user: User) => {
    const newRole = user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    if (!window.confirm(`Change role of "${user.email}" to ${newRole}?`)) return;

    try {
      await adminService.updateUserRole(user.id, newRole);
      success(`User role updated to ${newRole}`);
      loadUsers(currentPage);
    } catch (err: any) {
      error(err.response?.data?.message || 'Could not update user role');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Registered Customer Management</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">View user accounts, download authorizations, and roles</p>
      </div>

      <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-card-dark">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">No users registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-950/80 text-slate-400 font-mono uppercase border-b border-dark-800">
                <tr>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/80 text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-dark-850/50">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-dark-800 text-sharp-400 flex items-center justify-center font-bold text-xs uppercase">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{u.email}</td>
                    <td className="py-3.5 px-4 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-sharp-500/20 text-sharp-400 border border-sharp-500/40'
                            : 'bg-dark-800 text-slate-300 border border-dark-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRoleToggle(u)}
                        className="px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white font-mono text-[10px] border border-dark-700 transition-colors"
                      >
                        Make {u.role === 'ADMIN' ? 'Customer' : 'Admin'}
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
    </div>
  );
};
