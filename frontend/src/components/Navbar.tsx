import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User as UserIcon, Menu, X, Shield, LogOut, ChevronDown, Layers, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-dark-950/85 backdrop-blur-md border-b border-slate-200 dark:border-dark-800 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <img
              src="/logo.png"
              alt="SharpShadow Logo"
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-contain shadow-sharp-glow group-hover:scale-105 transition-transform duration-300 ring-1 ring-sharp-500/30"
            />
            <div className="flex flex-col">
              <span className="font-black text-base sm:text-xl tracking-wider text-slate-900 dark:text-white font-sans flex items-center">
                SHARP<span className="text-sharp-500">SHADOW</span>
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-widest text-slate-500 dark:text-slate-400 uppercase font-mono -mt-1 hidden sm:block">
                DIGITAL PSD ASSETS
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar (shown on non-homepage views) */}
          {!isHomePage && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 relative animate-in fade-in duration-200">
              <input
                type="text"
                placeholder="Search PSD templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-dark-750 focus:border-sharp-500 focus:ring-1 focus:ring-sharp-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-full py-2.5 pl-11 pr-4 text-sm transition-all outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>
          )}

          {/* Desktop Navigation Links (hidden on home page) */}
          {!isHomePage && (
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 animate-in fade-in duration-200">
              <Link to="/" className="hover:text-sharp-600 dark:hover:text-white transition-colors">Home</Link>
              <Link to="/browse" className="hover:text-sharp-600 dark:hover:text-white transition-colors">Browse</Link>
              <Link to="/categories" className="hover:text-sharp-600 dark:hover:text-white transition-colors flex items-center gap-1">
                Categories
              </Link>
            </nav>
          )}

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Theme Switch Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="relative p-2 sm:p-2.5 rounded-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-sharp-500/50 hover:bg-slate-50 dark:hover:bg-dark-850 active:scale-95 transition-all duration-300 group shadow-sm focus:outline-none focus:ring-2 focus:ring-sharp-500/40"
              title={isDark ? "Switch to light theme" : "Switch to dark theme"}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                {isDark ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:rotate-45 group-hover:scale-110 transition-all duration-300" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 group-hover:-rotate-12 group-hover:scale-110 transition-all duration-300" />
                )}
              </div>
            </button>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 sm:p-2.5 rounded-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:border-sharp-500/50 transition-all group shadow-sm"
              title="Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-105 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-sharp-500 text-white font-mono text-[10px] sm:text-[11px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-sharp-glow">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth / Account */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 hover:border-slate-300 dark:hover:border-dark-600 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-sharp-500/20 text-sharp-600 dark:text-sharp-400 flex items-center justify-center font-bold text-xs uppercase">
                    {user?.name.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user?.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 rounded-2xl shadow-xl dark:shadow-card-dark py-2 z-50 text-sm font-medium animate-in fade-in slide-in-from-top-2"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-dark-800">
                      <p className="text-slate-900 dark:text-white font-semibold truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <Link to="/account" className="flex items-center gap-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:text-sharp-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors">
                      <UserIcon className="w-4 h-4 text-sharp-500" />
                      My Account
                    </Link>

                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sharp-600 dark:text-sharp-400 hover:text-sharp-700 dark:hover:text-sharp-300 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors font-semibold">
                        <Shield className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-slate-500 dark:text-slate-400 hover:text-sharp-600 dark:hover:text-sharp-400 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors text-left border-t border-slate-100 dark:border-dark-800 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white text-xs sm:text-sm font-semibold shadow-sharp-glow transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button (shown on inner pages) */}
            {!isHomePage && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-dark-900"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search & Menu Drawer (shown on inner pages) */}
        {mobileMenuOpen && !isHomePage && (
          <div className="lg:hidden py-4 border-t border-slate-200 dark:border-dark-800 space-y-4 animate-in fade-in">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search PSD templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sharp-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <nav className="flex flex-col gap-2 font-medium text-slate-700 dark:text-slate-300">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-900">Home</Link>
              <Link to="/browse" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-900">Browse All PSDs</Link>
              <Link to="/categories" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-900">Categories</Link>

              {/* Mobile Theme Toggle */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-dark-750">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Theme</span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm"
                >
                  {isDark ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
              </div>

              {!isAuthenticated && (
                <div className="pt-2 border-t border-slate-200 dark:border-dark-800 flex gap-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 py-2 text-center text-sm font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-dark-800 text-slate-900 dark:text-white">
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
