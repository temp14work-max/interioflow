/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('InterioFlow UI Error Boundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearAndReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[500px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 shadow-sm text-center space-y-5">
            <div className="w-14 h-14 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
              <AlertTriangle className="w-7 h-7 stroke-[1.75]" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-semibold text-stone-900 font-serif">
                Workspace Display Refreshed
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                An unexpected display issue occurred while rendering this project view. Your consultation and milestone data is preserved safely.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-left overflow-x-auto text-[11px] font-mono text-stone-600">
                {this.state.error.message}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleClearAndReload}
                className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
