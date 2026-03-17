import React, { useState } from 'react';
import { Lightbulb, DollarSign, TrendingUp, ChevronRight, Loader2, ArrowRight } from 'lucide-react';

const PivotPanel = ({ originalIdea, pivots = [], isLoading, onPivotRequest }) => {
  const [hasRequested, setHasRequested] = useState(false);

  const handleRequest = () => {
    setHasRequested(true);
    onPivotRequest();
  };

  if (!hasRequested && pivots.length === 0) {
    return (
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[26px] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative glass rounded-[24px] p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-white/10">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-blue-500/10 rounded-xl flex-shrink-0 border border-blue-500/20 text-blue-400">
              <Lightbulb size={24} />
            </div>
            <div>
              <h3 className="font-black text-white text-lg brand-font mb-1">Evolution</h3>
              <p className="text-slate-400 font-medium text-xs">Generate 3 evidence-backed pivots with financial modeling.</p>
            </div>
          </div>
          <button
            onClick={handleRequest}
            className="flex items-center gap-2 bg-white text-black font-black rounded-xl px-8 py-4 text-xs transition-all duration-300 hover:scale-[1.02] active:scale-95 whitespace-nowrap uppercase tracking-wider"
          >
            Explore Paths <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass rounded-[24px] p-12 flex flex-col items-center justify-center gap-4 border-blue-500/20">
        <Loader2 size={32} className="text-blue-500 animate-spin" />
        <p className="text-white font-black text-base brand-font uppercase tracking-widest text-center">Processing Signals</p>
      </div>
    );
  }

  if (!isLoading && pivots.length > 0) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-blue-500 rounded-full" />
            <h3 className="text-xl font-black text-white brand-font tracking-tight uppercase">Alternatives</h3>
          </div>
          <span className="text-[9px] font-black text-blue-400 border border-blue-500/20 bg-blue-500/10 rounded-full px-3 py-1 uppercase tracking-widest">
            {pivots.length} Paths Optimized
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pivots.map((pivot, index) => (
            <div
              key={index}
              className="glass rounded-[24px] border-white/5 overflow-hidden glass-hover group flex flex-col h-full"
            >
              <div className="h-1 bg-blue-600 opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest">
                    PATH 0{index + 1}
                  </span>
                </div>

                <h4 className="text-white font-bold text-base leading-tight mb-4 brand-font group-hover:text-blue-400 transition-colors">
                  {pivot.idea_description}
                </h4>

                {pivot.strategic_advantage && (
                  <div className="mb-6 p-3 bg-white/[0.03] rounded-xl border border-white/5">
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">
                      "{pivot.strategic_advantage}"
                    </p>
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                      <p className="text-[7px] font-black text-slate-500 uppercase mb-0.5">MVP</p>
                      <p className="text-xs font-black text-emerald-400">{pivot.budget_details?.mvp_budget || 'N/A'}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                      <p className="text-[7px] font-black text-slate-500 uppercase mb-0.5">SCALE</p>
                      <p className="text-xs font-black text-blue-400">{pivot.budget_details?.scaling_budget || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default PivotPanel;
