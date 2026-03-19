import { useNavigate } from 'react-router-dom';
import { Sprout, Truck, Users, ArrowLeft, Shield, ShieldOff, Sparkles, Lightbulb } from 'lucide-react';
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
  ideas,
  onAnalyzeIdea,
  onRefineIdeas,
  onRegenerate,
  isPrivate,
  setIsPrivate,
}) {
  const navigate = useNavigate();

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

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPrivate?.(!isPrivate)}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all font-bold text-sm shadow-sm",
              isPrivate
                ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                : "bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-blue-500"
            )}
          >
            {isPrivate ? (
              <>
                <Shield className="h-4 w-4" />
                <span>Private Mode ON</span>
              </>
            ) : (
              <>
                <ShieldOff className="h-4 w-4" />
                <span>Private Mode OFF</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <BaseCard className="p-8 bg-[var(--bg-card)] border-[var(--border-color)]">
            <h3 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.2em] mb-8 pb-4 border-b border-[var(--border-color)]">Founder Constraints</h3>
            <div className="space-y-6">
              <div className="transition-all hover:translate-x-1">
                <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5 opacity-60">Industry Domain</div>
                <div className="text-sm font-black text-blue-600 dark:text-blue-400">{founderConstraints.domain}</div>
              </div>
              <div className="transition-all hover:translate-x-1">
                <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5 opacity-60">Target Location</div>
                <div className="text-sm font-black text-[var(--text-main)]">{founderConstraints.location}</div>
              </div>
              <div className="transition-all hover:translate-x-1">
                <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5 opacity-60">Budget Depth</div>
                <div className="text-sm font-black text-[var(--text-main)]">{founderConstraints.budget}</div>
              </div>
            </div>
          </BaseCard>

          <BaseCard className="p-8 bg-blue-600 border-none text-white shadow-xl shadow-blue-500/20">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-md">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black mb-4">Refine Parameters</h3>
            <p className="text-blue-100 text-xs font-bold mb-8 leading-relaxed opacity-90">
              Need a pivot or more specific focus? Adjust your constraints to find a precisely tailored market opportunity.
            </p>
            <BaseButton variant="secondary" className="w-full h-14 bg-white !text-blue-600 font-black rounded-2xl shadow-lg border-none uppercase tracking-widest text-[10px]" onClick={onRefineIdeas}>
              Refine Search
            </BaseButton>
          </BaseCard>
        </div>

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
                  <IdeaCard
                    key={idea.id || idea.title || idx}
                    icon={iconByIndex[idx] || Sprout}
                    title={idea.title}
                    marketFit={idea.score || idea.market_fit}
                    bullets={idea.features || []}
                    mvpBudget={idea.budget || idea.mvp_budget}
                    targetAudience={idea.target_audience}
                    revenueModel={idea.revenue_model}
                    onAnalyze={() => onAnalyzeIdea(idea)}
                  />
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
    </div>
  );
}

