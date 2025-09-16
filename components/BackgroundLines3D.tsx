'use client'

import React, { useRef, useMemo } from 'react'
import { useFrame, Canvas } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'

// Create flowing line geometry
function FlowingLine({ points, color = '#00FFFF', opacity = 0.6 }: {
  points: THREE.Vector3[]
  color?: string
  opacity?: number
}) {
  const materialRef = useRef<THREE.LineBasicMaterial>(null)
  
  useFrame(({ clock }) => {
    if (materialRef.current) {
      // Animate opacity for flowing effect
      materialRef.current.opacity = opacity + Math.sin(clock.elapsedTime * 2) * 0.2
    }
  })

  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      transparent
      opacity={opacity}
    />
  )
}

// Floating particles component
function FloatingParticles({ count = 50 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!)

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return positions
  }, [count])

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.elapsedTime * 0.05
      pointsRef.current.rotation.x = clock.elapsedTime * 0.02
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#00FFFF"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Main background scene
function BackgroundScene() {
  // Generate random line paths
  const lines = useMemo(() => {
    const lineData = []
    const colors = ['#00FFFF', '#FF007F', '#8B00FF']
    
    for (let i = 0; i < 8; i++) {
      const points: THREE.Vector3[] = []
      const startX = (Math.random() - 0.5) * 20
      const startY = (Math.random() - 0.5) * 20
      const startZ = (Math.random() - 0.5) * 20
      
      // Create curved line with multiple points
      for (let j = 0; j < 5; j++) {
        const progress = j / 4
        const x = startX + Math.sin(progress * Math.PI * 2) * 5
        const y = startY + Math.cos(progress * Math.PI * 2) * 3
        const z = startZ + progress * 10 - 5
        points.push(new THREE.Vector3(x, y, z))
      }
      
      lineData.push({
        points,
        color: colors[i % colors.length],
        opacity: 0.3 + Math.random() * 0.4
      })
    }
    
    return lineData
  }, [])

  return (
    <group>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} color="#00FFFF" intensity={0.5} />
      
      {/* Floating particles */}
      <FloatingParticles count={100} />
      
      {/* Flowing lines */}
      {lines.map((line, index) => (
        <FlowingLine
          key={index}
          points={line.points}
          color={line.color}
          opacity={line.opacity}
        />
      ))}
    </group>
  )
}

// Main component
const BackgroundLines3D: React.FC = () => {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <BackgroundScene />
      </Canvas>
    </div>
  )
}

export default BackgroundLines3D