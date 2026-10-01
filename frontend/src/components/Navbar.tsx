import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User as UserIcon, Menu, X, Shield, LogOut, ChevronDown, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-dark-950/85 backdrop-blur-md border-b border-dark-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sharp-600 via-sharp-500 to-rose-400 flex items-center justify-center shadow-sharp-glow group-hover:scale-105 transition-transform duration-300">
              <span className="font-mono font-black text-xl text-white tracking-wider">SS</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-wider text-white font-sans flex items-center">
                SHARP<span className="text-sharp-500">SHADOW</span>
              </span>
              <span className="text-[10px] tracking-widest text-slate-400 uppercase font-mono -mt-1">
                DIGITAL PSD ASSETS
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <input
              type="text"
              placeholder="Search PSD templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-900 border border-dark-750 focus:border-sharp-500 focus:ring-1 focus:ring-sharp-500 text-slate-100 placeholder-slate-500 rounded-full py-2.5 pl-11 pr-4 text-sm transition-all outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/browse" className="hover:text-white transition-colors">Browse</Link>
            <Link to="/categories" className="hover:text-white transition-colors flex items-center gap-1">
              Categories
            </Link>
            <Link to="/browse?sort=newest" className="hover:text-white transition-colors">Latest</Link>
            <Link to="/browse?sort=popular" className="hover:text-white transition-colors">Popular</Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full bg-dark-900 border border-dark-750 text-slate-200 hover:text-white hover:border-sharp-500/50 transition-all group"
              title="Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-sharp-500 text-white font-mono text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sharp-glow">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth / Account */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-dark-900 border border-dark-750 hover:border-dark-600 transition-colors text-sm font-medium text-slate-200"
                >
                  <div className="w-7 h-7 rounded-full bg-sharp-500/20 text-sharp-400 flex items-center justify-center font-bold text-xs uppercase">
                    {user?.name.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user?.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-dark-900 border border-dark-750 rounded-2xl shadow-card-dark py-2 z-50 text-sm font-medium animate-in fade-in slide-in-from-top-2"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-dark-800">
                      <p className="text-white font-semibold truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <Link to="/account" className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-dark-800 transition-colors">
                      <UserIcon className="w-4 h-4 text-sharp-400" />
                      My Account
                    </Link>

                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sharp-400 hover:text-sharp-300 hover:bg-dark-800 transition-colors font-semibold">
                        <Shield className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-slate-400 hover:text-sharp-400 hover:bg-dark-800 transition-colors text-left border-t border-dark-800 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white text-sm font-semibold shadow-sharp-glow transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-dark-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-dark-800 space-y-4 animate-in fade-in">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search PSD templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-900 border border-dark-750 text-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sharp-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <nav className="flex flex-col gap-2 font-medium text-slate-300">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-dark-900">Home</Link>
              <Link to="/browse" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-dark-900">Browse All PSDs</Link>
              <Link to="/categories" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-dark-900">Categories</Link>
              <Link to="/browse?sort=newest" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-dark-900">Latest PSDs</Link>
              <Link to="/browse?sort=popular" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-dark-900">Popular Templates</Link>

              {!isAuthenticated && (
                <div className="pt-2 border-t border-dark-800 flex gap-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 py-2 text-center text-sm font-semibold rounded-xl bg-dark-800 text-white">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 py-2 text-center text-sm font-semibold rounded-xl bg-sharp-600 text-white">
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
