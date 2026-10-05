import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  Download,
  ArrowUpRight,
  PlusCircle,
  Eye,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminDashboardStats } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-dark-900 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-dark-900 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'PSD Products', value: stats.totalProducts, icon: Package, color: 'text-rose-400', link: '/admin/products' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-cyan-400', link: '/admin/orders' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'text-purple-400', link: '/admin/users' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400', link: '/admin/orders' },
    { label: "Today's Sales", value: `₹${stats.todaySales.toFixed(2)}`, icon: TrendingUp, color: 'text-amber-400', link: '/admin/orders' },
    { label: 'Total Downloads', value: stats.totalDownloads, icon: Download, color: 'text-blue-400', link: '/admin/downloads' },
  ];

  return (
    <div className="space-y-8">
      {/* Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Marketplace Overview</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Live metrics and digital asset sales performance</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/products/new?format=png"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-dark-900 hover:bg-dark-850 text-cyan-300 hover:text-white border border-cyan-500/30 font-semibold text-xs transition-all"
          >
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span>Upload Free PNG</span>
          </Link>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sharp-600 hover:bg-sharp-500 text-white font-semibold text-xs shadow-sharp-glow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload PSD File</span>
          </Link>
        </div>
      </div>

      {/* 6 Stat Cards (Section 15) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="bg-dark-900 border border-dark-800 hover:border-dark-750 rounded-2xl p-6 shadow-card-dark hover:shadow-card-hover transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{card.label}</span>
                <div className={`w-10 h-10 rounded-xl bg-dark-950 flex items-center justify-center ${card.color} shadow`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white group-hover:text-sharp-400 transition-colors">
                  {card.value}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Dedicated PNG Products Section */}
      <div className="bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-7 shadow-card-dark relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-cyan-500/10 blur-[90px] pointer-events-none rounded-full" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>PNG Elements & Transparent Graphics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Dedicated PNG Asset Portal</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Manage free and commercial transparent PNG assets, isolated design cutouts, and monitor free instant customer downloads.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
            <div className="bg-dark-950/80 border border-dark-800 rounded-2xl px-4 py-3 text-center min-w-[95px]">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">PNG Items</span>
              <span className="text-xl font-black font-mono text-white">{stats.totalPngProducts ?? 0}</span>
            </div>
            <div className="bg-dark-950/80 border border-dark-800 rounded-2xl px-4 py-3 text-center min-w-[95px]">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Free Listings</span>
              <span className="text-xl font-black font-mono text-emerald-400">{stats.freePngCount ?? 0}</span>
            </div>
            <div className="bg-dark-950/80 border border-dark-800 rounded-2xl px-4 py-3 text-center min-w-[95px]">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Downloads</span>
              <span className="text-xl font-black font-mono text-sky-400">{stats.totalPngDownloads ?? 0}</span>
            </div>
            <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
              <Link
                to="/admin/png-products"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sharp-600 hover:from-cyan-500 hover:to-sharp-500 text-white font-semibold text-xs transition-all shadow-sharp-glow text-center flex items-center justify-center gap-1.5"
              >
                <span>Manage PNGs</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/admin/products/new?format=png"
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-200 border border-dark-700 font-semibold text-xs transition-all text-center flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload PNG</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row: Sales by Day & Revenue by Month */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sales by Day Chart */}
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-card-dark">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Daily Sales (Last 7 Days)</h3>
              <p className="text-xs text-slate-400">Order transaction distribution</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Live</span>
          </div>

          <div className="h-48 flex items-end gap-3 pt-6 border-b border-dark-800 pb-2">
            {stats.salesByDay?.map((d, i) => {
              const maxSale = Math.max(...stats.salesByDay.map((s) => Number(s.sales) || 1), 100);
              const heightPercent = Math.min(100, Math.max(15, (Number(d.sales) / maxSale) * 100));

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{d.sales}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-sharp-600 to-rose-400 rounded-t-lg group-hover:brightness-125 transition-all shadow-sharp-glow/30"
                  />
                  <span className="text-[10px] font-mono text-slate-400 truncate w-full text-center">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by Month Chart */}
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-card-dark">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Revenue by Month</h3>
              <p className="text-xs text-slate-400">Monthly gross collection</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">6 Months</span>
          </div>

          <div className="h-48 flex items-end gap-3 pt-6 border-b border-dark-800 pb-2">
            {stats.revenueByMonth?.map((m, i) => {
              const maxRev = Math.max(...stats.revenueByMonth.map((s) => Number(s.revenue) || 1), 1000);
              const heightPercent = Math.min(100, Math.max(20, (Number(m.revenue) / maxRev) * 100));

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{m.revenue}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-cyan-600 to-emerald-400 rounded-t-lg group-hover:brightness-125 transition-all"
                  />
                  <span className="text-[10px] font-mono text-slate-400 truncate w-full text-center">
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popular Products Table (Section 15) */}
      <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-card-dark">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white">Top Performing PSD Assets</h3>
            <p className="text-xs text-slate-400">Assets ranked by customer download count</p>
          </div>
          <Link to="/admin/products" className="text-xs text-sharp-400 hover:text-sharp-300 font-semibold">
            View All Products →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-950/80 text-slate-400 font-mono uppercase border-b border-dark-800">
              <tr>
                <th className="py-3 px-4">Thumbnail</th>
                <th className="py-3 px-4">Template Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Downloads</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/80 text-slate-300">
              {stats.popularProducts?.map((p) => (
                <tr key={p.id} className="hover:bg-dark-850/50">
                  <td className="py-2.5 px-4">
                    <img
                      src={p.thumbnailUrl}
                      alt={p.title}
                      className="w-10 h-10 rounded-lg object-cover bg-dark-950"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('unsplash.com')) {
                          target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
                        }
                      }}
                    />
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-white max-w-xs truncate">{p.title}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">{p.category?.name}</td>
                  <td className="py-2.5 px-4 font-mono text-white font-bold">₹{p.price}</td>
                  <td className="py-2.5 px-4 font-mono text-emerald-400 font-bold">{p.downloadCount} downloads</td>
                  <td className="py-2.5 px-4 text-right">
                    <Link
                      to={`/product/${p.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white inline-block"
                      title="View on marketplace"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
