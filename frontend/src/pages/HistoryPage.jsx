import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Clock, Search, Trash2, CheckCircle2 } from 'lucide-react';
import BaseCard from '../components/ui/BaseCard';
import BaseButton from '../components/ui/BaseButton';

function ScorePill({ score }) {
  const s = Number(score) || 0;
  const color =
    s >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : s >= 60 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
  return (
    <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold shadow-sm ${color}`}>
      {s}%
    </span>
  );
}

export default function HistoryPage({ historyList = [], onOpen, onDelete, onDeleteMultiple, onClearAll }) {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === historyList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(historyList.map(h => h.id));
    }
  };

  const handleDeleteSelected = () => {
    onDeleteMultiple?.(selectedIds);
    setSelectedIds([]);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 md:py-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] hover:text-blue-600 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <Clock className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-main)]">Evaluation History</h1>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 ? (
            <BaseButton
              onClick={handleDeleteSelected}
              className="rounded-xl flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white border-none"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selectedIds.length})
            </BaseButton>
          ) : (
            <>
              {historyList.length > 0 && (
                <BaseButton
                  variant="secondary"
                  className="rounded-xl flex items-center gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100 dark:border-rose-900/30 dark:hover:bg-rose-900/20"
                  onClick={() => onClearAll?.()}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </BaseButton>
              )}
            </>
          )}
        </div>
      </div>

      <BaseCard className="p-0 overflow-hidden shadow-xl border-none bg-[var(--bg-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--bg-main)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-color)]">
              <tr>
                <th className="px-6 py-5 w-10">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={historyList.length > 0 && selectedIds.length === historyList.length}
                      onChange={toggleSelectAll}
                    />
                  </div>
                </th>
                <th className="px-8 py-5">Project / Idea</th>
                <th className="px-8 py-5">Analysis Date</th>
                <th className="px-8 py-5 text-right font-bold pr-12">Feasibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-main)] font-medium">
              {historyList.length === 0 ? (
                <tr>
                  <td className="px-8 py-20 text-center text-[var(--text-muted)]" colSpan={4}>
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 rounded-full bg-[var(--bg-subtle)]">
                        <Search className="h-8 w-8 opacity-20" />
                      </div>
                      <p className="font-bold">No history yet. Start by analyzing an idea!</p>
                      <BaseButton onClick={() => navigate('/analyze')} className="rounded-xl">Go Home</BaseButton>
                    </div>
                  </td>
                </tr>
              ) : (
                historyList.map((h) => (
                  <tr
                    key={h.id}
                    onClick={() => onOpen?.(h)}
                    className={`cursor-pointer hover:bg-[var(--bg-subtle)]/30 transition-colors group ${selectedIds.includes(h.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  >
                    <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={selectedIds.includes(h.id)}
                          onChange={() => toggleSelect(h.id)}
                        />
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-extrabold text-base group-hover:text-blue-600 transition-colors">
                        {h.project_name || h.idea_title || 'Untitled idea'}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[var(--text-muted)]">
                      {h.date || h.created_at || '—'}
                    </td>
                    <td className="px-8 py-5 text-right pr-12">
                      <ScorePill score={h.score ?? h.feasibility_score ?? 0} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </BaseCard>
    </div>
  );
}

