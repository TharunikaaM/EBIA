import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Truck, Users, ArrowLeft, Shield, ShieldOff, Sparkles, Lightbulb, X, ChevronRight, ChevronLeft, Target, Wallet, Zap, Bookmark } from 'lucide-react';
import BaseCard from '../components/ui/BaseCard';
import BaseInput from '../components/ui/BaseInput';
import BaseButton from '../components/ui/BaseButton';
import IdeaCard from '../components/ui/IdeaCard';
import { cn } from '../lib/cn';

const iconByIndex = [Sprout, Truck, Users];

export default function GeneratedResultsPage({
  founderConstraints,
  setFounderConstraints,
  workspaceQuery,
  setWorkspaceQuery,
  ideas = [],
  onAnalyzeIdea,
  onRefineIdeas,
  onSaveIdea,
  onRegenerate,
}) {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(null);

  const nextIdea = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % Math.min(ideas.length, 3));
  };

  const prevIdea = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + Math.min(ideas.length, 3)) % Math.min(ideas.length, 3));
  };

  const currentIdea = selectedIndex !== null ? ideas[selectedIndex] : null;


  return (
    <div className="mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] hover:text-blue-500 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Configuration
          </button>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-main)] uppercase tracking-[0.1em]">Strategic Directions</h1>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-8">

        <div className="space-y-8">
          <BaseCard className="p-10 border-none shadow-2xl bg-[var(--bg-card)] relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                  <h2 className="text-3xl font-black text-[var(--text-main)] mb-2">3 High-Potential Ideas</h2>
                  <p className="text-[var(--text-muted)] font-bold text-sm">Strategic directions optimized for your entry capital and location.</p>
                </div>
                <div className="flex items-center gap-3">
                  <BaseButton
                    variant="outline"
                    onClick={onRegenerate}
                    className="h-12 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Generate More
                  </BaseButton>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                {(ideas || []).slice(0, 3).map((idea, idx) => (
                  <div key={idea.id || idea.title || idx} onClick={() => setSelectedIndex(idx)} className="cursor-pointer">
                    <IdeaCard
                      icon={iconByIndex[idx] || Sprout}
                      title={idea.title}
                      marketFit={idea.score || idea.market_fit}
                      bullets={idea.features || []}
                      mvpBudget={idea.budget || idea.mvp_budget}
                      targetAudience={idea.target_audience}
                      revenueModel={idea.revenue_model}
                      onAnalyze={(e) => {
                        e.stopPropagation();
                        onAnalyzeIdea(idea);
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-12 p-8 rounded-[2.5rem] bg-[var(--bg-main)]/50 border border-[var(--border-color)]">
                <div className="flex items-start gap-6">
                  <div className="p-4 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-[var(--text-main)] text-xl mb-3">FoundersCore Strategic Intelligence</h4>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed font-bold">
                      Based on current high-growth trends in <span className="text-blue-600 dark:text-blue-400 font-black">{founderConstraints.domain}</span>, these concepts are designed to minimize initial burn while maximizing user retention in <span className="text-[var(--text-main)] font-black text-blue-600">{founderConstraints.location}</span>. Select any idea to run a full evidence appraisal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      {/* Idea Detail Modal */}
      {currentIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl bg-[var(--bg-card)] rounded-[2.5rem] shadow-2xl border border-[var(--border-color)] overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors z-20"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
              {/* Left Bar - Navigation & Info */}
              <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-900/50 p-10 border-r border-[var(--border-color)] flex flex-col justify-between">
                <div>
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 mb-8">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Direction {selectedIndex + 1} of 3</h3>
                  <h2 className="text-2xl font-black text-[var(--text-main)] leading-tight mb-6">{currentIdea.title}</h2>

                  <div className="space-y-6 pt-6 border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Market Fit</div>
                        <div className="text-sm font-black text-emerald-600">{currentIdea.market_fit || currentIdea.score}% Score</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Est. Budget</div>
                        <div className="text-sm font-black text-[var(--text-main)]">{currentIdea.mvp_budget || currentIdea.budget}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-10">
                  <button onClick={prevIdea} className="flex-1 h-12 rounded-xl border border-[var(--border-color)] flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={nextIdea} className="flex-1 h-12 rounded-xl border border-[var(--border-color)] flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Right Side - Detailed Content */}
              <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                <div className="max-w-xl">
                  <div className="mb-10">
                    <h4 className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      Concept Explanation
                    </h4>
                    <p className="text-lg font-bold text-[var(--text-main)] leading-relaxed">
                      {currentIdea.description || "A strategic business model designed to leverage existing market efficiencies in your chosen domain and location."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div>
                      <h5 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 opacity-60">Target Audience</h5>
                      <p className="text-sm font-bold text-[var(--text-main)]">{currentIdea.target_audience}</p>
                    </div>
                    <div>
                      <h5 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 opacity-60">Revenue Model</h5>
                      <p className="text-sm font-bold text-blue-600">{currentIdea.revenue_model}</p>
                    </div>
                  </div>

                  <div className="mb-10">
                    <h5 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 opacity-60">Key Structural Features</h5>
                    <div className="grid grid-cols-1 gap-3">
                      {(currentIdea.features || currentIdea.bullets || []).map((f, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                          <div className="h-2 w-2 rounded-full bg-blue-600" />
                          <span className="text-xs font-black text-[var(--text-main)]">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <BaseButton
                      onClick={() => onAnalyzeIdea(currentIdea)}
                      className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/20"
                    >
                      Start Analysis
                    </BaseButton>
                    <BaseButton
                      variant="secondary"
                      onClick={() => {
                        onSaveIdea?.(currentIdea);
                        setSelectedIndex(null);
                      }}
                      className="flex-1 h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                    >
                      <Bookmark className="h-4 w-4 text-blue-600" />
                      Save for Later
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

