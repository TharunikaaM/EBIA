import * as React from 'react';
import { cn } from '../../lib/cn';

export default function SelectorRow({ icon: Icon, label, value, onChange, placeholder, className, tooltip }) {
  const inputRef = React.useRef(null);

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={cn(
        "group flex items-center gap-3 rounded-xl bg-[var(--bg-main)] p-3 border border-[var(--border-color)] hover:border-blue-500 transition-all cursor-text focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500",
        className
      )}
    >
      {Icon && (
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-card)] text-blue-600 border border-[var(--border-color)] flex-shrink-0 transition-colors group-hover:border-blue-500/30">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <div className="text-[9px] font-black tracking-widest text-[var(--text-muted)] uppercase leading-none">
            {label}
          </div>
          {tooltip && (
            <div className="group/tooltip relative">
              <span className="text-[9px] text-[var(--text-muted)] cursor-help flex items-center justify-center h-3 w-3 rounded-full border border-[var(--border-color)]">?</span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 bg-slate-900 text-white text-[9px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
              </div>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-w-0 bg-transparent text-xs font-bold text-[var(--text-main)] placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none transition-all"
        />
      </div>
    </div>
  );
}
