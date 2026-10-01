import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { User as UserIcon, ShoppingBag, Download, Heart, LogOut, DownloadCloud, FileText, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import { downloadService } from '../services/downloadService';
import { Order, Download as DownloadType } from '../types';
import { ProductCard } from '../components/ProductCard';

export const Account: React.FC = () => {
  const { user, logout } = useAuth();
  const { wishlist } = useCart();
  const { success, error } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'downloads';

  const [orders, setOrders] = useState<Order[]>([]);
  const [downloads, setDownloads] = useState<DownloadType[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingDownloads, setLoadingDownloads] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

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

      {/* Tab 4: PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-8 max-w-xl space-y-6">
          <h2 className="text-lg font-bold text-white">Profile Details</h2>
          <div className="space-y-4 text-sm">
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase">Full Name</label>
              <input
                disabled
                value={user?.name || ''}
                className="w-full bg-dark-950 border border-dark-750 rounded-xl px-4 py-2.5 text-white mt-1 cursor-not-allowed opacity-80"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase">Email Address</label>
              <input
                disabled
                value={user?.email || ''}
                className="w-full bg-dark-950 border border-dark-750 rounded-xl px-4 py-2.5 text-white mt-1 cursor-not-allowed opacity-80"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase">Account Security</label>
              <p className="text-xs text-slate-400 mt-1">
                Your account is protected with BCrypt hash encryption and stateless JWT token authentication.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
