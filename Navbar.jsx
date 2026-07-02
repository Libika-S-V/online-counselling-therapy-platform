import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LanguageToggle from './LanguageToggle';
import { Sun, Moon, LogOut, User, Menu, X, HeartPulse } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = () => {
    if (!user) {
      return (
        <>
          <Link to="/therapists" className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 px-3 py-2 font-medium">Find a Therapist</Link>
          <Link to="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium px-4 py-2 border border-primary-600 dark:border-primary-400 rounded-lg ml-2">Log In</Link>
          <Link to="/signup" className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg ml-2 shadow-sm">Sign Up</Link>
        </>
      );
    }

    if (user.role === 'admin') {
      return (
        <>
          <Link to="/admin" className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 px-3 py-2 font-medium">Dashboard</Link>
          <Link to="/admin/therapists/pending" className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 px-3 py-2 font-medium">Approvals</Link>
          <Link to="/admin/users" className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 px-3 py-2 font-medium">Users</Link>
        </>
      );
    }

    if (user.role === 'therapist') {
      return (
        <>
          <Link to="/therapist" className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 px-3 py-2 font-medium">Dashboard</Link>
          <Link to="/therapist/appointments" className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 px-3 py-2 font-medium">Sessions</Link>
          <Link to="/therapist/availability" className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 px-3 py-2 font-medium">Availability</Link>
          <Link to="/therapist/earnings" className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 px-3 py-2 font-medium">Earnings</Link>
        </>
      );
    }

    return (
      <>
        <Link to="/dashboard" className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 px-3 py-2 font-medium">Dashboard</Link>
        <Link to="/therapists" className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 px-3 py-2 font-medium">Find Therapist</Link>
        <Link to="/appointments" className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 px-3 py-2 font-medium">My Sessions</Link>
        <Link to="/mood" className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 px-3 py-2 font-medium">Mood Journal</Link>
      </>
    );
  };

  return (
    <nav className="glass sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={user ? (user.role === 'client' ? '/dashboard' : `/${user.role}`) : '/'} className="flex items-center gap-2">
              <div className="bg-primary-600 p-1.5 rounded-lg">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              <span className="font-outfit font-bold text-xl tracking-tight text-slate-900 dark:text-white">Serein</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <LanguageToggle />
            {navLinks()}
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 ml-4 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user && (
              <div className="flex items-center ml-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                <Link to={user.role === 'client' ? '/profile' : (user.role === 'therapist' ? '/therapist/profile' : '#')} className="flex items-center gap-2 mr-4 text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${import.meta.env.VITE_API_BASE_URL}${user.profilePhoto}`} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <span className="font-medium text-sm hidden lg:block">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 mr-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            {navLinks()}
            {user && (
              <button
                onClick={handleLogout}
                className="text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-md font-medium flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
