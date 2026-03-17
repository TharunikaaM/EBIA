import React from 'react';
import {
  BrainCircuit, AlertTriangle, User, Search, TrendingUp,
  CheckCircle2, XCircle, Sparkles, ChevronRight
} from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import InsightCard from './InsightCard';
import CompetitorTable from './CompetitorTable';
import PivotPanel from './PivotPanel';

const AnalyticsDashboard = ({ data, evaluationId, pivotData, isPivoting, onPivotRequest, onReset }) => {
  const [activeTab, setActiveTab] = React.useState('trends');

  if (!data) return null;

  if (data.status === 'refusal') {
    return (
      <div className="max-w-xl mx-auto glass rounded-[24px] border-rose-500/20 p-8 text-center animate-in zoom-in duration-300">
        <div className="inline-flex p-4 bg-rose-500/10 rounded-xl mb-6 border border-rose-500/20">
          <AlertTriangle size={32} className="text-rose-500" />
        </div>
        <h3 className="text-2xl font-black text-white mb-3 brand-font">Refused</h3>
        <p className="text-slate-400 leading-relaxed mb-8 text-sm">{data.feasibility_reasoning}</p>
        
        {data.ethical_flags?.length > 0 && (
          <div className="bg-white/5 rounded-xl p-4 text-left mb-8 border border-white/5">
            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-3">Violations</p>
            <ul className="grid grid-cols-1 gap-2">
              {data.ethical_flags.map((flag, i) => (
                <li key={i} className="flex items-center gap-2 text-[12px] text-slate-300 font-medium">
                  <XCircle size={14} className="text-rose-500 flex-shrink-0" /> {flag}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={onReset}
          className="bg-white text-black font-black py-3 px-8 rounded-xl text-sm uppercase tracking-wider"
        >
          Modify
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">

      {/* --- Score & Reasoning --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <ScoreGauge score={data.feasibility_score} />

        <div className="lg:col-span-2 glass rounded-[24px] p-8 flex flex-col justify-between border-white/5 bg-gradient-to-br from-blue-500/5 to-transparent relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
             <Sparkles size={120} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                <Sparkles size={14} />
              </div>
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">Summary</p>
            </div>
            <p className="text-white text-xl lg:text-2xl font-bold leading-tight brand-font italic">
              "{data.feasibility_reasoning || 'Synthesis complete.'}"
            </p>
          </div>
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/5">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Evidence-Grounded Intelligence</span>
          </div>
        </div>
      </div>

      {/* --- Triple Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Concept', content: data.refined_idea, icon: <BrainCircuit size={18} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { title: 'Friction', content: data.extracted_features?.core_problem, icon: <AlertTriangle size={18} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { title: 'Alpha', content: data.extracted_features?.target_users, icon: <User size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((card, i) => (
          <div key={i} className="glass rounded-[20px] p-6 glass-hover group">
            <div className={`inline-flex p-2 rounded-xl ${card.bg} ${card.color} mb-4 border border-white/5`}>
              {card.icon}
            </div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">{card.title}</p>
            <p className="text-white font-bold text-sm leading-snug group-hover:text-blue-400 transition-colors">{card.content}</p>
          </div>
        ))}
      </div>

      {/* --- Market Intel --- */}
      <div className="glass rounded-[24px] border-white/5 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Search size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white brand-font tracking-tight uppercase">Intelligence</h3>
            </div>
          </div>

          <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
            {[
              { id: 'trends', label: 'Trends' },
              { id: 'painpoints', label: 'Pains' },
              { id: 'evidence', label: 'Evidence' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {activeTab === 'evidence'
            ? data.supporting_evidence?.map((ev, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{ev.source_id}</span>
                </div>
                <p className="text-base font-bold text-white mb-1 brand-font leading-tight">{ev.source_title}</p>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{ev.content}</p>
              </div>
            ))
            : (activeTab === 'trends' ? data.market_trends : data.user_pain_points)?.map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5 group">
                <div className="mt-1 p-1 rounded-full bg-blue-500/20 group-hover:bg-blue-500 transition-colors">
                  <ChevronRight size={12} className="text-white" />
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">{item}</p>
              </div>
            ))
          }
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <CompetitorTable competitors={data.competitor_overview} />
        <PivotPanel
          originalIdea={data.original_idea}
          pivots={pivotData?.pivots || []}
          isLoading={isPivoting}
          onPivotRequest={() => onPivotRequest(evaluationId)}
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
