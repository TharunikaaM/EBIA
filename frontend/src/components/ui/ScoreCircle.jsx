export default function ScoreCircle({ score }) {
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  const r = 54;
  const c = 2 * Math.PI * r;
  const dash = (s / 100) * c;
  
  // Dynamic color based on score
  const color = s >= 80 ? '#10B981' : s >= 60 ? '#3B82F6' : '#F59E0B';

  return (
    <div className="flex items-center gap-8">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 140 140" className="h-36 w-36 drop-shadow-sm">
          <circle 
            cx="70" 
            cy="70" 
            r={r} 
            stroke="currentColor" 
            className="text-slate-200 dark:text-slate-800" 
            strokeWidth="16" 
            fill="none" 
          />
          <circle
            cx="70"
            cy="70"
            r={r}
            stroke={color}
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            transform="rotate(-90 70 70)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-[var(--text-main)]">{s}</div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Score</div>
        </div>
      </div>
      <div>
        <div className="text-xl font-bold text-[var(--text-main)]">
          {s >= 80 ? 'Exceptional' : s >= 60 ? 'Strong Potential' : 'Needs Refinement'}
        </div>
        <div className="text-sm text-[var(--text-muted)] mt-1">Based on market signals</div>
      </div>
    </div>
  );
}
