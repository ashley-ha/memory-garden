'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
          <div className="card-elvish max-w-md w-full text-center">
            <h2 className="text-elvish-title text-2xl mb-4">
              🍃 The path has become unclear
            </h2>
            <p className="text-elvish-body mb-6">
              An unexpected error has occurred in the Memory Garden. 
              The wise course is to refresh and begin anew.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-elvish"
            >
              Refresh the Garden
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}