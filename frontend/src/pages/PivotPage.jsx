import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ArrowLeft, Compass, DollarSign, Rocket, Target, Loader2, Search, Bookmark, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BaseCard from '../components/ui/BaseCard';
import BaseButton from '../components/ui/BaseButton';
import Tooltip from '../components/ui/Tooltip';
import { cn } from '../lib/cn';

const PIVOT_COLORS = [
  { border: 'border-l-blue-500', badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600', icon: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700' },
  { border: 'border-l-emerald-500', badge: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600', icon: 'text-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-700' },
  { border: 'border-l-violet-500', badge: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600', icon: 'text-violet-600', btn: 'bg-violet-600 hover:bg-violet-700' },
];

export default function PivotPage({ pivots = [], pivotsLoading = false, originalIdea = '', onAnalyze, onSave, onUnsave, onDiscuss }) {
  const navigate = useNavigate();
  const [savedPivots, setSavedPivots] = useState([]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Evaluation
      </button>

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-4">
          <Compass className="h-3.5 w-3.5" />
          Other ways to improve your idea
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-[var(--text-main)] tracking-tight mb-3">
          Better ways to improve your idea
        </h1>
        <p className="text-sm text-[var(--text-muted)] font-medium max-w-2xl mx-auto leading-relaxed">
          Here are 3 other ways to build your business based on current market trends.
        </p>
        {originalIdea && (
          <div className="mt-4 mx-auto max-w-xl px-5 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] font-medium">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-60">Original: </span>
            {originalIdea.length > 100 ? originalIdea.slice(0, 100) + '…' : originalIdea}
          </div>
        )}
      </div>

      {pivotsLoading ? (
        <div className="flex flex-col items-center py-20">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
          <p className="text-sm font-semibold text-[var(--text-muted)]">Finding better options for your idea…</p>
        </div>
      ) : pivots.length === 0 ? (
        <BaseCard className="p-10 text-center">
          <p className="text-[var(--text-muted)] font-medium">No pivot suggestions available yet. Complete an evaluation first.</p>
          <BaseButton className="mt-6" onClick={() => navigate('/analyze')}>
            Analyze an Idea
          </BaseButton>
        </BaseCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {pivots.map((pivot, i) => {
            const colors = PIVOT_COLORS[i % PIVOT_COLORS.length];
            return (
              <BaseCard key={i} className={cn("p-0 border-l-4 flex flex-col", colors.border)}>
                {/* Header */}
                <div className="p-6 pb-4 flex-1">
                  <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest mb-4", colors.badge)}>
                    <Target className="h-3 w-3" />
                    Option {i + 1}
                  </div>
                  <h3 className="text-base font-black text-[var(--text-main)] leading-snug mb-3">
                    {pivot.idea_description}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed">
                    {pivot.strategic_advantage}
                  </p>
                </div>

                {/* Budget Panel */}
                {pivot.budget_details && (
                  <div className="mx-6 mb-4 p-4 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)]">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className={cn("h-4 w-4", colors.icon)} />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Estimated Cost</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1">MVP</div>
                        <div className="font-black text-[var(--text-main)]">{pivot.budget_details.mvp_budget}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1">Scale</div>
                        <div className="font-black text-[var(--text-main)]">{pivot.budget_details.scaling_budget}</div>
                      </div>
                    </div>
                    {pivot.budget_details.resource_allocation?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {pivot.budget_details.resource_allocation.map((tag, j) => (
                          <span key={j} className="px-2 py-0.5 rounded-md bg-[var(--bg-card)] text-[9px] font-semibold text-[var(--text-muted)] border border-[var(--border-color)]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="px-6 pb-5 pt-2 border-t border-[var(--border-color)] bg-[var(--bg-main)]/30">
                  <div className="grid grid-cols-2 gap-3">
                    <Tooltip text="See more details about this option" position="top">
                      <button
                        onClick={() => onAnalyze?.(pivot)}
                        className="flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-blue-400 hover:text-blue-600 transition-all text-[var(--text-muted)] group w-full"
                      >
                        <Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Analyze</span>
                      </button>
                    </Tooltip>
                    <Tooltip text={savedPivots.includes(pivot.idea_description) ? "Unsave this pivot" : "Save this pivot to your profile"} position="top">
                      <button
                        onClick={() => {
                          const title = pivot.idea_description;
                          if (savedPivots.includes(title)) {
                            onUnsave?.(title);
                            setSavedPivots(prev => prev.filter(t => t !== title));
                          } else {
                            onSave?.(pivot);
                            setSavedPivots(prev => [...prev, title]);
                          }
                        }}
                        className={cn(
                          "flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border transition-all group w-full",
                          savedPivots.includes(pivot.idea_description)
                            ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-inner"
                            : "border-[var(--border-color)] bg-[var(--bg-card)] hover:border-emerald-400 hover:text-emerald-600 text-[var(--text-muted)]"
                        )}
                      >
                        <Bookmark className={cn("h-4 w-4 transition-transform group-hover:scale-110", savedPivots.includes(pivot.idea_description) && "fill-current")} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">
                          {savedPivots.includes(pivot.idea_description) ? "Saved" : "Save"}
                        </span>
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </BaseCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
