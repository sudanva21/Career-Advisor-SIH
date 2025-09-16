'use client'

import React, { Suspense, useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Text3DErrorBoundary } from './Text3DErrorBoundary'
import SafeText3D, { Text3DFallback } from './SafeText3D'

// Flag to disable troika-three-text and use safe alternative
const DISABLE_TROIKA_TEXT = true

// More robust error handling function
const handleTroikaError = (error: any, mounted: boolean, setRenderError: Function) => {
  if (error && (
    error.message?.includes('troika') || 
    error.message?.includes('BufferAttribute') ||
    error.message?.includes('getAttribute') ||
    error.message?.includes('count') ||
    error.message?.includes('getIndexAttribute') ||
    error.message?.includes('disposeMaterial') ||
    error.message?.toLowerCase().includes('three') ||
    (typeof error === 'string' && (error.includes('troika') || error.includes('count')))
  )) {
    console.warn('Caught troika text error (handled):', error)
    if (mounted) {
      setRenderError(true)
    }
    // Prevent the error from propagating
    return true
  }
  return false
}

// Create a completely isolated text component
const SafeTextComponent = (props: any) => {
  const {
    font,
    fontWeight,
    fontStyle,
    fontFamily,
    onLoad,
    onError,
    children,
    ...cleanProps
  } = props

  const [TextComponent, setTextComponent] = useState<any>(null)
  const [loadError, setLoadError] = useState(false)
  const [renderError, setRenderError] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    
    const loadTextComponent = async () => {
      try {
        // Add delay to ensure WebGL context is ready
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const dreiModule = await import('@react-three/drei')
        if (!mountedRef.current) return
        
        // Create a completely wrapped and isolated Text component
        const SafeText = (textProps: any) => {
          const textRef = useRef<any>(null)
          const [localError, setLocalError] = useState(false)
          
          // Error boundary effect
          useEffect(() => {
            const handleGlobalError = (event: ErrorEvent) => {
              if (handleTroikaError(event.error || event, mountedRef.current, setLocalError)) {
                event.preventDefault()
                event.stopPropagation()
                return false
              }
            }
            
            const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
              if (handleTroikaError(event.reason, mountedRef.current, setLocalError)) {
                event.preventDefault()
                return false
              }
            }
            
            // Store original handlers
            const originalOnError = window.onerror
            const originalConsoleError = console.error
            
            // Intercept window errors
            window.addEventListener('error', handleGlobalError, true)
            window.addEventListener('unhandledrejection', handleUnhandledRejection, true)
            
            // Override console.error temporarily
            console.error = (...args: any[]) => {
              const errorStr = args.join(' ')
              if (!handleTroikaError(errorStr, mountedRef.current, setLocalError)) {
                originalConsoleError.apply(console, args)
              }
            }
            
            return () => {
              window.removeEventListener('error', handleGlobalError, true)
              window.removeEventListener('unhandledrejection', handleUnhandledRejection, true)
              console.error = originalConsoleError
              window.onerror = originalOnError
            }
          }, [])
          
          // Return fallback if error occurred
          if (localError) {
            return <Text3DFallback position={textProps.position} color={textProps.color}>
              {textProps.children || 'Error Loading Text'}
            </Text3DFallback>
          }
          
          try {
            // Create the most minimal Text component possible
            return React.createElement(dreiModule.Text, {
              ...textProps,
              ref: textRef,
              // Force default font to avoid loading issues
              font: undefined,
              fontPath: undefined,
              fontWeight: undefined,
              fontStyle: undefined,
              fontFamily: undefined,
              // Minimal material properties
              material: undefined,
              materialType: undefined,
              // Safe text properties only
              geometry: undefined,
              // Error handlers
              onSync: undefined,
              onLoad: undefined,
              onError: (error: any) => {
                handleTroikaError(error, mountedRef.current, setLocalError)
              }
            }, textProps.children)
          } catch (error) {
            handleTroikaError(error, mountedRef.current, setLocalError)
            return <Text3DFallback position={textProps.position} color={textProps.color}>
              {textProps.children || 'Error Loading Text'}
            </Text3DFallback>
          }
        }
        
        if (mountedRef.current) {
          setTextComponent(() => SafeText)
        }
      } catch (error) {
        console.warn('Failed to load Text component:', error)
        if (mountedRef.current) {
          setLoadError(true)
        }
      }
    }

    loadTextComponent()
    return () => { 
      mountedRef.current = false
    }
  }, [])

  if (loadError || !TextComponent || renderError) {
    return <Text3DFallback position={props.position} color={props.color}>
      {props.children || 'Error Loading Text'}
    </Text3DFallback>
  }

  try {
    // Ultra-minimal safe props
    const safeTextProps = {
      position: cleanProps.position || [0, 0, 0],
      fontSize: Math.max(cleanProps.fontSize || 0.5, 0.1), // Ensure positive fontSize
      color: cleanProps.color || '#ffffff',
      anchorX: cleanProps.anchorX || 'center',
      anchorY: cleanProps.anchorY || 'middle',
      textAlign: cleanProps.textAlign || 'center',
      maxWidth: Math.max(cleanProps.maxWidth || 10, 1), // Ensure positive maxWidth
      // Explicitly remove all problematic props
      font: undefined,
      fontPath: undefined,
      fontWeight: undefined,
      fontStyle: undefined,
      fontFamily: undefined,
      onLoad: undefined,
      onError: undefined,
      onSync: undefined,
      material: undefined,
      materialType: undefined,
      geometry: undefined,
      outlineWidth: undefined,
      outlineColor: undefined,
      outlineOpacity: undefined,
      strokeWidth: undefined,
      strokeColor: undefined,
      strokeOpacity: undefined,
      // Text-specific safe props
      letterSpacing: undefined,
      lineHeight: undefined,
      whiteSpace: 'normal',
      overflowWrap: 'normal',
      clipRect: undefined,
      depthOffset: undefined,
      direction: undefined,
      gpuAccelerated: false
    }

    return (
      <TextComponent {...safeTextProps}>
        {children}
      </TextComponent>
    )
  } catch (error) {
    handleTroikaError(error, mountedRef.current, setRenderError)
    return <Text3DFallback position={props.position} color={props.color}>
      {props.children || 'Error Loading Text'}
    </Text3DFallback>
  }
}

