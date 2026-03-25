import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Globe, Wallet, BriefcaseBusiness, Shield, ShieldOff, Lightbulb, Search, Users } from 'lucide-react';
import BaseCard from '../components/ui/BaseCard';
import BaseButton from '../components/ui/BaseButton';
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
  onPrimaryAction,
  genStep,
  setGenStep,
  genType,
  setGenType,
}) {
  const isAnalyzeDisabled = mode === 'analyze' && ideaInput.trim().length < 100;

  return (
    <div className="mx-auto max-w-7xl px-6 py-4 md:py-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-[var(--text-main)] mb-4">
          Turn Your Idea Into a <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Business Plan</span>
        </h1>
        <p className="text-sm md:text-base text-[var(--text-muted)] max-w-2xl mx-auto font-medium leading-relaxed opacity-90">
          Get instant feedback and discover better ideas in seconds.
        </p>
      </div>

      <div className="mx-auto max-w-4xl space-y-5">
        {/* Main Tab Toggle */}
        <div className="flex p-1 rounded-2xl bg-[var(--border-color)] dark:bg-slate-800/50 border border-[var(--border-color)] shadow-inner max-w-lg mx-auto mb-6">
          <button
            onClick={() => setMode('analyze')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300",
              mode === 'analyze'
                ? "bg-[var(--bg-card)] text-blue-600 shadow-md scale-[1.02]"
                : "text-[var(--text-muted)] hover:text-blue-500"
            )}
          >
            <Search className="h-4 w-4" />
            Analyze My Idea
          </button>
          <button
            onClick={() => {
              setMode('generate');
              setGenStep(1);
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300",
              mode === 'generate'
                ? "bg-[var(--bg-card)] text-blue-600 shadow-md scale-[1.02]"
                : "text-[var(--text-muted)] hover:text-blue-500"
            )}
          >
            <Lightbulb className="h-4 w-4" />
            Give Me Ideas
          </button>
        </div>

        <div className="rounded-3xl p-5 md:p-8 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl shadow-blue-500/5 relative overflow-hidden">
          {mode === 'analyze' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <label className="text-[10px] font-bold text-[var(--text-main)] uppercase tracking-widest">
                    Explain your idea in simple words
                  </label>
                </div>

                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all font-bold text-[9px] uppercase tracking-widest shadow-sm",
                    isPrivate
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/10"
                      : "bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-blue-500"
                  )}
                >
                  {isPrivate ? <Shield className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
                  {isPrivate ? "Private Mode ON" : "Private Mode OFF"}
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={ideaInput}
                  onChange={(e) => setIdeaInput(e.target.value)}
                  placeholder="Explain your idea in simple words (what, who, and how)"
                  className="w-full resize-none rounded-xl bg-[var(--bg-main)] p-5 text-sm md:text-base font-medium text-[var(--text-main)] placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-40 transition-all duration-300"
                />

                {/* Input Strength Meter */}
                {(() => {
                  const len = ideaInput.length;
                  const pct = Math.min(100, (len / 300) * 100);
                  const color = len === 0 ? 'bg-slate-200 dark:bg-slate-700' : len < 100 ? 'bg-red-500' : len <= 300 ? 'bg-emerald-500' : 'bg-amber-500';
                  const textColor = len === 0 ? 'text-slate-400' : len < 100 ? 'text-red-500' : len <= 300 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400';
                  const label = len < 100 ? 'Explain a bit more (minimum 100 characters)' : len < 150 ? 'Almost there (150+ is perfect)' : len <= 300 ? 'Perfect length!' : 'Try to keep it short and clear';
                  return (
                    <div className="mt-3 space-y-1.5">
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-300", color)} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", textColor)}>
                          {len > 0 ? label : 'Explain your idea…'}
                        </span>
                        <span className={cn("text-[10px] font-bold tabular-nums", textColor)}>
                          {len} / 300
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] font-medium opacity-70">
                        Best results when you write a detailed 2–3 sentences describing your idea.
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {genStep === 1 ? (
                <div className="text-center space-y-5 animate-in fade-in zoom-in-95 duration-500">
                  <div className="space-y-1">
                    <h3 className="text-lg md:text-xl font-black text-[var(--text-main)]">What type of business do you want to start?</h3>
                    <p className="text-xs text-[var(--text-muted)] font-medium">Select an option to get better suggestions.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                    <button
                      onClick={() => { setGenType('SaaS'); setGenStep(2); }}
                      className="group p-5 rounded-2xl border border-[var(--border-color)] hover:border-blue-500 transition-all bg-[var(--bg-main)]/50 text-left"
                    >
                      <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div className="font-bold text-base text-[var(--text-main)] tracking-tight">Online / App-based Idea</div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1 leading-relaxed">Software, mobile apps, or websites you can use anywhere.</p>
                    </button>

                    <button
                      onClick={() => { setGenType('Non-SaaS'); setGenStep(2); }}
                      className="group p-5 rounded-2xl border border-[var(--border-color)] hover:border-blue-500 transition-all bg-[var(--bg-main)]/50 text-left"
                    >
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <BriefcaseBusiness className="h-4 w-4" />
                      </div>
                      <div className="font-bold text-base text-[var(--text-main)] tracking-tight">Local / Physical Business</div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1 leading-relaxed">Shops, local services, or physical products in a specific place.</p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center gap-3 mb-1">
                    <button
                      onClick={() => setGenStep(1)}
                      className="p-1.5 rounded-lg bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-blue-600 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                      <h3 className="text-base font-black text-[var(--text-main)]">Refine your {genType} focus</h3>
                      <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Step 2 of 2</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--bg-main)]/30 p-5 rounded-xl border border-[var(--border-color)]">
                    {genType === 'SaaS' ? (
                      <>
                        <SelectorRow
                          label="Domain"
                          placeholder="e.g. Fintech, Edtech..."
                          value={domain}
                          onChange={setDomain}
                          tooltip="Select your target industry or technology space."
                        />
                        <SelectorRow
                          label="Target Users"
                          placeholder="e.g. Freelancers, SMEs..."
                          value={location}
                          onChange={setLocation}
                          tooltip="Who is this product designed for?"
                        />
                        <SelectorRow
                          label="Core Problem"
                          placeholder="What gap are you filling?"
                          value={budget}
                          onChange={setBudget}
                          tooltip="Briefly describe the main problem you want to solve."
                        />
                      </>
                    ) : (
                      <>
                        <SelectorRow
                          label="Industry"
                          placeholder="e.g. F&B, Logistics..."
                          value={domain}
                          onChange={setDomain}
                          tooltip="Type of physical or local business."
                        />
                        <SelectorRow
                          label="Location"
                          placeholder="e.g. Chennai, Mumbai..."
                          value={location}
                          onChange={setLocation}
                          tooltip="Where will your business be physically located?"
                        />
                        <SelectorRow
                          label="Budget Range"
                          placeholder="e.g. 5-10 Lakhs..."
                          value={budget}
                          onChange={setBudget}
                          tooltip="What's your estimated starting capital?"
                        />
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {(mode === 'analyze' || genStep !== 1) && (
            <div className="mt-6 flex justify-end">
              <BaseButton
                onClick={onPrimaryAction}
                disabled={mode === 'analyze' ? isAnalyzeDisabled : false}
                className={cn(
                  "min-w-40 h-11 rounded-lg shadow-lg font-black text-[10px] uppercase tracking-widest transition-all",
                  mode === 'analyze'
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                )}
              >
                {mode === 'analyze' ? "Analyze My Idea" : "Give Me Ideas"}
              </BaseButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
