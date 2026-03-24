import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useAuth } from '../../context/AuthContext';

function HeaderLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'relative text-[13px] font-semibold tracking-wide text-white/70 hover:text-white transition-all duration-200 py-1.5 px-1',
          isActive && 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-white after:rounded-full',
        )
      }
    >
      {children}
    </NavLink>
  );
}

const LogoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
    <path d="M12 4L3 8.5L12 13L21 8.5L12 4Z" fill="white" className="opacity-100" />
    <path d="M3 12.5L12 17L21 12.5L12 8L3 12.5Z" fill="white" className="opacity-60" />
    <path d="M3 16.5L12 21L21 16.5L12 12L3 16.5Z" fill="white" className="opacity-30" />
  </svg>
);

export default function AppHeader({ onLogin }) {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#1e4ad8] text-white border-b border-white/10 shadow-sm">
      <div className="mx-auto flex h-16 max-w-[1920px] items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/analyze')}>
          <div className="flex-shrink-0 group-hover:scale-105 transition-transform"><LogoIcon /></div>
          <span className="text-2xl font-bold tracking-tight text-white leading-none">FoundersCore</span>
        </div>

        <nav className="flex items-center gap-8">
          <HeaderLink to="/analyze">Analyze My Idea</HeaderLink>
          <HeaderLink to="/history">My Ideas</HeaderLink>

          {isLoggedIn ? (
            /* ── Logged-in avatar + dropdown ── */
            <div className="relative ml-4" ref={dropRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 bg-white/10 hover:bg-white/20 ring-1 ring-white/20 transition-all"
              >
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-white/30 flex items-center justify-center text-xs font-black">
                    {(user?.name || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-bold text-white max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
                <ChevronDown className={cn("h-3.5 w-3.5 text-white/70 transition-transform", dropdownOpen && "rotate-180")} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User info row */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="h-4 w-4" /> Profile
                  </button>
                  <button
                    onClick={() => { logout(); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Guest: Sign In button ── */
            <button
              onClick={onLogin}
              className="ml-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white text-blue-700 text-xs font-black hover:bg-blue-50 transition-all shadow-md"
            >
              <User className="h-3.5 w-3.5" />
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
