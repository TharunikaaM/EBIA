import { cn } from '../../lib/cn';

export default function BaseCard({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all duration-200',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

