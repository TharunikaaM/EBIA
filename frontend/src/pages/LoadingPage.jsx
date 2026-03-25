import { useState, useEffect } from 'react';
import { BrainCircuit, CheckCircle2, Circle, Loader2, ShieldCheck, Database, BarChart3, Sparkles, Lightbulb } from 'lucide-react';
import BaseCard from '../components/ui/BaseCard';
import { cn } from '../lib/cn';

// These labels MUST exactly match the status strings set by update_task_status() in idea_service.py
const ANALYZE_STEPS = [
  { label: 'Performing Ethical Safety Check', icon: ShieldCheck },
  { label: 'Retrieving Market Evidence', icon: Database },
  { label: 'Analyzing Market Patterns', icon: BarChart3 },
  { label: 'Synthesizing Strategic Insights', icon: Sparkles },
];

const GENERATE_STEPS = [
  { label: 'Understanding your request', icon: ShieldCheck },
  { label: 'Scanning industry opportunities', icon: Database },
  { label: 'Generating concept ideas', icon: Lightbulb },
  { label: 'Finalizing your suggestions', icon: Sparkles },
];

function getActiveIndex(message, steps) {
  if (!message) return 0;
  // Strip trailing ellipsis (… or ...) added by the polling logic in App.jsx
  const cleaned = message.replace(/[…\.]+$/, '').trim().toLowerCase();
  // Try exact match first
  const exactIdx = steps.findIndex((s) => s.label.toLowerCase() === cleaned);
  if (exactIdx >= 0) return exactIdx;
  // Fallback: partial match on first 2 words
  const partialIdx = steps.findIndex((s) =>
    cleaned.includes(s.label.toLowerCase().split(' ').slice(0, 2).join(' '))
  );
  return partialIdx >= 0 ? partialIdx : 0;
}

export default function LoadingPage({ message = 'Scanning market signals…', mode = 'analyze', onComplete }) {
  const steps = mode === 'generate' ? GENERATE_STEPS : ANALYZE_STEPS;
  const targetIdx = getActiveIndex(message, steps);
  const [uiIdx, setUiIdx] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // If backend reports completion (message is empty or results ready), jump to end
    if (message === 'COMPLETED') {
      const itv = setInterval(() => {
        setUiIdx(prev => {
          if (prev < steps.length - 1) return prev + 1;
          clearInterval(itv);
          setIsFinished(true);
          return prev;
        });
      }, 800);
      return () => clearInterval(itv);
    }

    // Otherwise, move uiIdx towards targetIdx sequentially
    if (uiIdx < targetIdx) {
      const timer = setTimeout(() => {
        setUiIdx(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [targetIdx, uiIdx, steps.length, message]);

  useEffect(() => {
    if (isFinished && onComplete) {
      onComplete();
    }
  }, [isFinished, onComplete]);

  const activeIdx = uiIdx;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <BaseCard className="p-10">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full ring-2 ring-blue-600/15" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-blue-600">
              <BrainCircuit className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-6 text-base font-semibold text-slate-900 dark:text-white">
            {mode === 'generate' ? "Generating your ideas..." : "Analyzing your idea..."}
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)] font-medium">
            {mode === 'generate' ? "Scouting the best opportunities for you" : "Getting everything ready for your business plan"}
          </p>
        </div>

        {/* Pipeline Steps */}
        <div className="mx-auto max-w-md space-y-0">
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            const isCompleted = i < activeIdx;
            const isActive = i === activeIdx;
            const isPending = i > activeIdx;

            return (
              <div key={step.label} className="flex items-stretch gap-4">
                {/* Vertical connector line + icon */}
                <div className="flex flex-col items-center w-8">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500",
                      isCompleted && "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600",
                      isActive && "bg-blue-100 dark:bg-blue-900/40 text-blue-600 ring-2 ring-blue-500/30 shadow-md shadow-blue-500/10",
                      isPending && "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isActive ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                  </div>
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 flex-1 min-h-[20px] transition-all duration-500",
                        i < activeIdx ? "bg-emerald-300 dark:bg-emerald-700" : "bg-slate-200 dark:bg-slate-700"
                      )}
                    />
                  )}
                </div>

                {/* Label */}
                <div className={cn(
                  "flex items-center gap-3 pb-5 transition-all duration-500",
                  isCompleted && "opacity-60",
                  isActive && "opacity-100",
                  isPending && "opacity-40"
                )}>
                  <StepIcon className={cn(
                    "h-4 w-4 flex-shrink-0",
                    isCompleted && "text-emerald-600",
                    isActive && "text-blue-600",
                    isPending && "text-slate-400"
                  )} />
                  <span className={cn(
                    "text-sm font-semibold transition-all",
                    isCompleted && "text-emerald-700 dark:text-emerald-400 line-through decoration-emerald-400/40",
                    isActive && "text-blue-700 dark:text-blue-300",
                    isPending && "text-slate-400 dark:text-slate-500"
                  )}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </BaseCard>
    </div>
  );
}
