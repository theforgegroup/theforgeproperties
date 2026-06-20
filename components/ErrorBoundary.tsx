
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-sm shadow-xl border-t-4 border-red-500 max-w-lg w-full">
            <h2 className="text-2xl font-serif text-forge-navy mb-4 font-bold">Something went wrong</h2>
            <p className="text-slate-600 mb-6 text-sm">
              The application encountered an unexpected error. This might be due to a missing database table or a configuration issue.
            </p>
            <div className="bg-red-50 p-4 rounded border border-red-100 mb-6 overflow-auto max-h-40">
              <code className="text-xs text-red-700 whitespace-pre-wrap">
                {this.state.error?.message || 'Unknown error'}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-forge-navy text-white py-3 font-bold uppercase tracking-widest text-[10px] hover:bg-forge-dark transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).props.children;
  }
}
