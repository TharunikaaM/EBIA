import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, BarChart3, Lightbulb, Users, Wrench, ArrowLeft, MessageSquare, Shield, ShieldOff, Sparkles } from 'lucide-react';
import BaseCard from '../components/ui/BaseCard';
import BaseButton from '../components/ui/BaseButton';
import MetricBar from '../components/ui/MetricBar';
import BaseInput from '../components/ui/BaseInput';
import { cn } from '../lib/cn';

function ScoreCircle({ score }) {
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  const r = 54;
  const c = 2 * Math.PI * r;
  const dash = (s / 100) * c;
  
  // Dynamic color based on score
  const color = s >= 80 ? '#10B981' : s >= 60 ? '#3B82F6' : '#F59E0B';

  return (
    <div className="flex items-center gap-8">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 140 140" className="h-36 w-36 drop-shadow-sm">
          <circle 
            cx="70" 
            cy="70" 
            r={r} 
            stroke="currentColor" 
            className="text-slate-200 dark:text-slate-800" 
            strokeWidth="16" 
            fill="none" 
          />
          <circle
            cx="70"
            cy="70"
            r={r}
            stroke={color}
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            transform="rotate(-90 70 70)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-[var(--text-main)]">{s}</div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Score</div>
        </div>
      </div>
      <div>
        <div className="text-xl font-bold text-[var(--text-main)]">
          {s >= 80 ? 'Exceptional' : s >= 60 ? 'Strong Potential' : 'Needs Refinement'}
        </div>
        <div className="text-sm text-[var(--text-muted)] mt-1">Based on market signals</div>
      </div>
    </div>
  );
}

