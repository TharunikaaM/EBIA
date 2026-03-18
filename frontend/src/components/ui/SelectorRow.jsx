import * as React from 'react';
import { cn } from '../../lib/cn';

export default function SelectorRow({ icon: Icon, label, value, onChange, placeholder, rightPill, className }) {
  const inputRef = React.useRef(null);

  return (
    <div 
      onClick={() => inputRef.current?.focus()}
      className={cn(
        "group flex items-center justify-between gap-4 rounded-2xl bg-[var(--bg-card)] p-5 border border-[var(--border-color)] shadow-sm hover:border-[var(--color-primary)] transition-all cursor-text focus-within:ring-4 focus-within:ring-[var(--color-primary)]/10 focus-within:border-[var(--color-primary)]",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-4 w-full">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--bg-main)] text-[var(--color-primary)] border border-[var(--border-color)] flex-shrink-0 transition-colors group-hover:bg-[var(--bg-main)] group-hover:border-[var(--color-primary)]/30">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-medium tracking-widest text-[var(--text-muted)] uppercase flex items-center gap-1.5 leading-none">
            {label}
            <span className="hidden group-hover:block transition-opacity h-1 w-1 rounded-full bg-[var(--color-primary)] animate-pulse" />
          </div>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="mt-1 w-full min-w-0 bg-transparent text-sm font-medium text-[var(--text-main)] placeholder:text-[var(--text-muted)] opacity-80 focus:outline-none focus:opacity-100 transition-opacity"
          />
        </div>
      </div>
      {rightPill && (
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            {rightPill}
          </span>
        </div>
      )}
    </div>
  );
}
