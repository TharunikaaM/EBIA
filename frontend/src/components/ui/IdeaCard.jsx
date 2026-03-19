import BaseCard from './BaseCard';
import BaseButton from './BaseButton';
import { cn } from '../../lib/cn';
import { Bookmark } from 'lucide-react';

export default function IdeaCard({
  icon: Icon,
  title,
  marketFit,
  bullets = [],
  mvpBudget,
  targetAudience,
  revenueModel,
  onAnalyze,
  isSaved = false,
}) {
  return (
    <BaseCard className={cn(
      "group p-6 flex flex-col h-full shadow-lg border-[var(--border-color)] transition-all hover:scale-[1.02] bg-[var(--bg-card)] relative overflow-hidden",
      isSaved && "border-blue-500/50 ring-1 ring-blue-500/20 shadow-blue-500/5"
    )}>
      {isSaved && (
        <div className="absolute top-0 right-0 p-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-bl-2xl bg-blue-600 text-white shadow-lg animate-in slide-in-from-top-4 duration-300">
            <Bookmark className="h-3 w-3 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest">Selected</span>
          </div>
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {Icon ? (
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 transition-transform group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </div>
            ) : null}
            <div className="text-base font-black text-[var(--text-main)] leading-snug">
              {title}
            </div>
            <div className={cn(
              "mt-2 inline-flex items-center rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-tighter transition-colors",
              marketFit >= 80
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                : marketFit >= 60
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
            )}>
              {marketFit}% <span className="ml-1 opacity-70">Market Fit</span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5 opacity-60">Who is it for?</div>
            <p className="text-xs font-bold text-[var(--text-main)] leading-relaxed">{targetAudience || 'Broad Market'}</p>
          </div>

          <div>
            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5 opacity-60">Revenue Model</div>
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 leading-relaxed">{revenueModel || 'Direct/Subscription'}</p>
          </div>

          <div>
            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5 opacity-60">Core Features</div>
            <ul className="space-y-1.5 overflow-hidden">
              {(bullets || []).map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
                  <span className="leading-snug font-medium text-[11px] text-[var(--text-muted)]">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex items-center justify-between gap-4">
        <div className="text-sm">
          <span className="text-[var(--text-muted)] font-black text-[10px] uppercase tracking-wider block mb-0.5 opacity-60">EST. BUDGET</span>
          <span className="text-sm font-black text-[var(--text-main)]">
            {mvpBudget || 'Flexible'}
          </span>
        </div>
        <BaseButton onClick={onAnalyze} className="min-w-28 font-black text-[10px] uppercase tracking-widest h-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20">
          Analyze
        </BaseButton>
      </div>
    </BaseCard>
  );
}

