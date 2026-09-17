import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
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
        <div className="min-h-screen w-full bg-navy-950 flex flex-col items-center justify-center p-6 text-center text-ink selection:bg-snap/20">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20 text-red-400 shadow-lg shadow-red-500/10">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="font-display font-bold text-2xl text-ink mb-3">Something went wrong</h1>
          <p className="text-sm text-ink-dim max-w-md mb-8 leading-relaxed break-words">
            {this.state.error?.message || "An unexpected error occurred while processing your request. Please try again."}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-6 py-3 bg-snap hover:bg-snap/90 text-navy-950 font-display font-semibold text-sm rounded-xl transition-all shadow-md shadow-snap/10 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload App</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
