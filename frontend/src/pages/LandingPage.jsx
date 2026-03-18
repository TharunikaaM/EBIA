import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Globe, Wallet, BriefcaseBusiness, Shield, ShieldOff, Lightbulb, Search } from 'lucide-react';
import BaseCard from '../components/ui/BaseCard';
import BaseButton from '../components/ui/BaseButton';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import SelectorRow from '../components/ui/SelectorRow';
import { cn } from '../lib/cn';

export default function LandingPage({
  ideaInput,
  setIdeaInput,
  mode,
  setMode,
  isPrivate,
  setIsPrivate,
  domain,
  setDomain,
  location,
  setLocation,
  budget,
  setBudget,
  businessModel,
  setBusinessModel,
  onPrimaryAction,
}) {
  const navigate = useNavigate();

  const isGenerateDisabled = mode === 'generate' && (!domain.trim() || !location.trim() || !budget.trim());
  const isAnalyzeDisabled = mode === 'analyze' && ideaInput.trim().length < 10;

  // Smart Logic: Gray out Location if it's a SaaS/App
  const isDigitalIdea = ideaInput.toLowerCase().includes('saas') ||
    ideaInput.toLowerCase().includes('app') ||
    ideaInput.toLowerCase().includes('platform') ||
    ideaInput.toLowerCase().includes('software');

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:py-12">
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-main)] mb-4">
          Your business idea, refined with evidence.
        </h1>
        <p className="text-base text-[var(--text-muted)] max-w-2xl mx-auto font-normal leading-relaxed">
          FoundersCore transforms your strategy with data-backed intelligence and guided growth for local shops and digital products alike.
        </p>
      </div>

      <div className="mx-auto max-w-4xl space-y-8">
        {/* Toggle View */}
        <div className="flex p-1 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm max-w-xl mx-auto">
          <button
            onClick={() => setMode('analyze')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-xs uppercase tracking-widest transition-all",
              mode === 'analyze' 
                ? "bg-[var(--color-primary)] text-white shadow-md" 
                : "text-[var(--text-muted)] hover:text-[var(--color-primary)]"
            )}
          >
            <Search className="h-3.5 w-3.5" />
            Analyze My Idea
          </button>
          <button
            onClick={() => setMode('generate')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-xs uppercase tracking-widest transition-all",
              mode === 'generate' 
                ? "bg-[var(--color-primary)] text-white shadow-md" 
                : "text-[var(--text-muted)] hover:text-[var(--color-primary)]"
            )}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            Generate New Idea
          </button>
        </div>

        <div className="rounded-[2rem] p-8 md:p-12 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl shadow-blue-500/5">
          {mode === 'analyze' ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider ml-1">
                  Idea Description
                </label>
                
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2 rounded-xl border transition-all font-semibold text-xs uppercase tracking-wide",
                    isPrivate 
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-lg" 
                      : "bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  )}
                >
                  {isPrivate ? <Shield className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
                  {isPrivate ? "Private" : "Public"}
                </button>
              </div>
              
              <div className="relative group">
                <textarea
                  value={ideaInput}
                  onChange={(e) => setIdeaInput(e.target.value)}
                  placeholder="Describe a market gap or problem... (e.g., 'A specialty coffee shop in Mumbai' or 'A SaaS for plant disease diagnosis')."
                  className="w-full resize-none rounded-2xl bg-[var(--bg-main)] p-8 text-base font-normal text-[var(--text-main)] placeholder:text-[var(--text-muted)] border-2 border-[var(--border-color)] focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-[var(--color-primary)] min-h-64 transition-all duration-300 shadow-inner"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-10 text-center">
              <div>
                <label className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-widest">
                  Configure Parameters
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <SelectorRow
                  icon={Sparkles}
                  label="Target Domain"
                  value={domain}
                  onChange={setDomain}
                  placeholder="e.g. Agri-Tech"
                />
                <SelectorRow
                  icon={Globe}
                  label="Preferred Location"
                  value={location}
                  onChange={setLocation}
                  placeholder="e.g. Singapore"
                />
                <SelectorRow
                  icon={Wallet}
                  label="Capital Budget"
                  value={budget}
                  onChange={setBudget}
                  placeholder="e.g. $50,000"
                />
              </div>
            </div>
          )}

          <div className="mt-12 flex justify-center">
            <BaseButton
              size="lg"
              className="px-20 h-16 text-sm uppercase tracking-[0.2em] font-bold rounded-2xl bg-[var(--color-primary)] hover:scale-[1.02] active:scale-95 shadow-2xl shadow-blue-500/20 transition-all duration-300"
              disabled={mode === 'analyze' ? isAnalyzeDisabled : isGenerateDisabled}
              onClick={onPrimaryAction}
            >
              {mode === 'analyze' ? 'Analyze Now' : 'Generate Strategy'}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  );
}

