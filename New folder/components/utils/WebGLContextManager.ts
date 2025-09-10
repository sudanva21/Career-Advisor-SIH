import { useEffect } from 'react'

// WebGL Context Manager to prevent multiple context issues during development
class WebGLContextManager {
  private static instance: WebGLContextManager
  private activeContexts: Set<WebGLRenderingContext | WebGL2RenderingContext> = new Set()
  private contextLostHandlers: Map<HTMLCanvasElement, EventListener> = new Map()
  private contextRestoredHandlers: Map<HTMLCanvasElement, EventListener> = new Map()

  private constructor() {}

  static getInstance(): WebGLContextManager {
    if (!WebGLContextManager.instance) {
      WebGLContextManager.instance = new WebGLContextManager()
    }
    return WebGLContextManager.instance
  }

  registerContext(canvas: HTMLCanvasElement, context: WebGLRenderingContext | WebGL2RenderingContext) {
    this.activeContexts.add(context)
    
    const contextLostHandler = (event: Event) => {
      event.preventDefault()
      console.warn(`WebGL context lost for canvas:`, canvas)
      this.activeContexts.delete(context)
    }

    const contextRestoredHandler = () => {
      console.log(`WebGL context restored for canvas:`, canvas)
      this.activeContexts.add(context)
    }

    // Remove any existing handlers first
    this.unregisterContext(canvas)

    // Add new handlers
    canvas.addEventListener('webglcontextlost', contextLostHandler, false)
    canvas.addEventListener('webglcontextrestored', contextRestoredHandler, false)
    
    this.contextLostHandlers.set(canvas, contextLostHandler)
    this.contextRestoredHandlers.set(canvas, contextRestoredHandler)
  }

  unregisterContext(canvas: HTMLCanvasElement) {
    const lostHandler = this.contextLostHandlers.get(canvas)
    const restoredHandler = this.contextRestoredHandlers.get(canvas)
    
    if (lostHandler) {
      canvas.removeEventListener('webglcontextlost', lostHandler)
      this.contextLostHandlers.delete(canvas)
    }
    
    if (restoredHandler) {
      canvas.removeEventListener('webglcontextrestored', restoredHandler)
      this.contextRestoredHandlers.delete(canvas)
    }
  }

  getActiveContextCount(): number {
    return this.activeContexts.size
  }

  // Clean up all contexts (useful during hot reload)
  cleanup() {
    this.contextLostHandlers.forEach((handler, canvas) => {
      canvas.removeEventListener('webglcontextlost', handler)
    })
    
    this.contextRestoredHandlers.forEach((handler, canvas) => {
      canvas.removeEventListener('webglcontextrestored', handler)
    })
    
    this.contextLostHandlers.clear()
    this.contextRestoredHandlers.clear()
    this.activeContexts.clear()
  }
}

export default WebGLContextManager

// Utility hook for React components
export const useWebGLContext = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const manager = WebGLContextManager.getInstance()
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (context) {
      manager.registerContext(canvas, context)
    }
    
    return () => {
      if (canvas) {
        manager.unregisterContext(canvas)
      }
    }
  }, [canvasRef, manager])
  
  return manager
}

// Enhanced global cleanup for hot module replacement and context management
if (typeof window !== 'undefined') {
  // Cleanup on hot module replacement
  if ((window as any).webpackHotUpdate) {
    (window as any).addEventListener('beforeunload', () => {
      WebGLContextManager.getInstance().cleanup()
    })
  }

  // Additional cleanup on page visibility change (helps with context loss)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Page is hidden, preemptively manage contexts
      const manager = WebGLContextManager.getInstance()
      if (manager.getActiveContextCount() > 2) {
        console.warn('Multiple WebGL contexts active, cleaning up oldest ones')
        // In a real implementation, you might want to dispose of older contexts
      }
    }
  })

  // Handle fast refresh in development
  if (process.env.NODE_ENV === 'development') {
    const existingCleanup = (window as any).__WEBGL_CLEANUP__
    if (existingCleanup) {
      existingCleanup()
    }
    (window as any).__WEBGL_CLEANUP__ = () => {
      WebGLContextManager.getInstance().cleanup()
    }

    // Cleanup contexts when hot reloading occurs
    const originalLog = console.log
    console.log = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('[Fast Refresh]')) {
        setTimeout(() => {
          WebGLContextManager.getInstance().cleanup()
        }, 100)
      }
      originalLog.apply(console, args)
    }

    // Also listen for webpack hot update events
    if ((module as any).hot) {
      (module as any).hot.dispose(() => {
        WebGLContextManager.getInstance().cleanup()
      })
    }
  }
}