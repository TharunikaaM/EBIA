import { useState } from 'react';
import BaseCard from './BaseCard';
import { cn } from '../../lib/cn';
import { ChevronDown } from 'lucide-react';

export default function InsightTile({ number, icon: Icon, title, lines, expandable = false, className }) {
  const [expandedIdx, setExpandedIdx] = useState(null);

  return (
    <BaseCard className={cn("p-4 border-l-4 border-l-blue-500", className)}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
          <Icon className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{title}</span>
        </div>
        <ul className="space-y-1.5">
          {lines.map((l, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-main)] font-medium leading-relaxed">
              <span className={cn(
                "mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0",
                title.toLowerCase().includes('risk') ? "bg-red-500" : "bg-blue-500"
              )} />
              <span>{l}</span>
            </li>
          ))}
        </ul>
      </div>
    </BaseCard>
  );
}
