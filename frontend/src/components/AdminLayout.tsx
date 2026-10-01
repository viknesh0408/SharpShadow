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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { label: 'Download Audit', path: '/admin/downloads', icon: Download },
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
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sharp-600 to-sharp-500 flex items-center justify-center text-white font-mono font-bold text-sm shadow-sharp-glow">
                SS
              </div>
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
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white font-semibold text-xs shadow-sharp-glow transition-all"
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
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sharp-600 text-white shadow-sharp-glow'
                      : 'text-slate-400 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
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
          <span>SharpShadow Administration Panel</span>
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
