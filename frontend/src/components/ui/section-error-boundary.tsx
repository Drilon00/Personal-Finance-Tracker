'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface State {
  hasError: boolean;
  error?: Error;
}

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  label?: string;
}

export class SectionErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[SectionErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {this.props.label ?? 'This section'} failed to load
            </p>
            <p className="text-xs text-red-500 mt-1">
              {this.state.error?.message ?? 'An unexpected error occurred'}
            </p>
          </div>
          <button
            onClick={this.reset}
            className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
