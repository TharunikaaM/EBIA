import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * React Error Boundary — catches any render-time JavaScript errors and
 * displays a clean fallback UI instead of a blank white screen.
 *
 * Usage: wrap your <App /> or any subtree you want to protect.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Unknown error' };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught a render error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main,#f8fafc)] px-6">
          <div className="w-full max-w-md text-center p-10 bg-white rounded-3xl shadow-2xl border border-slate-100">
            <div className="h-16 w-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-3">Something went wrong</h1>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-2">
              An unexpected error occurred. This has been logged automatically.
            </p>
            {this.state.errorMessage && (
              <p className="text-xs text-slate-400 font-mono bg-slate-50 rounded-xl px-4 py-2 mb-8 text-left break-words">
                {this.state.errorMessage}
              </p>
            )}
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-500/20"
            >
              <RefreshCw className="h-4 w-4" />
              Go back to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
