import { cn } from '../../lib/cn';

export default function MetricBar({ label, value, className }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
        <span>{label}</span>
        <span className="text-slate-700">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-emerald-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

