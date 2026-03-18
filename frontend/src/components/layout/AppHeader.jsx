import { NavLink, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { cn } from '../../lib/cn';


function HeaderLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'relative text-[13px] font-semibold tracking-wide text-white/70 hover:text-white transition-all duration-200 py-1',
          isActive && 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white after:rounded-full',
        )
      }
    >
      {children}
    </NavLink>
  );
}

const LogoIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-9 w-9"
  >
    {/* Stacked rhombuses logo */}
    <path 
      d="M12 4L3 8.5L12 13L21 8.5L12 4Z" 
      fill="white" 
      className="opacity-100"
    />
    <path 
      d="M3 12.5L12 17L21 12.5L12 8L3 12.5Z" 
      fill="white" 
      className="opacity-60"
    />
    <path 
      d="M3 16.5L12 21L21 16.5L12 12L3 16.5Z" 
      fill="white" 
      className="opacity-30"
    />
  </svg>
);

export default function AppHeader() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-[#1e4ad8] text-white border-b border-white/10 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/analyze')}
        >
          <div className="flex-shrink-0 group-hover:scale-105 transition-transform">
            <LogoIcon />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white leading-none">
            FoundersCore
          </span>
        </div>

        <nav className="flex items-center gap-8">
          <HeaderLink to="/analyze">Analyze</HeaderLink>
          <HeaderLink to="/history">History</HeaderLink>

          <button
            type="button"
            onClick={() => navigate('/profile')}
            aria-label="Open profile"
            className="ml-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 ring-1 ring-white/20 transition-all active:scale-95"
          >
            <User className="h-5 w-5 text-white/90" />
          </button>
        </nav>
      </div>
    </header>
  );
}

