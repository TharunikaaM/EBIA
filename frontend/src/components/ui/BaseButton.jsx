import { cn } from '../../lib/cn';

const styles = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_12px_22px_-14px_rgba(37,99,235,0.55)]',
  secondary:
    'bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-slate-200 shadow-sm',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100/70',
};

const sizes = {
  md: 'h-10 px-5 text-sm font-semibold rounded-xl',
  lg: 'h-11 px-7 text-sm font-semibold rounded-xl',
};

export default function BaseButton({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  children,
  ...props
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 disabled:cursor-not-allowed disabled:opacity-50',
        sizes[size],
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

