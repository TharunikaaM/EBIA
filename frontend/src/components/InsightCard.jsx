import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const InsightCard = ({ title, items = [], icon, accentColor = 'text-blue-400', badgeColor = 'bg-blue-500/10' }) => {
  return (
    <div className="glass rounded-[24px] p-6 flex flex-col h-full border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-xl ${badgeColor} ${accentColor} border border-white/5`}>
          {icon}
        </div>
        <h3 className="font-black text-white text-lg brand-font tracking-tight">{title}</h3>
      </div>
      <ul className="grid grid-cols-1 gap-4 flex-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 group">
            <div className={`mt-2 w-1 h-1 rounded-full ${accentColor} shadow-[0_0_8px_currentColor] flex-shrink-0 animate-pulse`} />
            <span className="text-sm text-slate-300 leading-relaxed font-medium group-hover:text-white transition-colors">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InsightCard;