// Dynamically import with comprehensive error handling
const Text = dynamic(
  () => Promise.resolve({ default: SafeTextComponent }),
  { 
    ssr: false,
    loading: () => <Text3DFallback position={[0, 0, 0]} color="#ffffff">Loading...</Text3DFallback>
  }
)

// Wrapper for Text component that handles SSR issues
interface Text3DWrapperProps {
  children: React.ReactNode
  position?: [number, number, number]
  color?: string
  fontSize?: number
  maxWidth?: number
  textAlign?: 'left' | 'center' | 'right'
  anchorX?: 'left' | 'center' | 'right'
  anchorY?: 'top' | 'middle' | 'bottom'
  [key: string]: any
}

// Safe wrapper component that catches render errors with troika Text
const SafeTextTroika: React.FC<{ 
  props: any;
  fallback: React.ReactNode;
  children: React.ReactNode;
}> = ({ props, fallback, children }) => {
  const mountedRef = useRef(true)
  const [hasError, setHasError] = useState(false)
  
  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])
  
  if (hasError) {
    return <>{fallback}</>
  }
  
  try {
    return (
      <Text {...props}>
        {children}
      </Text>
    )
  } catch (error) {
    if (handleTroikaError(error, mountedRef.current, setHasError)) {
      return <>{fallback}</>
    }
    console.warn('SafeTextTroika caught error:', error)
    return <>{fallback}</>
  }
}

export const Text3DWrapper: React.FC<Text3DWrapperProps> = ({ 
  children,
  position = [0, 0, 0],
  color = '#ffffff',
  fontSize = 1,
  maxWidth = 10,
  textAlign = 'center',
  anchorX = 'center',
  anchorY = 'middle',
  ...props 
}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything on server side
  if (!mounted) {
    return <Text3DFallback position={position} color={color}>
      {children}
    </Text3DFallback>
  }

  // If troika is disabled, use safe alternative directly
  if (DISABLE_TROIKA_TEXT) {
    return (
      <Text3DErrorBoundary 
        fallback={Text3DFallback} 
        fallbackProps={{ position, color }}
      >
        <SafeText3D
          position={position}
          color={color}
          fontSize={fontSize}
          maxWidth={maxWidth}
          textAlign={textAlign}
          anchorX={anchorX}
          anchorY={anchorY}
        >
          {children}
        </SafeText3D>
      </Text3DErrorBoundary>
    )
  }

  // Filter out problematic props that troika-three-text doesn't support
  const {
    fontWeight,
    fontStyle,
    fontFamily,
    font, // Remove font prop to prevent loading issues
    onLoad,
    onError,
    ...safeProps
  } = props

  const filteredProps = {
    position,
    color,
    fontSize,
    maxWidth,
    textAlign,
    anchorX,
    anchorY,
    ...safeProps
  }

  return (
    <Text3DErrorBoundary 
      fallback={Text3DFallback} 
      fallbackProps={{ position, color }}
    >
      <Suspense fallback={<Text3DFallback position={position} color={color}>{children}</Text3DFallback>}>
        <SafeTextTroika props={filteredProps} fallback={<Text3DFallback position={position} color={color}>{children}</Text3DFallback>}>
          {children}
        </SafeTextTroika>
      </Suspense>
    </Text3DErrorBoundary>
  )
}

export default Text3DWrapper