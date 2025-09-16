'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  errorInfo: string
}

export default class WebGLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorInfo: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { 
      hasError: true,
      errorInfo: error.message 
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log the error to console for debugging
    console.error('WebGL Error Boundary caught an error:', error, errorInfo)
    
    // Check if it's a WebGL context lost error
    if (error.message.includes('Context Lost') || 
        error.message.includes('WebGL') || 
        error.message.includes('THREE.WebGLRenderer')) {
      console.warn('WebGL context lost, showing fallback UI...')
      
      // Don't reload automatically to prevent loops, just show fallback
      this.setState({
        hasError: true,
        errorInfo: 'WebGL context was lost. Please refresh the page to restore 3D functionality.'
      })
    }
  }

  componentDidMount() {
    // Add global error handler for WebGL context lost
    if (typeof window !== 'undefined') {
      const handleContextLost = (event: Event) => {
        console.warn('WebGL context lost event detected')
        event.preventDefault()
        this.setState({ 
          hasError: true, 
          errorInfo: 'WebGL context was lost. Please refresh the page to restore 3D functionality.' 
        })
      }

      const handleContextRestored = () => {
        console.log('WebGL context restored')
        this.setState({ hasError: false, errorInfo: '' })
      }

      // Listen for context lost/restored events
      const canvas = document.querySelector('canvas')
      if (canvas) {
        canvas.addEventListener('webglcontextlost', handleContextLost)
        canvas.addEventListener('webglcontextrestored', handleContextRestored)
        
        // Store reference to remove listeners on unmount
        this.contextLostHandler = handleContextLost
        this.contextRestoredHandler = handleContextRestored
        this.canvasElement = canvas
      }
    }
  }

  componentWillUnmount() {
    // Clean up event listeners
    if (this.canvasElement && this.contextLostHandler && this.contextRestoredHandler) {
      this.canvasElement.removeEventListener('webglcontextlost', this.contextLostHandler)
      this.canvasElement.removeEventListener('webglcontextrestored', this.contextRestoredHandler)
    }
  }

  private contextLostHandler?: EventListener
  private contextRestoredHandler?: EventListener
  private canvasElement?: HTMLCanvasElement

  render() {
    if (this.state.hasError) {
      // Fallback UI when WebGL fails
      return (
        this.props.fallback || (
          <div className="w-full h-full flex items-center justify-center bg-gray-900/50 rounded-xl border border-gray-700">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">3D View Unavailable</h3>
              <p className="text-sm text-gray-400 mb-4">
                {this.state.errorInfo || 'WebGL is not available or has encountered an error.'}
              </p>
              <p className="text-xs text-gray-500">
                Please refresh the page to restore 3D functionality.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}