function InsightTile({ number, icon: Icon, title, lines }) {
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

function EmbeddedAdvisorChat({ messages, onSend, isTyping, isVisible, onClose }) {
  const [draft, setDraft] = useState('');

  const send = () => {
    const v = draft.trim();
    if (!v) return;
    setDraft('');
    onSend(v);
  };

  if (!isVisible) return null;

  return (
    <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2 font-bold text-[var(--text-main)]">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Guided Discussion
        </div>
        <button onClick={onClose} className="text-sm font-bold text-blue-600 hover:text-blue-700">Hide Chat</button>
      </div>

      <BaseCard className="p-8 bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 shadow-lg">
        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={cn(
              "flex items-start gap-4",
              m.role === 'assistant' ? "flex-row" : "flex-row-reverse"
            )}>
              <div className={cn(
                "h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm",
                m.role === 'assistant' ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 text-slate-600"
              )}>
                {m.role === 'assistant' ? <Sparkles className="h-5 w-5" /> : <Users className="h-5 w-5" />}
              </div>
              <div className={cn(
                "flex-1 p-5 rounded-2xl text-sm leading-relaxed shadow-sm border",
                m.role === 'assistant' 
                  ? "bg-blue-600 text-white border-blue-500" 
                  : "bg-white dark:bg-slate-800 text-[var(--text-main)] border-[var(--border-color)]"
              )}>
                {m.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div className="p-5 rounded-2xl bg-blue-600 text-white text-sm border border-blue-500 animate-pulse">
                Analyzing market signals...
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-[var(--border-color)] shadow-inner">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask FoundersCore for advice on your next steps..."
            className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none text-[var(--text-main)]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
          />
          <BaseButton className="h-11 px-6 rounded-xl font-bold shadow-md" onClick={send}>
            Send
          </BaseButton>
        </div>
      </BaseCard>
    </div>
  );
}

export default function EvaluationPage({
  evaluation,
  onDiscuss,
  chatMessages,
  isChatTyping,
  isPrivate,
  setIsPrivate,
}) {
  const navigate = useNavigate();
  const [isChatVisible, setIsChatVisible] = useState(false);
  const score = evaluation?.feasibility_score ?? 88;

  const metrics = useMemo(() => {
    const m = evaluation?.metrics || {
      market_alignment: 92,
      user_pain_points: 85,
      scalability: 75,
    };
    return [
      { label: 'Market Alignment', value: m.market_alignment },
      { label: 'User Pain Points Addressed', value: m.user_pain_points },
      { label: 'Scalability', value: m.scalability },
    ];
  }, [evaluation]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </button>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-main)]">Idea Evaluation</h1>
        </div>

        {/* Privacy Toggle / Indicator */}
        <button
          onClick={() => setIsPrivate?.(!isPrivate)}
          className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all font-bold text-sm shadow-sm self-start md:self-center",
            isPrivate 
              ? "bg-slate-900 border-slate-800 text-white" 
              : "bg-white dark:bg-slate-900 border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          )}
        >
          {isPrivate ? (
            <>
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Private Mode Enabled</span>
            </>
          ) : (
            <>
              <ShieldOff className="h-4 w-4" />
              <span>Public Mode</span>
            </>
          )}
        </button>
      </div>

      <BaseCard className="p-8 mb-8 border-none shadow-2xl bg-[var(--bg-card)]">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[auto_1fr_300px] items-center">
          <ScoreCircle score={score} />

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text-main)] leading-tight">
              {evaluation?.refined_idea || 'Analyzing your idea...'}
            </h2>
            <p className="text-base text-[var(--text-muted)] leading-relaxed font-normal">
              {evaluation?.extracted_features?.core_problem || evaluation?.feasibility_reasoning ||
                'We are processing your strategic appraisal based on current market trends.'}
            </p>
          </div>

          <div className="space-y-5 bg-slate-50/50 dark:bg-black/20 p-6 rounded-2xl border border-[var(--border-color)]">
            {metrics.map((m) => (
              <MetricBar key={m.label} label={m.label} value={m.value} />
            ))}
          </div>
        </div>
      </BaseCard>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <InsightTile
          number={1}
          icon={Users}
          title="Target Users"
          lines={evaluation?.extracted_features?.target_users ? [evaluation.extracted_features.target_users] : ['Identifying target market segments...']}
        />
        <InsightTile
          number={2}
          icon={BarChart3}
          title="Market Trends"
          lines={evaluation?.market_trends?.length ? evaluation.market_trends : ['Scanning for relevant market signals...']}
        />
        <InsightTile
          number={3}
          icon={AlertTriangle}
          title="User Pain Points"
          lines={evaluation?.user_pain_points?.length ? evaluation.user_pain_points : ['Analyzing core user frustrations...']}
        />
        <InsightTile
          number={4}
          icon={Wrench}
          title="Improvement Steps"
          lines={evaluation?.improvement_steps?.length ? evaluation.improvement_steps : ['Proposing strategic refinements...']}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <BaseCard className="p-8">
          <h3 className="text-lg font-bold text-[var(--text-main)] mb-6">Competitor Landscape</h3>
          <div className="overflow-hidden rounded-2xl border border-[var(--border-color)]">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Competitor</th>
                  <th className="px-6 py-4">Impact</th>
                  <th className="px-6 py-4">Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-main)] font-medium">
                {evaluation?.competitor_overview?.length ? (
                  evaluation.competitor_overview.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-bold">{c.competitor_name}</td>
                      <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-tighter">
                        {c.strategic_impact || 'Moderate'}
                      </td>
                      <td className="px-6 py-4 text-[var(--text-muted)] text-xs leading-relaxed">
                        {c.strengths?.length > 0 && <div className="text-[10px] opacity-80">Strength: {c.strengths[0]}</div>}
                        {c.weaknesses?.length > 0 && <div className="text-[10px] opacity-80">Weakness: {c.weaknesses[0]}</div>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-[var(--text-muted)] italic">
                      Scanning for direct and adjacent market rivals...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </BaseCard>

        <BaseCard className="p-8 bg-blue-600 border-none flex flex-col justify-center items-center text-center text-white">
          <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm">
            <MessageSquare className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold mb-3">FoundersCore Advisor</h3>
          <p className="text-blue-100 mb-8 text-sm font-medium leading-relaxed">
            Need to dive deeper into the economics or technical hurdles? Our AI advisor is ready to discuss your specific context.
          </p>
          <BaseButton 
            variant="secondary"
            className="w-full h-14 bg-white !text-blue-600 hover:bg-blue-50 font-black rounded-2xl shadow-xl border-none font-bold"
            onClick={() => {
              setIsChatVisible(true);
              setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }, 100);
            }}
          >
            Discuss with AI
          </BaseButton>
        </BaseCard>
      </div>

      {!isChatVisible && (
        <div className="mt-8 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-bold text-blue-800 dark:text-blue-300">Idea needs a shift? Click to explore strategic directions.</span>
          </div>
          <BaseButton 
            variant="secondary" 
            size="sm" 
            className="rounded-xl font-bold"
            onClick={() => {
              // Implementation of Pivot discovery
              toast.promise(
                onDiscuss("Explore strategic directions for this idea"),
                {
                  loading: 'Searching for market shifts...',
                  success: 'Directions updated!',
                  error: 'Could not retrieve directions.',
                }
              );
              setIsChatVisible(true);
            }}
          >
            Explore Directions
          </BaseButton>
        </div>
      )}

      <EmbeddedAdvisorChat 
        isVisible={isChatVisible} 
        onClose={() => setIsChatVisible(false)}
        messages={chatMessages} 
        onSend={onDiscuss} 
        isTyping={isChatTyping} 
      />
    </div>
  );
}
