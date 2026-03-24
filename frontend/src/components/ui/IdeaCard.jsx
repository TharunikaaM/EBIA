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
  isSaved = false, 
  onAnalyze, 
  onSave 
}) {
  return (
    <BaseCard className={cn(
      "flex flex-col h-full group p-8 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 bg-[var(--bg-card)] border-[var(--border-color)] relative overflow-hidden",
      isSaved && "ring-2 ring-blue-500/20 border-blue-500/30"
    )}>
      <div className="flex items-start justify-between mb-8">
        <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          {Icon && <Icon className="h-7 w-7" />}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={cn(
            "h-10 w-24 rounded-xl flex items-center justify-center font-black text-xs transition-colors",
            marketFit >= 80 
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" 
              : "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
          )}>
            {marketFit}% FIT
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave?.(e);
            }}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-300 shadow-sm",
              isSaved 
                ? "bg-emerald-50 text-emerald-500 border border-emerald-100" 
                : "bg-slate-50 text-slate-300 hover:text-emerald-400 border border-slate-100"
            )}
            title={isSaved ? "Remove from saved" : "Save for later"}
          >
            <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-black text-[var(--text-main)] mb-3 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">
          {title}
        </h3>
        <p className="text-xs font-bold text-[var(--text-muted)] leading-relaxed line-clamp-2">
          {targetAudience}
        </p>
      </div>

      <div className="space-y-3 mb-8 flex-grow">
        {(Array.isArray(bullets) ? bullets : [bullets]).slice(0, 3).map((b, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
            <span className="text-[11px] font-bold text-[var(--text-main)] leading-tight">{b}</span>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 opacity-70">MVP BUDGET</span>
          <span className="text-sm font-black text-blue-600">
            {mvpBudget}
          </span>
        </div>
        <BaseButton 
          onClick={(e) => {
            e.stopPropagation();
            onAnalyze?.(e);
          }} 
          className="min-w-28 font-black text-[10px] uppercase tracking-widest h-11 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 text-white"
        >
          Analyze Idea
        </BaseButton>
      </div>
    </BaseCard>
  );
}
