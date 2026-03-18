import BaseCard from './BaseCard';

export default function InsightTile({ number, icon: Icon, title, lines }) {
  return (
    <BaseCard className="p-6 border-l-4 border-l-blue-500">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">
            <Icon className="h-4 w-4" />
            {title}
          </div>
          <ul className="space-y-2">
            {lines.map((l, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-main)] font-medium leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </BaseCard>
  );
}
