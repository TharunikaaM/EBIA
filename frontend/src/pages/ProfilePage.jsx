import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, MapPin, User as UserIcon, Mail, Bookmark, Trash2, Sparkles } from 'lucide-react';
import BaseCard from '../components/ui/BaseCard';
import BaseButton from '../components/ui/BaseButton';
import BaseInput from '../components/ui/BaseInput';

export default function ProfilePage({ user, theme, setTheme, savedIdeas = [], onDeleteIdea, onAnalyzeIdea }) {
  const navigate = useNavigate();
  const [location, setLocation] = useState('Singapore');

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] hover:text-blue-500 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </button>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-main)] uppercase tracking-[0.1em]">Founders Workspace</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* User Info & Settings Row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          <BaseCard className="p-8 bg-[var(--bg-card)] border-none shadow-xl">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="h-24 w-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <UserIcon className="h-10 w-10" />
              </div>
              <div className="flex-1 space-y-1">
                <h2 className="text-3xl font-black text-[var(--text-main)]">{user?.name || 'Guest User'}</h2>
                <div className="flex items-center gap-3 text-[var(--text-muted)] font-bold text-sm">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span>{user?.email || 'guest@local'}</span>
                </div>
              </div>
            </div>
          </BaseCard>

          <BaseCard className="p-8 bg-[var(--bg-card)] border-none shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-[var(--bg-subtle)]">
                  {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </div>
                <div>
                  <div className="font-black text-xs text-[var(--text-main)] uppercase tracking-widest">Interface</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-bold">Theme and visual style</div>
                </div>
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={cn(
                  "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none",
                  theme === 'dark' ? "bg-blue-600" : "bg-[var(--border-color)] border border-[var(--border-color)]"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm",
                    theme === 'dark' ? "translate-x-6" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>
          </BaseCard>
        </div>

        {/* Saved Ideas Gallery */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                <Bookmark className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-[0.15em]">Bookmarked Concepts</h2>
            </div>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl uppercase tracking-widest">
              {savedIdeas.length} Saved
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedIdeas.length === 0 ? (
              <BaseCard className="p-16 text-center col-span-full border-dashed border-2 border-[var(--border-color)] bg-transparent">
                <div className="h-20 w-20 rounded-3xl bg-[var(--bg-subtle)] flex items-center justify-center mx-auto mb-8 opacity-40">
                  <Bookmark className="h-10 w-10 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-lg font-black text-[var(--text-main)] mb-2">Your library is empty</h3>
                <p className="text-[var(--text-muted)] font-bold text-sm max-w-sm mx-auto leading-relaxed">
                  Start generating strategic directions and save the ones that catch your eye!
                </p>
                <BaseButton onClick={() => navigate('/analyze')} className="mt-8 rounded-2xl h-14 min-w-[200px] font-black uppercase tracking-widest text-[11px]">
                  Explore Ideas
                </BaseButton>
              </BaseCard>
            ) : (
              savedIdeas.map((idea) => (
                <BaseCard key={idea.id} className="p-8 flex flex-col justify-between group hover:border-blue-500/30 transition-all shadow-xl hover:shadow-2xl hover:shadow-blue-500/5 bg-[var(--bg-card)] border-none">
                  <div>
                    <div className="flex items-start justify-between mb-6">
                      <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <button
                        onClick={() => onDeleteIdea?.(idea.id)}
                        className="p-2.5 rounded-xl text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all opacity-0 group-hover:opacity-100"
                        title="Remove bookmark"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <h3 className="text-xl font-black text-[var(--text-main)] mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                      {idea.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-4 mb-6 font-bold leading-relaxed opacity-80">
                      {idea.content?.description || "A strategic business model optimized for your chosen market profile."}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-[var(--border-color)] flex items-center gap-3">
                    <BaseButton
                      onClick={() => onAnalyzeIdea?.(idea.content)}
                      className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                    >
                      Run Full Analysis
                    </BaseButton>
                  </div>
                </BaseCard>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper for Toggle (redundant if cn is correctly imported, but being safe)
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}


