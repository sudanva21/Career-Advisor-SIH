'use client'

import React from 'react'

interface Text3DErrorBoundaryProps {
  children: React.ReactNode
  fallback: React.ComponentType<any>
  fallbackProps?: any
}

interface Text3DErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class Text3DErrorBoundary extends React.Component<
  Text3DErrorBoundaryProps,
  Text3DErrorBoundaryState
> {
  constructor(props: Text3DErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): Text3DErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Text3D Error Boundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback
      return <FallbackComponent {...this.props.fallbackProps} />
    }

    return this.props.children
  }
}