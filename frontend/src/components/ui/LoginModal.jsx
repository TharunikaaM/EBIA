import { GoogleLogin } from '@react-oauth/google';
import { X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginModal({ open, onClose, onSuccess }) {
  const { login } = useAuth();

  if (!open) return null;

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await login(credentialResponse.credential);
      onSuccess?.();
      onClose();
    } catch {
      // If login fails, keep modal open
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md mx-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-2xl p-8 animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-blue-600" />
          </div>

          <h3 className="text-xl font-black text-[var(--text-main)] mb-2">Sign in to Continue</h3>
          <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed mb-8 max-w-xs">
            Sign in with your Google account to analyze ideas, generate strategies, and save your work.
          </p>

          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {}}
              shape="pill"
              size="large"
              text="signin_with"
              width="300"
            />
          </div>

          <p className="mt-6 text-[10px] text-[var(--text-muted)] opacity-60">
            By signing in you agree to our terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}
