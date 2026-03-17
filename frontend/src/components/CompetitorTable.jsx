import React from 'react';
import { TrendingUp, Zap, ChevronRight } from 'lucide-react';

const CompetitorTable = ({ competitors = [] }) => {
  if (!competitors.length) return null;

  return (
    <div className="glass rounded-[24px] border-white/5 p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-slate-400">
          <TrendingUp size={18} />
        </div>
        <div>
          <h3 className="text-lg font-black text-white brand-font tracking-tight uppercase">Landscape</h3>
          <p className="text-[9px] font-black text-slate-500 tracking-[0.2em] uppercase">{competitors.length} Rival Entities</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {competitors.map((comp, idx) => (
          <div key={idx} className="group glass-hover rounded-[16px] p-4 border border-white/5 hover:border-white/10 bg-white/[0.01] transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                 <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[9px] font-black text-blue-400">
                   {idx + 1}
                 </div>
                 <span className="font-black text-white text-base brand-font transition-colors group-hover:text-blue-400">
                   {comp.name}
                 </span>
              </div>
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-black px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                Strategic
              </span>
            </div>
            {comp.strategic_impact && (
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{comp.strategic_impact}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetitorTable;
