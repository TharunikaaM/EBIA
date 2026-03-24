import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, BarChart3, Lightbulb, Users, Wrench, ArrowLeft,
  MessageSquare, Shield, ShieldOff, Sparkles, FileText, Download, Compass, ExternalLink
} from 'lucide-react';
import BaseCard from '../components/ui/BaseCard';
import BaseButton from '../components/ui/BaseButton';
import MetricBar from '../components/ui/MetricBar';
import { cn } from '../lib/cn';

import ScoreCircle from '../components/ui/ScoreCircle';
import InsightTile from '../components/ui/InsightTile';
import EmbeddedAdvisorChat from '../components/ui/EmbeddedAdvisorChat';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function EvaluationPage({
  evaluation,
  onDiscuss,
  chatMessages,
  isChatTyping,
  isPrivate,
  setIsPrivate,
  hideHeader = false,
  evaluationId,
  onPivot,
}) {
  const navigate = useNavigate();
  const [isChatVisible, setIsChatVisible] = useState(false);
  const score = evaluation?.feasibility_score ?? 88;

  const metrics = useMemo(() => {
    const m = evaluation?.metrics || {
      market_alignment: evaluation?.market_potential || 90,
      user_pain_points: evaluation?.user_pain_points?.length * 20 || 85,
      scalability: 75,
    };
    return [
      { label: 'Market Potential', value: evaluation?.market_potential || 85 },
      { label: 'Audience Clarity', value: evaluation?.audience_clarity === 'High' ? 95 : 60 },
      { label: 'Problem-Solution Fit', value: m.user_pain_points || 80 },
    ];
  }, [evaluation]);

  const handleDownloadReport = async () => {
    if (!evaluationId) {
      toast.error('Evaluation ID not found. Please re-analyze your idea.');
      return;
    }
    try {
      const token = localStorage.getItem('ebia_token');
      const response = await fetch(`${API_BASE_URL}/api/v1/history/${evaluationId}/export?format=pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EBIA_Report_${evaluationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // silently fail if download doesn't work
    }
  };

  // Filter evidence: only show sources with confidence ≥ 15%
  const filteredEvidence = useMemo(() => {
    return (evaluation?.supporting_evidence || []).filter(ev => (ev.confidence_score ?? 0) >= 0.15);
  }, [evaluation]);

  return (
    <div className={cn("mx-auto max-w-7xl px-6", hideHeader ? "py-0" : "py-4")}>
      {/* ── Top Bar: Back, Title, Actions ── */}
      {!hideHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back
            </button>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-main)]">Your Business Plan</h1>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center flex-wrap">
            {/* Export PDF — Top level */}
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:border-blue-400 hover:text-blue-600 transition-all font-bold text-xs shadow-sm"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>

            <button
              onClick={() => setIsPrivate?.(!isPrivate)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-2xl border transition-all font-bold text-xs shadow-sm",
                isPrivate
                  ? "bg-slate-900 border-slate-800 text-white"
                  : "bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
              )}
            >
              {isPrivate ? <Shield className="h-4 w-4 text-emerald-400" /> : <ShieldOff className="h-4 w-4" />}
              {isPrivate ? "Private" : "Public"}
            </button>
          </div>
        </div>
      )}

      {hideHeader && (
        <div className="flex items-center gap-4 mb-6">
          <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent to-[var(--border-color)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Analysis Results</span>
          <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent to-[var(--border-color)]" />
        </div>
      )}

      {/* ── Hero Card: Score + Idea + Metrics ── */}
      <BaseCard className="p-6 mb-6 border-none shadow-2xl bg-[var(--bg-card)]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr_280px] items-start">
          <ScoreCircle score={score} />

          <div className="space-y-3 min-w-0">
            {(() => {
              const raw = evaluation?.refined_idea || '';
              // Separate the main idea from the "For more accurate..." location hint
              // Make regex robust: match "For more accurate local competitors..." until the end of the string
              const hintMatch = raw.match(/([\s\S]*?)\s*(For more accurate local competitors.*)$/i);
              const mainIdea = hintMatch ? hintMatch[1].trim() : raw;
              const locationHint = hintMatch ? hintMatch[2].trim() : null;
              return (
                <div className="flex flex-col gap-3">
                  <h2 className="text-lg md:text-xl font-black text-[var(--text-main)] leading-snug">
                    {mainIdea || 'Analyzing your idea...'}
                  </h2>
                  {locationHint && (
                    <div className="inline-flex mt-1">
                      <span className="px-3 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-[10px] font-medium leading-relaxed border border-yellow-200/50 dark:border-yellow-800/50 shadow-sm flex items-center gap-2">
                        <span className="shrink-0 text-yellow-500">📍</span>
                        {locationHint}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-[9px] font-bold uppercase tracking-widest">{evaluation?.extracted_features?.domain || 'General'}</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-widest">{evaluation?.audience_clarity || 'Audience Identified'}</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed font-medium">
              {evaluation?.extracted_features?.core_problem || evaluation?.feasibility_reasoning ||
                'We are preparing your suggestions based on current market trends.'}
            </p>
          </div>

          <div className="space-y-4 bg-[var(--bg-main)]/50 p-4 rounded-2xl border border-[var(--border-color)] shadow-inner">
            {metrics.map((m) => (
              <MetricBar key={m.label} label={m.label} value={m.value} />
            ))}
          </div>
        </div>
      </BaseCard>

      {/* ── Insight Grid ── */}

      {/* ROW 1: Who is this for (1/3) + How to get started (2/3) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-4">
        <InsightTile
          number={1}
          icon={Users}
          title="Who is this for?"
          lines={evaluation?.extracted_features?.target_users ? [evaluation.extracted_features.target_users] : ['Identifying target market segments...']}
        />
        <InsightTile
          number={2}
          icon={Sparkles}
          title="How to get started"
          className="lg:col-span-2"
          lines={evaluation?.roadmap?.length ? evaluation.roadmap : ['Step 1: See if people actually want this by talking to them or checking online', 'Step 2: Make a simple version of your idea to show how it works', 'Step 3: Figure out all the costs and how you will make money', 'Step 4: Show your idea to the world and get your first users', 'Step 5: Get more customers and start growing your business']}
        />
      </div>

      {/* ROW 2: Possible Challenges — full width */}
      <div className="mb-4">
        <InsightTile
          number={3}
          icon={AlertTriangle}
          title="Possible challenges"
          expandable
          lines={evaluation?.risk_factors?.length ? evaluation.risk_factors : ['Looking at potential difficulties...']}
        />
      </div>

      {/* ROW 3: Market / Improve / Problems Solved — equal thirds */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        <InsightTile
          number={4}
          icon={BarChart3}
          title="What's happening in the market"
          expandable
          lines={evaluation?.market_trends?.length ? evaluation.market_trends : ['Scanning for recent trends...']}
        />
        <InsightTile
          number={5}
          icon={Wrench}
          title="How to improve this idea"
          lines={evaluation?.improvement_steps?.length ? evaluation.improvement_steps : ['Finding better ways to build this...']}
        />
        <InsightTile
          number={6}
          icon={Lightbulb}
          title="Main problems this solves"
          lines={evaluation?.user_pain_points?.length ? evaluation.user_pain_points : ['Identifying user frustrations...']}
        />
      </div>

      {/* ── Competitor + Actions Row ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px] mb-6">
        <BaseCard className="p-6">
          <h3 className="text-base font-bold text-[var(--text-main)] mb-4">Similar businesses</h3>
          <div className="overflow-hidden rounded-xl border border-[var(--border-color)]">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--bg-main)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Competitor</th>
                  <th className="px-4 py-3">Competition level</th>
                  <th className="px-4 py-3">Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-main)] font-medium">
                {evaluation?.competitor_overview?.length ? (
                  evaluation.competitor_overview.map((c, i) => (
                    <tr key={i} className="hover:bg-[var(--bg-main)] transition-colors">
                      <td className="px-4 py-3 font-bold text-sm">{c.competitor_name}</td>
                      <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase">
                        {c.strategic_impact || 'Moderate'}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)] text-xs leading-relaxed">
                        {c.strengths?.length > 0 && <div>Strength: {c.strengths[0]}</div>}
                        {c.weaknesses?.length > 0 && <div>Weakness: {c.weaknesses[0]}</div>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-[var(--text-muted)] italic text-sm">
                      Scanning for direct and adjacent market rivals...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </BaseCard>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          {/* Advisor CTA */}
          <BaseCard className="p-6 bg-blue-600 border-none flex flex-col items-center text-center text-white">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold mb-2">Talk to AI Advisor</h4>
            <p className="text-blue-100 mb-4 text-xs font-medium leading-relaxed">
              Ask questions or get better suggestions for your idea.
            </p>
            <BaseButton
              variant="secondary"
              className="w-full h-10 bg-white !text-blue-600 hover:bg-blue-50 font-black rounded-xl shadow-lg border-none text-xs"
              onClick={() => {
                setIsChatVisible(true);
                setTimeout(() => {
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }, 100);
              }}
            >
              Ask AI
            </BaseButton>
          </BaseCard>

          {/* Pivot CTA */}
          {onPivot && (
            <BaseCard className="p-5 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-900/10 flex flex-col items-center text-center">
              <Compass className="h-6 w-6 text-emerald-600 mb-3" />
              <h4 className="text-sm font-bold text-[var(--text-main)] mb-1">Other ways to improve your idea</h4>
              <p className="text-[10px] text-[var(--text-muted)] mb-3 leading-relaxed">Explore 3 alternative directions for your idea.</p>
              <BaseButton
                className="w-full h-9 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                onClick={onPivot}
              >
                Explore Other Ideas
              </BaseButton>
            </BaseCard>
          )}
        </div>
      </div>

      {/* ── Evidence Trail (only show meaningful sources) ── */}
      {/* 
      {filteredEvidence.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ExternalLink className="h-4 w-4 text-blue-600" />
            <h3 className="text-base font-bold text-[var(--text-main)]">Why this suggestion makes sense</h3>
            <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              Supporting data
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {filteredEvidence.map((ev, i) => {
              const conf = ev.confidence_score ?? 0;
              const confPct = Math.round(conf * 100);
              const confColor = conf >= 0.7 ? 'bg-emerald-500' : conf >= 0.4 ? 'bg-amber-500' : 'bg-red-500';
              const confText = conf >= 0.7 ? 'text-emerald-600 dark:text-emerald-400' : conf >= 0.4 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500';
              return (
                <BaseCard key={i} className="p-4 border-l-4 border-l-blue-400">
                  <h4 className="text-sm font-bold text-[var(--text-main)] leading-tight mb-2">{ev.source_title || 'Untitled Source'}</h4>
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Reliability</span>
                      <span className={cn("text-[10px] font-black tabular-nums", confText)}>{confPct}%</span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", confColor)} style={{ width: `${confPct}%` }} />
                    </div>
                  </div>
                  {ev.content && (
                    <p className="text-[10px] text-[var(--text-muted)] leading-relaxed line-clamp-2">{ev.content}</p>
                  )}
                </BaseCard>
              );
            })}
          </div>
        </div>
      )}
      */}

      <EmbeddedAdvisorChat
        isVisible={isChatVisible}
        onClose={() => setIsChatVisible(false)}
        messages={chatMessages}
        onSend={onDiscuss}
        isTyping={isChatTyping}
        feasibilityScore={evaluation?.feasibility_score}
        riskFactors={evaluation?.risk_factors}
      />
    </div>
  );
}
