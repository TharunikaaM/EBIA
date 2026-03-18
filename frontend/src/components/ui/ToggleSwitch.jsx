import { cn } from '../../lib/cn';

export default function ToggleSwitch({ checked, onChange, className, label }) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {label ? (
        <div className="text-sm font-medium text-slate-600">{label}</div>
      ) : null}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-blue-600' : 'bg-slate-200',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-5 left-0.5' : 'translate-x-0 left-0.5',
          )}
        />
      </button>
    </div>
  );
}

