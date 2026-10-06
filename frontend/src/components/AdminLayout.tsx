import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Ticket,
  Download,
  LogOut,
  ExternalLink,
  Menu,
  X,
  PlusCircle,
  Github,
  Settings,
  Sun,
  Moon,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'PSD Products', path: '/admin/products', icon: Package },
    { label: 'PNG Products', path: '/admin/png-products', icon: ImageIcon, badge: 'PNG' },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { label: 'Download Audit', path: '/admin/downloads', icon: Download },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-dark-900 border-r border-dark-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Admin Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-dark-800">
            <Link to="/admin" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="SharpShadows Admin"
                className="w-8 h-8 rounded-full object-contain shadow-sharp-glow group-hover:scale-105 transition-transform ring-1 ring-sharp-500/30"
              />
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wider text-white">
                  SHARP<span className="text-sharp-500">ADMIN</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">PORTAL V2</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Create Action */}
          <div className="p-4">
            <Link
              to="/admin/products/new"
              onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sharp-600 hover:bg-sharp-500 dark:bg-gradient-to-r dark:from-sharp-600 dark:to-sharp-500 dark:hover:from-sharp-500 dark:hover:to-sharp-400 text-white font-semibold text-xs shadow-sharp-glow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Upload New PSD
            </Link>
          </div>

          {/* Nav List */}
          <nav className="px-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sharp-600 text-white shadow-sharp-glow'
                      : 'text-slate-400 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {(item as any).badge && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded tracking-wider ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {(item as any).badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-dark-800 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <span>Live Marketplace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-sharp-400 hover:text-sharp-300 hover:bg-dark-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-20 bg-dark-900/60 backdrop-blur-md border-b border-dark-800 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-dark-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-base font-semibold text-white">Marketplace Administration</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="relative p-2 rounded-full bg-dark-850 border border-dark-750 text-slate-300 hover:text-white hover:border-sharp-500/50 hover:bg-dark-800 active:scale-95 transition-all duration-300 group shadow-sm focus:outline-none"
              title={isDark ? "Switch to light theme" : "Switch to dark theme"}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 group-hover:scale-110 transition-all duration-300" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-500 group-hover:-rotate-12 group-hover:scale-110 transition-all duration-300" />
                )}
              </div>
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">{user?.email}</span>
            <div className="w-8 h-8 rounded-full bg-sharp-500/20 text-sharp-400 border border-sharp-500/30 flex items-center justify-center font-bold text-xs uppercase">
              {user?.name.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Outlet for Admin Pages */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Admin Footer */}
        <footer className="px-6 py-4 border-t border-dark-800 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>SharpShadows Administration Panel</span>
          <p className="flex items-center gap-1.5 text-slate-400">
            <span>Developed by</span>
            <a
              href="https://github.com/viknesh0408"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sharp-400 hover:text-sharp-300 font-semibold inline-flex items-center gap-1 transition-colors hover:underline"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Viknesh</span>
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};
