import { cn } from '../../lib/cn';

export default function BaseInput({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xl bg-[var(--bg-input)] px-4 text-base font-medium text-[var(--text-input)] placeholder:text-[var(--text-muted)] border border-[var(--border-input)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-colors duration-300',
        className,
      )}
      {...props}
    />
  );
}

