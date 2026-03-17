import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, History, Settings, LogOut } from 'lucide-react';

const UserMenu = ({ user, onShowHistory, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-3 py-1.5 px-2 rounded-2xl hover:bg-white/5 transition-all group"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-white leading-none">{user.name}</p>
          <p className="text-[10px] text-slate-500 leading-none mt-1 uppercase tracking-wider">{user.email}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black text-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
          {user.name.charAt(0)}
        </div>
        <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute right-0 top-full mt-3 w-56 glass rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="p-4 border-b border-white/5 bg-white/5">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Account</p>
            <p className="text-sm font-bold text-white truncate">{user.email}</p>
          </div>
          <div className="p-2">
            <button
              onClick={() => { setOpen(false); onShowHistory(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all font-medium"
            >
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <History size={15} />
              </div>
              My Past Ideas
            </button>
            <button
              disabled
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 opacity-50 cursor-not-allowed font-medium"
            >
              <div className="p-1.5 rounded-lg bg-slate-500/10">
                <Settings size={15} />
              </div>
              Preferences
            </button>
          </div>
          <div className="p-2 border-t border-white/5">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-all font-medium"
            >
              <div className="p-1.5 rounded-lg bg-rose-500/10">
                <LogOut size={15} />
              </div>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
