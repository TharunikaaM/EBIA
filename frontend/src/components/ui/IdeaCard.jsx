import BaseCard from './BaseCard';
import BaseButton from './BaseButton';

export default function IdeaCard({
  icon: Icon,
  title,
  marketFit,
  bullets = [],
  mvpBudget,
  onAnalyze,
}) {
  return (
    <BaseCard className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {Icon ? (
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)]">
              <Icon className="h-5 w-5" />
            </div>
          ) : null}
          <div className="text-base font-bold text-[var(--text-main)] leading-snug">
            {title}
          </div>
          <div className="mt-2 inline-flex items-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            {marketFit}% <span className="ml-1 opacity-70">Market Fit</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Key Differentiators</div>
      <ul className="mt-2 space-y-2 text-sm text-[var(--text-main)]">
        {bullets.slice(0, 4).map((b) => (
          <li key={b} className="flex items-start gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
            <span className="leading-snug font-normal">{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="text-sm text-[var(--text-main)]">
          <span className="text-[var(--text-muted)] font-medium">Budget:</span>{' '}
          <span className="text-sm font-bold text-[var(--text-main)]">
            {mvpBudget}
          </span>
        </div>
        <BaseButton onClick={onAnalyze} className="min-w-24 font-bold text-xs uppercase tracking-wider h-11">
          Analyze
        </BaseButton>
      </div>
    </BaseCard>
  );
}

