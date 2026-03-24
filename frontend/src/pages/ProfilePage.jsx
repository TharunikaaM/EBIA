import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, MapPin, User as UserIcon, Mail, Bookmark, Sparkles, Layout } from 'lucide-react';
import { cn } from '../lib/cn';
import BaseCard from '../components/ui/BaseCard';
import BaseButton from '../components/ui/BaseButton';
import BaseInput from '../components/ui/BaseInput';
import Tooltip from '../components/ui/Tooltip';

export default function ProfilePage({ user, theme, setTheme, savedIdeas = [], onDeleteIdea, onAnalyzeIdea }) {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] hover:text-blue-500 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </button>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-main)] uppercase tracking-[0.1em]">Your Workspace</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* User Info & Settings Row */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--bg-card)] p-4 md:p-6 rounded-2xl shadow-sm border border-[var(--border-color)]">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <UserIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--text-main)] leading-none mb-1">{user?.name || 'Guest User'}</h2>
              <div className="flex items-center gap-2 text-[var(--text-muted)] font-bold text-xs">
                <Mail className="h-3 w-3 text-blue-500" />
                <span>{user?.email || 'guest@local'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-3 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors border border-transparent hover:border-[var(--border-color)]"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
        </div>

        {/* Saved Ideas Gallery */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-sm">
                <Bookmark className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-black text-[var(--text-main)] uppercase tracking-[0.1em]">Saved Ideas</h2>
            </div>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg uppercase tracking-widest">
              {savedIdeas.length} Saved
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <BaseCard key={idea.id} className="p-0 border border-[var(--border-color)] flex flex-col h-full shadow-sm hover:shadow-md transition-all group">
                  <div 
                    className="p-4 cursor-pointer flex-1"
                    onClick={() => onAnalyzeIdea?.({ ...idea.content, title: idea.title })}
                  >
                    <h3 className="text-base font-black text-[var(--text-main)] mb-2 mt-2 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                      {idea.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-3 mb-4 font-bold leading-relaxed opacity-80">
                      {idea.content?.description || "A refined version of your idea with improvements."}
                    </p>
                  </div>

                  <div className="px-4 pb-4 mt-auto">
                    <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between gap-3">
                      <BaseButton
                        onClick={() => onAnalyzeIdea?.({ ...idea.content, title: idea.title })}
                        className="flex-1 w-full h-10 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 text-white"
                      >
                        <Layout className="h-3.5 w-3.5" />
                        See Full Details
                      </BaseButton>

                      <Tooltip text="Unsave this idea" position="top">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteIdea?.(idea.id);
                          }}
                          className="h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-lg border bg-[var(--bg-subtle)] border-[var(--border-color)] text-blue-600 dark:text-blue-400 transition-all hover:border-blue-500 hover:bg-[var(--bg-main)]"
                        >
                          <Bookmark className="h-4 w-4 fill-current" />
                        </button>
                      </Tooltip>
                    </div>
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

