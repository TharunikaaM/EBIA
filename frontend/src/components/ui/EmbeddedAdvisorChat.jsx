import { useState } from 'react';
import { MessageSquare, Sparkles, Users } from 'lucide-react';
import BaseCard from './BaseCard';
import BaseButton from './BaseButton';
import { cn } from '../../lib/cn';

export default function EmbeddedAdvisorChat({ messages, onSend, isTyping, isVisible, onClose }) {
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
