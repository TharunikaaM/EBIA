import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, MapPin, User as UserIcon, Mail } from 'lucide-react';
import BaseCard from '../components/ui/BaseCard';
import BaseButton from '../components/ui/BaseButton';
import BaseInput from '../components/ui/BaseInput';

export default function ProfilePage({ user, theme, setTheme }) {
  const navigate = useNavigate();
  const [location, setLocation] = useState('Singapore');

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:py-16">
      {/* Global Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] hover:text-blue-600 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back
      </button>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-main)]">Account Settings</h1>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* User Info Card */}
        <BaseCard className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="h-24 w-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <UserIcon className="h-10 w-10" />
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-2xl font-bold text-[var(--text-main)]">{user?.name || 'Guest User'}</h2>
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Mail className="h-4 w-4" />
                <span>{user?.email || 'guest@local'}</span>
              </div>
            </div>
            <BaseButton variant="secondary" className="rounded-xl">Edit Profile</BaseButton>
          </div>
        </BaseCard>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BaseCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </div>
              <h3 className="font-bold text-lg text-[var(--text-main)]">Appearance</h3>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)]">
              <div>
                <div className="font-bold text-sm text-[var(--text-main)]">Dark Mode</div>
                <div className="text-xs text-[var(--text-muted)]">Switch between light and dark themes</div>
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                  theme === 'dark' ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    theme === 'dark' ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </BaseCard>


        </div>
      </div>
    </div>
  );
}

// Helper for Toggle (redundant if cn is correctly imported, but being safe)
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}


