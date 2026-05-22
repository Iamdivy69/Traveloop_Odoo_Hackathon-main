import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-955 p-4 transition-colors duration-300">
          <div className="max-w-md w-full bg-white dark:bg-dark-905 rounded-2xl shadow-xl border border-gray-105 dark:border-dark-805 p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-105 dark:bg-red-955/30 rounded-full flex items-center justify-center mx-auto text-red-505">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-gray-905 dark:text-gray-105">
                Something went wrong
              </h1>
              <p className="text-sm text-gray-505 dark:text-gray-405">
                We encountered an unexpected error while displaying this page. Try refreshing or going back.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-red-55 dark:bg-red-955/10 rounded-xl p-4 text-left border border-red-105/50 dark:border-red-905/20">
                <p className="text-xs font-mono text-red-605 dark:text-red-405 break-all whitespace-pre-wrap">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleRetry}
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-primary-605 hover:bg-primary-705 active:bg-primary-805 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-505 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Retry & Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
