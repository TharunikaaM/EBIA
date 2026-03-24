import { useState, useMemo } from 'react';
import { MessageSquare, Sparkles, Users } from 'lucide-react';
import BaseCard from './BaseCard';
import BaseButton from './BaseButton';
import { cn } from '../../lib/cn';
import ReactMarkdown from 'react-markdown';

function buildInitMessage(score, risks) {
  const topRisks = (risks || []).slice(0, 2);
  const riskText = topRisks.length
    ? `\n\n**Here are a few things to watch:**\n${topRisks.map((r) => `• ${r}`).join('\n')}`
    : '';

  if (score >= 75) {
    return `### Good chance of success! 🚀\n\nYour idea scored **${score}/100** — this means it has good potential.${riskText}\n\nLet’s improve this idea together. What would you like help with?`;
  }
  if (score >= 40) {
    return `### Solid Idea, Let's Make It Better 🔍\n\nYour idea scored **${score}/100** — there's real potential, but a few simple adjustments could help.${riskText}\n\nLet’s improve this idea together. What would you like help with?`;
  }
  return `### Let's Improve This Together 🛠️\n\nYour idea scored **${score}/100** — it needs some work, but we can refine it.${riskText}\n\nMany successful businesses started with a simple thought and improved from there. What would you like help with?`;
}

export default function EmbeddedAdvisorChat({ messages, onSend, isTyping, isVisible, onClose, feasibilityScore, riskFactors }) {
  const [draft, setDraft] = useState('');

  const displayMessages = useMemo(() => {
    if (messages && messages.length > 0) return messages;
    const initMsg = buildInitMessage(feasibilityScore, riskFactors);
    return [{ role: 'assistant', content: initMsg }];
  }, [messages, feasibilityScore, riskFactors]);

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
          Idea Assistant
        </div>
        <button onClick={onClose} className="text-sm font-bold text-blue-600 hover:text-blue-700">Hide Assistant</button>
      </div>

      <BaseCard className="p-8 bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 shadow-lg">
        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {displayMessages.map((m, i) => (
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
                "flex-1 p-5 rounded-2xl text-sm leading-relaxed shadow-sm border prose prose-sm dark:prose-invert max-w-none",
                m.role === 'assistant'
                  ? "bg-blue-600 text-white border-blue-500"
                  : "bg-white dark:bg-slate-800 text-[var(--text-main)] border-[var(--border-color)]"
              )}>
                <ReactMarkdown
                  components={{
                    h3: ({ node, ...props }) => <h3 className="text-base font-black mb-2 mt-4 first:mt-0" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-3 space-y-1" {...props} />,
                    li: ({ node, ...props }) => <li className="marker:text-blue-200" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-black text-white underline decoration-blue-400/50" {...props} />
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div className="p-5 rounded-2xl bg-blue-600 text-white text-sm border border-blue-500 animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-[var(--border-color)] shadow-inner">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask anything about your idea…"
            className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none text-[var(--text-main)] resize-none h-auto min-h-[44px] max-h-32 custom-scrollbar py-3.5"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <BaseButton className="h-11 px-6 rounded-xl font-bold shadow-md" onClick={send}>
            Ask
          </BaseButton>
        </div>
      </BaseCard>
    </div>
  );
}
