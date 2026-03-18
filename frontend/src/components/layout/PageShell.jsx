import { cn } from '../../lib/cn';

export default function PageShell({ className, children }) {
  return (
    <div className={cn('min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300', className)}>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_500px_at_20%_10%,rgba(37,99,235,0.10),transparent_60%),radial-gradient(900px_450px_at_80%_0%,rgba(30,58,138,0.10),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_10%_20%,rgba(15,23,42,1)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>
      {children}
    </div>
  );
}

