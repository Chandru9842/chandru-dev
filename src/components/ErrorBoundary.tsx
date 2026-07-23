import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React Component Boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-100">
                Application Rendering Issue
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                An unexpected state occurred while rendering this module. You can reload the application or return to the main portfolio.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-rose-300 text-left overflow-x-auto max-h-32">
                {this.state.error.message || 'Unknown error details'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
              <a
                href="/"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center justify-center gap-2 transition"
              >
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
