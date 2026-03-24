import { Sparkles, Zap, Wallet, Bookmark, ArrowLeft, Lightbulb } from 'lucide-react';
import { cn } from '../../lib/cn';
import BaseButton from './BaseButton';
import Tooltip from './Tooltip';

export default function ConceptPreview({ concept, onAnalyze, onSave, onUnsave, isSaved, onBack }) {
  if (!concept) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[9px] font-bold uppercase tracking-widest border border-blue-500/20">
          <Sparkles className="h-3 w-3" />
          Quick Idea Summary
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="md:col-span-8 space-y-8">
          <div>
            <h2 className="text-3xl font-black text-[var(--text-main)] leading-tight mb-4">{concept.title || "Concept Direction"}</h2>
            <p className="text-lg font-bold text-[var(--text-main)] leading-relaxed opacity-90">
              {concept.description || concept.idea_description || "A strategic business model designed to leverage existing market efficiencies in your chosen domain and location."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]">
              <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 opacity-60">Who is this for?</div>
              <p className="text-xs font-bold text-[var(--text-main)]">{concept.target_audience || "General Market"}</p>
            </div>
            <div className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]">
              <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 opacity-60">How will it make money?</div>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{concept.revenue_model || "Subscription/Service"}</p>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 opacity-60 flex items-center gap-2">
              <Lightbulb className="h-3.5 w-3.5" />
              Key idea highlights
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {(() => {
                const raw = concept.features || concept.bullets || concept.strategic_advantage;
                const list = Array.isArray(raw) ? raw : (typeof raw === 'string' ? [raw] : []);
                
                if (list.length === 0) {
                  return <p className="text-xs text-[var(--text-muted)] italic">Strategic details will be expanded during full analysis.</p>;
                }

                return list.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] group hover:border-blue-500 transition-colors shadow-sm dark:shadow-none">
                    <div className="h-2 w-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                    <span className="text-[11px] font-black text-[var(--text-main)]">{typeof f === 'string' ? f : (f.title || f.description || `Feature ${i + 1}`)}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Sidebar Info & Action */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="p-6 rounded-3xl bg-[var(--bg-main)] border border-[var(--border-color)] shadow-sm">
            <div className="space-y-3">
              <BaseButton
                onClick={() => onAnalyze(concept)}
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/20"
              >
                Analyze
              </BaseButton>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/10">
            <h5 className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-[0.1em] mb-2 flex items-center gap-2">
              <Lightbulb className="h-3 w-3" />
              Advisor Note
            </h5>
            <p className="text-[10px] font-bold text-[var(--text-main)] leading-relaxed">
              This will take about 30 seconds.
              <br /><br />
              We’ll check market trends, risks, and give you clear suggestions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
