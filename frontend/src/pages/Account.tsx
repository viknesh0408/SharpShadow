import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { User as UserIcon, ShoppingBag, Download, Heart, LogOut, DownloadCloud, FileText, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Edit2, Check, X, Loader2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import { downloadService } from '../services/downloadService';
import { authService } from '../services/authService';
import { Order, Download as DownloadType } from '../types';
import { ProductCard } from '../components/ProductCard';

export const Account: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { wishlist } = useCart();
  const { success, error } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'downloads';

  const [orders, setOrders] = useState<Order[]>([]);
  const [downloads, setDownloads] = useState<DownloadType[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingDownloads, setLoadingDownloads] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setNameInput(user.name);
    }
  }, [user?.name]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      error('Name cannot be empty');
      return;
    }
    if (trimmed.length < 2) {
      error('Name must be at least 2 characters');
      return;
    }
    setSavingName(true);
    try {
      const updatedUser = await authService.updateProfile({ name: trimmed });
      updateUser(updatedUser);
      setIsEditingName(false);
      success('Your profile name has been updated successfully!');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      setLoadingOrders(true);
      orderService.getUserOrders(0, 50)
        .then((res) => setOrders(res.content))
        .catch(console.error)
        .finally(() => setLoadingOrders(false));
    } else if (activeTab === 'downloads') {
      setLoadingDownloads(true);
      downloadService.getDownloadHistory(0, 50)
        .then((res) => setDownloads(res.content as any))
        .catch(console.error)
        .finally(() => setLoadingDownloads(false));
    }
  }, [activeTab]);

  const handleDownloadFile = async (productId: number) => {
    setDownloadingId(productId);
    try {
      const res = await downloadService.getDownloadUrl(productId);
      success('Download authorized! Starting your PSD file download...');
      window.location.href = res.downloadUrl;
    } catch (err: any) {
      error(err.response?.data?.message || 'Download authorization failed');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Bar */}
      <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-card-dark">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sharp-600 to-rose-400 text-white flex items-center justify-center font-bold text-2xl font-mono shadow-sharp-glow">
            {user?.name.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">{user?.name}</h1>
            <p className="text-xs sm:text-sm text-slate-400">{user?.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] bg-dark-950 text-slate-300 px-2 py-0.5 rounded font-mono border border-dark-800">
                ROLE: {user?.role}
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3" /> Verified Customer
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-dark-950 border border-dark-800 text-slate-400 hover:text-sharp-400 transition-colors text-xs font-semibold flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-dark-800 overflow-x-auto pb-1">
        <button
          onClick={() => setSearchParams({ tab: 'downloads' })}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'downloads'
              ? 'bg-sharp-600 text-white shadow-sharp-glow'
              : 'text-slate-400 hover:text-white hover:bg-dark-900'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>My Downloads</span>
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'orders' })}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'orders'
              ? 'bg-sharp-600 text-white shadow-sharp-glow'
              : 'text-slate-400 hover:text-white hover:bg-dark-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Order History</span>
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'wishlist' })}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'wishlist'
              ? 'bg-sharp-600 text-white shadow-sharp-glow'
              : 'text-slate-400 hover:text-white hover:bg-dark-900'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist ({wishlist.length})</span>
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'profile' })}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'profile'
              ? 'bg-sharp-600 text-white shadow-sharp-glow'
              : 'text-slate-400 hover:text-white hover:bg-dark-900'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Account Settings</span>
        </button>
      </div>

      {/* Tab 1: DOWNLOADS */}
      {activeTab === 'downloads' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Download Access Vault</h2>
            <span className="text-xs font-mono text-slate-400">Unlimited re-downloads available</span>
          </div>

          {loadingDownloads ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading purchases...</div>
          ) : downloads.length === 0 ? (
            <div className="bg-dark-900 border border-dark-800 rounded-3xl p-12 text-center space-y-4">
              <DownloadCloud className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Downloads Available Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Any PSD assets you purchase will appear here with permanent access to temporary signed download tokens.
              </p>
              <Link to="/browse" className="inline-block px-5 py-2.5 rounded-xl bg-sharp-600 text-white text-xs font-semibold">
                Explore Templates
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {downloads.map((item) => (
                <div
                  key={item.id}
                  className="bg-dark-900 border border-dark-800 rounded-2xl p-5 space-y-4 shadow-card-dark flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-sharp-400 uppercase font-bold">PSD TEMPLATE</span>
                    <h3 className="font-semibold text-white text-sm line-clamp-2">{item.productTitle}</h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span>{item.fileSize || 'Layered PSD'}</span>
                      <span>•</span>
                      <span>Order #{item.orderId}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadFile(item.productId)}
                    disabled={downloadingId === item.productId}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloadingId === item.productId ? 'Generating...' : 'Download File'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: ORDERS (Section 11 Table) */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Past Orders</h2>

          {loadingOrders ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-dark-900 border border-dark-800 rounded-3xl p-12 text-center text-slate-400">
              You haven't placed any orders yet.
            </div>
          ) : (
            <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-card-dark">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-dark-950/80 text-slate-400 font-mono uppercase border-b border-dark-800">
                    <tr>
                      <th className="py-3.5 px-4">Order Number</th>
                      <th className="py-3.5 px-4">Product(s)</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-800/80 text-slate-300 font-mono">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-dark-850/50">
                        <td className="py-3.5 px-4 font-semibold text-white">{o.orderNumber}</td>
                        <td className="py-3.5 px-4 font-sans">
                          {o.items?.map((it) => it.productTitle).join(', ') || 'PSD Template'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">₹{o.totalAmount.toFixed(2)}</td>
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
                          {o.status === 'PAID' && (
                            <button
                              onClick={() => setSearchParams({ tab: 'downloads' })}
                              className="text-sharp-400 hover:text-sharp-300 font-semibold"
                            >
                              Download →
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Saved Templates ({wishlist.length})</h2>
          {wishlist.length === 0 ? (
            <div className="bg-dark-900 border border-dark-800 rounded-3xl p-12 text-center text-slate-400">
              Your wishlist is currently empty. Click the heart icon on any template card to save it here.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {wishlist.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: PROFILE / SETTINGS */}
      {activeTab === 'profile' && (
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-8 max-w-2xl space-y-8 shadow-card-dark">
          <div className="border-b border-dark-800 pb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-sharp-400" />
              Account Settings & Profile
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Manage your display name, license owner identity, and security preferences.
            </p>
          </div>

          <div className="space-y-6">
            {/* Full Name Field (Editable) */}
            <div className="bg-dark-950/70 border border-dark-800/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
                    Full Name / Display Name
                  </label>
                  <p className="text-[11px] text-slate-500">
                    This name appears on your invoices, download receipts, and dashboard.
                  </p>
                </div>
                {!isEditingName && (
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput(user?.name || '');
                      setIsEditingName(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-sharp-400 text-xs font-medium border border-dark-700/60 transition-all hover:border-sharp-500/40"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Name</span>
                  </button>
                )}
              </div>

              {isEditingName ? (
                <form onSubmit={handleSaveName} className="space-y-3 pt-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Enter your full name"
                      maxLength={100}
                      autoFocus
                      disabled={savingName}
                      className="w-full bg-dark-900 border border-sharp-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sharp-500/50 focus:border-sharp-400 transition-all font-medium disabled:opacity-50"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-mono text-slate-500">
                      {nameInput.length}/100
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={savingName || !nameInput.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sharp-600 hover:bg-sharp-500 text-white text-xs font-semibold shadow-sharp-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingName ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={savingName}
                      onClick={() => {
                        setNameInput(user?.name || '');
                        setIsEditingName(false);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-dark-900 hover:bg-dark-800 text-slate-400 hover:text-white text-xs font-medium border border-dark-750 transition-all disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-9 h-9 rounded-xl bg-sharp-500/10 border border-sharp-500/20 text-sharp-400 flex items-center justify-center font-bold text-sm font-mono">
                    {user?.name.charAt(0) || 'U'}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white">{user?.name}</span>
                    <span className="ml-2 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                      Active
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Email Address (Protected) */}
            <div className="bg-dark-950/70 border border-dark-800/80 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
                  Email Address
                </label>
                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                  <Lock className="w-3 h-3 text-slate-400" /> License Locked
                </span>
              </div>
              <input
                disabled
                value={user?.email || ''}
                className="w-full bg-dark-900 border border-dark-800 rounded-xl px-4 py-2.5 text-sm text-slate-400 font-mono cursor-not-allowed select-none opacity-75"
              />
              <p className="text-[11px] text-slate-500">
                Your email is cryptographically bound to your digital product licenses and purchase vault.
              </p>
            </div>

            {/* Account Details & Security */}
            <div className="bg-dark-950/70 border border-dark-800/80 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
                Account Security & Authentication
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-dark-900/60 border border-dark-800">
                  <span className="text-slate-500 block text-[10px] font-mono uppercase">User Role</span>
                  <span className="text-white font-semibold font-mono">{user?.role}</span>
                </div>
                <div className="p-3 rounded-xl bg-dark-900/60 border border-dark-800">
                  <span className="text-slate-500 block text-[10px] font-mono uppercase">Protection</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" /> BCrypt + JWT
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
