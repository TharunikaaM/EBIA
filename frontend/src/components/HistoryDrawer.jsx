import React from 'react';
import { X, History, Trash2, FileText, Download, Lock, Globe } from 'lucide-react';

const HistoryDrawer = ({ open, onClose, historyList, onOpen, onDelete, onExport }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-300">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md glass border-l border-white/10 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-500">
        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <div>
            <h2 className="text-xl font-black text-white brand-font">Portfolio</h2>
            <p className="text-xs text-slate-500 font-medium">Your analyzed startups</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl text-slate-500 hover:bg-white/10 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {historyList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center opacity-40">
              <History size={48} className="text-slate-600 mb-4" />
              <p className="text-slate-400 font-bold">Empty Canvas</p>
              <p className="text-slate-500 text-xs mt-1">Submit an idea to see it here.</p>
            </div>
          ) : historyList.map(item => (
            <div
              key={item.id}
              onClick={() => { onOpen(item); onClose(); }}
              className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 rounded-2xl p-5 cursor-pointer transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                   {item.is_private ? <Lock size={12} className="text-slate-500" /> : <Globe size={12} className="text-blue-400" />}
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                   </span>
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => onExport(item.id, 'pdf')} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"><Download size={14} /></button>
                  <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="text-md font-bold text-slate-200 line-clamp-2 group-hover:text-blue-400 transition-colors mb-2">
                {item.custom_title || item.idea_text}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-bold">
                  {item.analysis_results?.extracted_features?.domain || 'Tech'}
                </span>
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  Score: <span className="text-emerald-400 font-bold">{item.analysis_results?.feasibility_score || 0}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryDrawer;
