'use client'

import React, { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

interface SafeText3DProps {
  children: React.ReactNode
  position?: [number, number, number]
  color?: string
  fontSize?: number
  maxWidth?: number
  textAlign?: 'left' | 'center' | 'right'
  anchorX?: 'left' | 'center' | 'right'
  anchorY?: 'top' | 'middle' | 'bottom'
}

// Simple 3D text alternative using Canvas-based text rendering
export const SafeText3D: React.FC<SafeText3DProps> = ({
  children,
  position = [0, 0, 0],
  color = '#ffffff',
  fontSize = 1,
  maxWidth = 10,
  textAlign = 'center',
  anchorX = 'center',
  anchorY = 'middle',
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const canvasRef = useRef<HTMLCanvasElement>()
  const textureRef = useRef<THREE.CanvasTexture>()
  
  const text = typeof children === 'string' ? children : String(children || '')

  // Create text texture using canvas
  const { texture, textWidth, textHeight } = useMemo(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
    }
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    
    // Set canvas size (power of 2 for WebGL compatibility)
    canvas.width = 512
    canvas.height = 256
    
    // Set font and measure text
    const fontSizePixels = Math.max(16, fontSize * 32)
    const fontFamily = 'Arial, sans-serif'
    ctx.font = `${fontSizePixels}px ${fontFamily}`
    
    const textMetrics = ctx.measureText(text)
    const actualTextWidth = textMetrics.width
    const actualTextHeight = fontSizePixels
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Set text style
    ctx.fillStyle = color
    ctx.textBaseline = 'middle'
    ctx.textAlign = textAlign as CanvasTextAlign
    
    // Calculate text position
    let textX = canvas.width / 2
    if (textAlign === 'left') textX = 10
    if (textAlign === 'right') textX = canvas.width - 10
    
    const textY = canvas.height / 2
    
    // Draw text with word wrapping if needed
    const maxLineWidth = maxWidth ? (maxWidth * 32) : (canvas.width - 20)
    const words = text.split(' ')
    let line = ''
    let y = textY
    
    if (actualTextWidth <= maxLineWidth) {
      // Single line
      ctx.fillText(text, textX, y)
    } else {
      // Multi-line word wrapping
      const lineHeight = fontSizePixels * 1.2
      y = canvas.height / 2 - (lineHeight / 2)
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' '
        const testWidth = ctx.measureText(testLine).width
        
        if (testWidth > maxLineWidth && i > 0) {
          ctx.fillText(line, textX, y)
          line = words[i] + ' '
          y += lineHeight
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, textX, y)
    }
    
    // Create texture
    const newTexture = new THREE.CanvasTexture(canvas)
    newTexture.minFilter = THREE.LinearFilter
    newTexture.magFilter = THREE.LinearFilter
    newTexture.format = THREE.RGBAFormat
    
    if (textureRef.current) {
      textureRef.current.dispose()
    }
    textureRef.current = newTexture
    
    return {
      texture: newTexture,
      textWidth: actualTextWidth / 100,
      textHeight: actualTextHeight / 100,
    }
  }, [text, color, fontSize, maxWidth, textAlign])

  // Calculate anchor offset
  const anchorOffset = useMemo(() => {
    let offsetX = 0
    let offsetY = 0
    
    if (anchorX === 'left') offsetX = textWidth / 2
    if (anchorX === 'right') offsetX = -textWidth / 2
    
    if (anchorY === 'top') offsetY = -textHeight / 2
    if (anchorY === 'bottom') offsetY = textHeight / 2
    
    return [offsetX, offsetY, 0] as [number, number, number]
  }, [textWidth, textHeight, anchorX, anchorY])

  // Cleanup texture on unmount
  useEffect(() => {
    return () => {
      if (textureRef.current) {
        textureRef.current.dispose()
      }
    }
  }, [])

  return (
    <mesh ref={meshRef} position={[position[0] + anchorOffset[0], position[1] + anchorOffset[1], position[2] + anchorOffset[2]]}>
      <planeGeometry args={[textWidth, textHeight]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        alphaTest={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Simple fallback component for when 3D text fails
export const Text3DFallback: React.FC<SafeText3DProps> = ({ position = [0, 0, 0], color = '#ffffff' }) => (
  <mesh position={position}>
    <sphereGeometry args={[0.1, 8, 8]} />
    <meshBasicMaterial color={color} transparent opacity={0.3} />
  </mesh>
)

export default SafeText3D