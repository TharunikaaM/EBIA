import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import {
  BrainCircuit, Sparkles, Zap, History, Settings,
  LogOut, ChevronDown, X, AlertTriangle, XCircle, CheckCircle2,
  TrendingUp, Search, Globe, Lock, Trash2, FileText, Download,
  User, ArrowRight, DollarSign
} from 'lucide-react';
import './index.css';

import ScoreGauge from './components/ScoreGauge';
import InsightCard from './components/InsightCard';
import CompetitorTable from './components/CompetitorTable';
import PivotPanel from './components/PivotPanel';
import AnalyticsDashboard from './components/AnalyticsDashboard';

// Refactored Components
import Skeleton from './components/Skeleton';
import UserMenu from './components/UserMenu';
import HistoryDrawer from './components/HistoryDrawer';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [user] = useState({ name: 'Guest User', email: 'guest@local' });
  const [apiConnected, setApiConnected] = useState(false);
  const [tab, setTab] = useState('evaluate'); // 'evaluate' | 'generate'
  const [stage, setStage] = useState('input'); // 'input' | 'loading' | 'results'
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  // Form inputs
  const [ideaInput, setIdeaInput] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [genBiz, setGenBiz] = useState('');
  const [genLoc, setGenLoc] = useState('');
  const [genBudget, setGenBudget] = useState('');

  // Results
  const [resultData, setResultData] = useState(null);
  const [evaluationId, setEvaluationId] = useState(null);
  const [pivotData, setPivotData] = useState(null);
  const [isPivoting, setIsPivoting] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Scanning market signals…');

  // Axios
  const api = axios.create({ baseURL: API_BASE_URL });
  api.interceptors.request.use(cfg => {
    const token = localStorage.getItem('ebia_token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });

  useEffect(() => {
    api.get('/').then(() => setApiConnected(true)).catch(() => setApiConnected(false));
    const existing = localStorage.getItem('ebia_token');
    if (!existing) {
      axios.post(`${API_BASE_URL}/api/v1/auth/guest`)
        .then(r => { if (r.data?.access_token) localStorage.setItem('ebia_token', r.data.access_token); })
        .catch(() => {});
    }
  }, []);

  const pollStatus = useCallback(async (taskId) => {
    const msgs = ['Scanning market signals…', 'Finding your competitors…', 'Scoring your idea…', 'Building your report…'];
    let i = 0;
    const iv = setInterval(async () => {
      try {
        const res = await api.get(`/api/v1/idea/status/${taskId}`);
        if (res.data.status === 'COMPLETED') {
          clearInterval(iv);
          setResultData(res.data.analysis_results);
          setEvaluationId(res.data.id);
          setStage('results');
        } else if (res.data.status === 'FAILED') {
          clearInterval(iv); toast.error('Something went wrong. Please try again.'); setStage('input');
        } else {
          setLoadingMsg(msgs[i++ % msgs.length]);
        }
      } catch { clearInterval(iv); setStage('input'); toast.error('Lost connection to server.'); }
    }, 3000);
  }, []);

  const handleEvaluate = async () => {
    if (!ideaInput || ideaInput.length < 10) return toast.error('Tell us a bit more about your idea!');
    setStage('loading'); setPivotData(null);
    try {
      const res = await api.post('/api/v1/idea/evaluate', { idea: ideaInput, is_private: isPrivate });
      pollStatus(res.data.task_id);
    } catch (err) { setStage('input'); toast.error(err.response?.data?.detail || 'Could not connect to the server.'); }
  };

  const handleGenerate = async () => {
    if (!genBiz) return toast.error('Tell us what kind of business you want to explore!');
    setStage('loading'); setPivotData(null);
    try {
      const res = await api.post('/api/v1/idea/generate', { business_domain: genBiz, target_location: genLoc, budget_range: genBudget });
      setResultData(res.data); setStage('results'); toast.success('Your idea is ready!');
    } catch (err) { setStage('input'); toast.error(err.response?.data?.detail || 'Generation failed.'); }
  };

  const handlePivot = async (evalId) => {
    if (!evalId) return;
    setIsPivoting(true); setPivotData(null);
    try {
      const res = await api.post('/api/v1/idea/pivot', null, { params: { evaluation_id: evalId } });
      setPivotData(res.data); toast.success('Found 3 alternative paths!');
    } catch { toast.error('Could not find alternatives right now.'); }
    finally { setIsPivoting(false); }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/api/v1/history');
      setHistoryList(res.data);
    } catch { toast.error('Could not load your history.'); }
    setHistoryOpen(true);
  };

  const deleteHistory = async (id) => {
    try { await api.delete(`/api/v1/history/${id}`); setHistoryList(p => p.filter(h => h.id !== id)); toast.success('Removed.'); }
    catch { toast.error('Could not delete this.'); }
  };

  const exportHistory = async (id, fmt) => {
    try {
      const res = await api.get(`/api/v1/history/${id}/export?format=${fmt}`, { responseType: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(res.data);
      a.download = `ebia_report_${id}.${fmt}`;
      a.click();
    } catch { toast.error('Export failed.'); }
  };

  const handleReset = () => { setStage('input'); setResultData(null); setPivotData(null); };

  return (
    <div className="min-h-screen relative text-slate-200">
      <div className="mesh-bg" />
      
      <Toaster position="top-center" toastOptions={{
        style: { background: 'rgba(15, 23, 42, 0.9)', color: '#fff', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', backdropFilter: 'blur(8px)' }
      }} />

      {/* --- Header --- */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl bg-black/20">
        <div className="container-7xl h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <BrainCircuit size={24} className="text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black brand-font tracking-tight text-white">EBIA</span>
              <span className="text-[9px] uppercase font-black text-slate-500 tracking-[0.2em] leading-none">Intelligence</span>
            </div>
            <div className={`ml-4 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${apiConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              <div className={`w-1 h-1 rounded-full ${apiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              {apiConnected ? 'LIVE' : 'OFFLINE'}
            </div>
          </div>

          <UserMenu user={user} onShowHistory={fetchHistory} onLogout={() => { localStorage.removeItem('ebia_token'); window.location.reload(); }} />
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="container-7xl py-8 lg:py-12">
        {stage === 'input' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero */}
            <div className="text-center mb-12 lg:mb-16">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-blue-400 text-[10px] font-black px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
                <Sparkles size={12} /> Version 2.0
              </div>
              <h1 className="text-4xl lg:text-6xl font-black text-white brand-font tracking-tight leading-[1.1] mb-6">
                Build your startup <br />
                <span className="gradient-text">with certainty.</span>
              </h1>
              <p className="text-slate-400 text-base lg:text-lg max-w-xl mx-auto leading-relaxed">
                Hyper-analyze your startup ideas using global market signals and competitive intelligence. 
                Stop guessing, start building.
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit mx-auto mb-12">
              <button
                onClick={() => setTab('evaluate')}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black transition-all duration-300 ${tab === 'evaluate' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                <Search size={16} /> EVALUATE
              </button>
              <button
                onClick={() => setTab('generate')}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black transition-all duration-300 ${tab === 'generate' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                <Zap size={16} /> GENERATE
              </button>
            </div>

            {/* Input Forms */}
            <div className="max-w-3xl mx-auto">
              {tab === 'evaluate' ? (
                <div className="glass rounded-[24px] p-6 lg:p-8 border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 text-white">
                    <BrainCircuit size={80} />
                  </div>
                  <h2 className="text-xl font-black text-white mb-1 brand-font">Manifest your vision</h2>
                  <p className="text-slate-500 mb-6 font-medium text-sm">Describe your concept for deep analysis.</p>

                  <textarea
                    value={ideaInput}
                    onChange={e => setIdeaInput(e.target.value)}
                    placeholder="e.g., A cloud-native platform for autonomous supply chain management..."
                    rows={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 text-base leading-relaxed focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 resize-none transition-all mb-6"
                  />

                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <button
                      onClick={() => setIsPrivate(v => !v)}
                      className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-white/5 transition-all group"
                    >
                      <div className={`w-8 h-5 rounded-full p-1 transition-colors duration-300 ${isPrivate ? 'bg-blue-600' : 'bg-white/10'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 ${isPrivate ? 'translate-x-3' : ''}`} />
                      </div>
                      <span className={`text-[9px] font-black tracking-widest uppercase ${isPrivate ? 'text-blue-400' : 'text-slate-500'}`}>
                        {isPrivate ? 'Stealth' : 'Global Network'}
                      </span>
                    </button>

                    <button
                      onClick={handleEvaluate}
                      disabled={ideaInput.length < 10}
                      className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black rounded-xl px-8 py-3.5 transition-all active:scale-95 shadow-xl shadow-blue-500/20 text-sm uppercase tracking-wider"
                    >
                      <Sparkles size={18} /> Initiate Analysis
                    </button>
                  </div>
                </div>
              ) : (
                <div className="glass rounded-[24px] p-6 lg:p-8 border-white/10">
                  <h2 className="text-xl font-black text-white mb-1 brand-font">Parameters</h2>
                  <p className="text-slate-500 mb-8 font-medium text-sm">Set constraints for AI generation.</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                      { label: 'DOMAIN', value: genBiz, setter: setGenBiz, placeholder: 'Healthcare' },
                      { label: 'MARKET', value: genLoc, setter: setGenLoc, placeholder: 'Global' },
                      { label: 'BUDGET', value: genBudget, setter: setGenBudget, placeholder: '$10k+' },
                    ].map(({ label, value, setter, placeholder }) => (
                      <div key={label}>
                        <label className="block text-[9px] font-black text-slate-500 tracking-[0.2em] mb-2">{label}</label>
                        <input
                          value={value}
                          onChange={e => setter(e.target.value)}
                          placeholder={placeholder}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder:text-slate-700 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-bold"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleGenerate}
                      disabled={!genBiz}
                      className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black rounded-xl px-10 py-3.5 transition-all active:scale-95 shadow-xl shadow-blue-500/20 text-sm uppercase tracking-wider"
                    >
                      <Zap size={18} /> Forge Concept
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Loading State --- */}
        {stage === 'loading' && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col items-center text-center pt-8 mb-12">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-[2px] border-blue-500/20 rounded-full" />
                <div className="absolute inset-0 border-[2px] border-t-blue-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                  <BrainCircuit size={28} className="animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-white mb-2 brand-font uppercase tracking-tight">Processing Signals</h2>
              <p className="text-blue-400 font-bold tracking-widest uppercase text-[9px]">{loadingMsg}</p>
            </div>
            <Skeleton />
          </div>
        )}

        {/* --- Results State --- */}
        {stage === 'results' && resultData && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8 lg:mb-10">
              <button 
                onClick={handleReset} 
                className="flex items-center gap-2 text-slate-500 hover:text-white text-[10px] font-black tracking-widest uppercase transition-all group"
              >
                <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                   ←
                </div>
                Return
              </button>
              <div className="flex items-center gap-2 text-[8px] font-black tracking-[0.2em] text-blue-400 uppercase bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                <Sparkles size={12} /> Synthetic Analysis
              </div>
            </div>
            <AnalyticsDashboard
              data={resultData}
              evaluationId={evaluationId}
              pivotData={pivotData}
              isPivoting={isPivoting}
              onPivotRequest={handlePivot}
              onReset={handleReset}
            />
          </div>
        )}
      </main>

      {/* --- Overlay Components --- */}
      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        historyList={historyList}
        onOpen={item => { setResultData(item.analysis_results); setStage('results'); }}
        onDelete={deleteHistory}
        onExport={exportHistory}
      />
    </div>
  );
}
