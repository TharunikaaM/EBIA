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
  isPrivate,
  setIsPrivate,
}) {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </button>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-main)] uppercase">Potential Directions</h1>
        </div>


      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <BaseCard className="p-8">
            <h3 className="text-sm font-semibold text-[var(--text-main)] uppercase tracking-widest mb-6">Founder Constraints</h3>
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                <div className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-widest mb-1">Budget</div>
                <div className="text-sm font-bold text-[var(--color-primary)]">{founderConstraints.budget}</div>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                <div className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-widest mb-1">Target Location</div>
                <div className="text-sm font-bold text-[var(--color-primary)]">{founderConstraints.location}</div>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                <div className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-widest mb-1">Industry Domain</div>
                <div className="text-sm font-bold text-[var(--color-primary)]">{founderConstraints.domain}</div>
              </div>
            </div>
          </BaseCard>

          <BaseCard className="p-8 bg-blue-600 border-none text-white">
            <h3 className="text-lg font-bold mb-4">Refine Search</h3>
            <p className="text-blue-100 text-xs font-medium mb-6 leading-relaxed">
              Not seeing the perfect fit? Adjust your constraints or describe a more specific problem.
            </p>
            <BaseButton variant="secondary" className="w-full h-12 bg-white text-blue-600 font-bold rounded-xl" onClick={onRefineIdeas}>
              Refine Ideas
            </BaseButton>
          </BaseCard>
        </div>

        <div className="space-y-8">
          <BaseCard className="p-10 border-none shadow-2xl bg-[var(--bg-card)] relative overflow-hidden">


            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                  <h2 className="text-3xl font-black text-[var(--text-main)] mb-2">3 Potential Directions</h2>
                  <p className="text-[var(--text-muted)] font-medium">Strategic roadmap options based on your unique constraints.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-sm">
                    Budget Feasible
                  </span>
                  <span className="px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold shadow-sm">
                    2-5 Months MVP
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(ideas || []).slice(0, 3).map((idea, idx) => (
                  <IdeaCard
                    key={idea.id || idea.title || idx}
                    icon={iconByIndex[idx] || Sprout}
                    title={idea.title}
                    marketFit={idea.market_fit}
                    bullets={idea.features || []}
                    mvpBudget={idea.mvp_budget}
                    onAnalyze={() => onAnalyzeIdea(idea)}
                  />
                ))}
              </div>

              <div className="mt-12 p-8 rounded-3xl bg-white dark:bg-slate-950 border border-[var(--border-color)] shadow-inner">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--text-main)]">Expert Strategy Review</h4>
                    <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
                      These directions leverage High AI & IoT penetration in the {founderConstraints.domain} space, specifically catering to urban farming demands while staying within a {founderConstraints.budget} development cycle.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>

          <div className="p-1 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl">
            <div className="px-8 py-5 text-center text-sm font-bold text-white uppercase tracking-widest">
              Select an idea above to run deep evaluation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

