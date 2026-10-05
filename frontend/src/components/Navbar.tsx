import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User as UserIcon, Menu, X, Shield, LogOut, ChevronDown, Layers, Sun, Moon, LogIn, UserPlus, Home, Grid, Image as ImageIcon } from 'lucide-react';
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
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    setAuthDropdownOpen(false);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
              alt="SharpShadows Logo"
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-contain shadow-sharp-glow group-hover:scale-105 transition-transform duration-300 ring-1 ring-sharp-500/30"
            />
            <div className="flex flex-col">
              <span className="font-black text-base sm:text-xl tracking-wider text-slate-900 dark:text-white font-sans flex items-center">
                SHARP<span className="text-sharp-500">SHADOWS</span>
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
              <Link to="/browse" className="hover:text-sharp-600 dark:hover:text-white transition-colors">Browse PSDs</Link>
              <Link to="/browse?category=png-elements" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                <span>PNG Assets</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 font-mono text-[9px] font-bold border border-emerald-500/30">FREE</span>
              </Link>
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
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
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
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Desktop: standard Login & Register buttons */}
                <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
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

                {/* Mobile: single user account icon button with floating login/register card */}
                <div className="relative sm:hidden">
                  <button
                    type="button"
                    onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
                    className="relative p-2 rounded-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-sharp-500/50 hover:bg-slate-50 dark:hover:bg-dark-850 active:scale-95 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-sharp-500/40"
                    title="Account"
                    aria-label="Account access"
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  </button>

                  {authDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setAuthDropdownOpen(false)}
                      />
                      <div
                        className="absolute right-0 mt-2.5 w-60 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 rounded-2xl shadow-xl dark:shadow-card-dark p-4 z-50 animate-in fade-in slide-in-from-top-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-3 pb-3 mb-3 border-b border-slate-100 dark:border-dark-800">
                          <div className="w-9 h-9 rounded-full bg-sharp-500/10 dark:bg-sharp-500/20 text-sharp-600 dark:text-sharp-400 flex items-center justify-center shrink-0">
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">Welcome</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Account access</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Link
                            to="/login"
                            onClick={() => setAuthDropdownOpen(false)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-dark-750 bg-slate-50 hover:bg-slate-100 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-800 dark:text-white transition-colors"
                          >
                            <LogIn className="w-3.5 h-3.5 text-sharp-500" />
                            Login
                          </Link>
                          <Link
                            to="/register"
                            onClick={() => setAuthDropdownOpen(false)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white shadow-sharp-glow transition-all"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            Register
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Mobile Hamburger Button with Floating Card Dropdown */}
            <div className="relative lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-dark-850 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>

              {mobileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <div
                    className="absolute right-0 mt-2.5 w-64 sm:w-72 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 rounded-2xl shadow-xl dark:shadow-card-dark p-3.5 z-50 animate-in fade-in slide-in-from-top-2 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 px-1 border-b border-slate-100 dark:border-dark-800">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Navigation</span>
                      <span className="text-[10px] font-mono text-sharp-500 bg-sharp-500/10 px-2 py-0.5 rounded-full font-semibold">SharpShadows</span>
                    </div>

                    <form onSubmit={handleSearch} className="relative mb-3">
                      <input
                        type="text"
                        placeholder="Search PSD templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-xl py-2 pl-9 pr-3 text-xs outline-none focus:border-sharp-500 transition-colors"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </form>

                    <nav className="flex flex-col gap-1">
                      <Link
                        to="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-sharp-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
                      >
                        <Home className="w-4 h-4 text-sharp-500" />
                        <span>Home</span>
                      </Link>
                      <Link
                        to="/browse"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-sharp-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
                      >
                        <Layers className="w-4 h-4 text-sharp-500" />
                        <span>Browse All PSDs</span>
                      </Link>
                      <Link
                        to="/browse?category=png-elements"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <ImageIcon className="w-4 h-4 text-cyan-500" />
                          <span>PNG Elements</span>
                        </div>
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-500 font-mono text-[9px] font-bold border border-emerald-500/30">
                          FREE
                        </span>
                      </Link>
                      <Link
                        to="/categories"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-sharp-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
                      >
                        <Grid className="w-4 h-4 text-sharp-500" />
                        <span>Categories</span>
                      </Link>
                    </nav>

                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-dark-800 flex items-center justify-between px-2 text-xs">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Theme</span>
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-750 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm"
                      >
                        {isDark ? (
                          <>
                            <Sun className="w-3.5 h-3.5 text-amber-400" />
                            <span>Light</span>
                          </>
                        ) : (
                          <>
                            <Moon className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Dark</span>
                          </>
                        )}
                      </button>
                    </div>

                    {!isAuthenticated && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-dark-800 flex gap-2">
                        <Link
                          to="/login"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex-1 py-1.5 text-center text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-800 dark:text-white transition-colors"
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex-1 py-1.5 text-center text-xs font-semibold rounded-xl bg-gradient-to-r from-sharp-600 to-sharp-500 hover:from-sharp-500 hover:to-sharp-400 text-white shadow-sharp-glow transition-all"
                        >
                          Register
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
