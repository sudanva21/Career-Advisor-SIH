'use client'

import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, Canvas, useThree } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

// Mouse tracking for parallax
function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      })
    }

    window.addEventListener('mousemove', updateMousePosition)
    return () => window.removeEventListener('mousemove', updateMousePosition)
  }, [])

  return mousePosition
}

// Scroll tracking for parallax
function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const updateScrollPosition = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', updateScrollPosition)
    return () => window.removeEventListener('scroll', updateScrollPosition)
  }, [])

  return scrollY
}

// 3D Network Node Component
function NetworkNode({ 
  position, 
  color = '#00FFFF', 
  size = 0.05,
  pulseSpeed = 1 
}: {
  position: [number, number, number]
  color?: string
  size?: number
  pulseSpeed?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const innerMeshRef = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    if (meshRef.current && innerMeshRef.current) {
      const time = clock.elapsedTime * pulseSpeed
      
      // Pulsing effect
      const pulse = 1 + 0.3 * Math.sin(time * 2)
      meshRef.current.scale.setScalar(pulse)
      
      // Inner core rotation
      innerMeshRef.current.rotation.x = time * 0.5
      innerMeshRef.current.rotation.y = time * 0.3
      
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(time) * 0.1
    }
  })

  return (
    <group position={position}>
      {/* Outer glow */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size * 2, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Inner core */}
      <mesh ref={innerMeshRef}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  )
}

// 3D Network Connection Line
function NetworkConnection({ 
  start, 
  end, 
  color = '#00FFFF',
  animated = true 
}: {
  start: [number, number, number]
  end: [number, number, number]
  color?: string
  animated?: boolean
}) {
  const lineRef = useRef<THREE.Line>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)

  // Custom shader for animated flowing effect
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(color) },
        opacity: { value: 0.6 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float opacity;
        varying vec2 vUv;
        
        void main() {
          float wave = sin(vUv.x * 10.0 - time * 3.0) * 0.5 + 0.5;
          float alpha = wave * opacity;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    })
  }, [color])

  useFrame(({ clock }) => {
    if (materialRef.current && animated) {
      materialRef.current.uniforms.time.value = clock.elapsedTime
    }
  })

  const points = useMemo(() => {
    return [new THREE.Vector3(...start), new THREE.Vector3(...end)]
  }, [start, end])

  return (
    <line ref={lineRef as any}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([...start, ...end])}
          itemSize={3}
        />
      </bufferGeometry>
      <primitive object={shaderMaterial} ref={materialRef} />
    </line>
  )
}

// Particle System for Energy Streams
function EnergyParticles({ count = 200 }: { count?: number }) {
  const particlesRef = useRef<THREE.Points>(null!)
  const positionsRef = useRef<Float32Array>()
  const velocitiesRef = useRef<Float32Array>()
  const colorsRef = useRef<Float32Array>()

  const colorPalette = [
    new THREE.Color('#00FFFF'), // Cyan
    new THREE.Color('#FF007F'), // Magenta
    new THREE.Color('#8B00FF'), // Violet
    new THREE.Color('#0066FF')  // Blue
  ]

  useMemo(() => {
    positionsRef.current = new Float32Array(count * 3)
    velocitiesRef.current = new Float32Array(count * 3)
    colorsRef.current = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // Random positions in a large sphere
      const r = Math.random() * 15
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      positionsRef.current[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positionsRef.current[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positionsRef.current[i * 3 + 2] = r * Math.cos(phi)

      // Random velocities
      velocitiesRef.current[i * 3] = (Math.random() - 0.5) * 0.02
      velocitiesRef.current[i * 3 + 1] = (Math.random() - 0.5) * 0.02
      velocitiesRef.current[i * 3 + 2] = (Math.random() - 0.5) * 0.02

      // Random colors from palette
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      colorsRef.current[i * 3] = color.r
      colorsRef.current[i * 3 + 1] = color.g
      colorsRef.current[i * 3 + 2] = color.b
    }
  }, [count])

  useFrame(() => {
    if (particlesRef.current && positionsRef.current && velocitiesRef.current) {
      for (let i = 0; i < count; i++) {
        // Update positions
        positionsRef.current[i * 3] += velocitiesRef.current[i * 3]
        positionsRef.current[i * 3 + 1] += velocitiesRef.current[i * 3 + 1]
        positionsRef.current[i * 3 + 2] += velocitiesRef.current[i * 3 + 2]

        // Boundary check - reset if too far
        const x = positionsRef.current[i * 3]
        const y = positionsRef.current[i * 3 + 1]
        const z = positionsRef.current[i * 3 + 2]
        
        if (x * x + y * y + z * z > 225) { // 15^2
          const r = Math.random() * 5
          const theta = Math.random() * Math.PI * 2
          const phi = Math.random() * Math.PI

          positionsRef.current[i * 3] = r * Math.sin(phi) * Math.cos(theta)
          positionsRef.current[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
          positionsRef.current[i * 3 + 2] = r * Math.cos(phi)
        }
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positionsRef.current!}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colorsRef.current!}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  )
}

// Main 3D Network System
function NetworkSystem() {
  const groupRef = useRef<THREE.Group>(null!)
  const mousePos = useMousePosition()
  const scrollY = useScrollPosition()

  // Generate network nodes and connections
  const networkData = useMemo(() => {
    const nodes: Array<{
      position: [number, number, number]
      color: string
      size: number
      pulseSpeed: number
    }> = []
    
    const connections: Array<{
      start: [number, number, number]
      end: [number, number, number]
      color: string
    }> = []

    const colors = ['#00FFFF', '#FF007F', '#8B00FF', '#0066FF']
    const nodeCount = 25

    // Create nodes in 3D space
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2
      const radius = 3 + Math.random() * 4
      const height = (Math.random() - 0.5) * 6
      
      const position: [number, number, number] = [
        Math.cos(angle) * radius + (Math.random() - 0.5) * 2,
        height,
        Math.sin(angle) * radius + (Math.random() - 0.5) * 2
      ]

      nodes.push({
        position,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 0.03 + Math.random() * 0.04,
        pulseSpeed: 0.5 + Math.random() * 1.5
      })
    }

    // Create connections between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = Math.sqrt(
          Math.pow(nodes[i].position[0] - nodes[j].position[0], 2) +
          Math.pow(nodes[i].position[1] - nodes[j].position[1], 2) +
          Math.pow(nodes[i].position[2] - nodes[j].position[2], 2)
        )

        if (distance < 3 && Math.random() > 0.4) {
          connections.push({
            start: nodes[i].position,
            end: nodes[j].position,
            color: Math.random() > 0.5 ? nodes[i].color : nodes[j].color
          })
        }
      }
    }

    return { nodes, connections }
  }, [])

  // Mouse and scroll interactivity with parallax
  useFrame(({ clock, camera }) => {
    if (!groupRef.current) return

    const time = clock.elapsedTime

    // Subtle rotation based on mouse position
    groupRef.current.rotation.y = mousePos.x * 0.2 + time * 0.05
    groupRef.current.rotation.x = mousePos.y * 0.1

    // Scroll-based parallax movement
    groupRef.current.position.z = scrollY * 0.001
    groupRef.current.position.y = -scrollY * 0.002

    // Camera subtle movement for depth
    camera.position.x += (mousePos.x * 1 - camera.position.x) * 0.05
    camera.position.y += (mousePos.y * 0.5 - camera.position.y) * 0.05

    // Breathing effect
    const breathe = 1 + Math.sin(time * 0.3) * 0.1
    groupRef.current.scale.setScalar(breathe)
  })

  return (
    <group ref={groupRef}>
      {/* Network Nodes */}
      {networkData.nodes.map((node, index) => (
        <NetworkNode
          key={`node-${index}`}
          position={node.position}
          color={node.color}
          size={node.size}
          pulseSpeed={node.pulseSpeed}
        />
      ))}

      {/* Network Connections */}
      {networkData.connections.map((connection, index) => (
        <NetworkConnection
          key={`connection-${index}`}
          start={connection.start}
          end={connection.end}
          color={connection.color}
        />
      ))}
    </group>
  )
}

// Background Grid with Depth
function DepthGrid() {
  const gridRef = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    if (!gridRef.current) return
    gridRef.current.rotation.y = clock.elapsedTime * 0.01
    gridRef.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.2
  })

  const gridLines = useMemo(() => {
    const lines = []
    const layers = 3
    
    for (let layer = 0; layer < layers; layer++) {
      const z = -8 - layer * 4
      const size = 15 + layer * 5
      const divisions = 20
      const step = size / divisions
      const opacity = 0.1 - layer * 0.03
      
      // Horizontal lines
      for (let i = 0; i <= divisions; i++) {
        const y = (i * step) - size/2
        lines.push({
          points: [
            new THREE.Vector3(-size/2, y, z),
            new THREE.Vector3(size/2, y, z)
          ],
          opacity: Math.max(0.02, opacity - Math.abs(y) / size * 0.1)
        })
      }
      
      // Vertical lines
      for (let i = 0; i <= divisions; i++) {
        const x = (i * step) - size/2
        lines.push({
          points: [
            new THREE.Vector3(x, -size/2, z),
            new THREE.Vector3(x, size/2, z)
          ],
          opacity: Math.max(0.02, opacity - Math.abs(x) / size * 0.1)
        })
      }
    }
    
    return lines
  }, [])

  return (
    <group ref={gridRef}>
      {gridLines.map((line, index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                ...line.points[0].toArray(),
                ...line.points[1].toArray()
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#00FFFF"
            transparent
            opacity={line.opacity}
          />
        </line>
      ))}
    </group>
  )
}

// Main 3D Scene
function HeroScene() {
  const { camera } = useThree()

  useEffect(() => {
    // Set initial camera position for better depth perception
    camera.position.set(0, 2, 12)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return (
    <group>
      {/* Enhanced atmospheric lighting */}
      <ambientLight intensity={0.1} color="#001122" />
      <pointLight position={[8, 8, 8]} color="#00FFFF" intensity={0.3} distance={20} />
      <pointLight position={[-8, -8, 4]} color="#8B00FF" intensity={0.2} distance={15} />
      <pointLight position={[0, 8, -8]} color="#FF007F" intensity={0.25} distance={18} />
      <pointLight position={[4, -4, 6]} color="#0066FF" intensity={0.2} distance={12} />
      
      {/* Background depth grid */}
      <DepthGrid />
      
      {/* Energy particle system */}
      <EnergyParticles count={150} />
      
      {/* Main network system */}
      <NetworkSystem />
      
      {/* Floating accent particles */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <EnergyParticles count={50} />
      </Float>
    </group>
  )
}

// Fallback for non-WebGL browsers
function FallbackBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 opacity-40">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-px bg-gradient-to-t ${
              i % 4 === 0 ? 'from-cyan-400/30 to-transparent' :
              i % 4 === 1 ? 'from-purple-400/30 to-transparent' :
              i % 4 === 2 ? 'from-pink-400/30 to-transparent' :
              'from-blue-400/30 to-transparent'
            } animate-pulse`}
            style={{
              left: `${Math.random() * 100}%`,
              height: `${50 + Math.random() * 50}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Main Component Export
export default function HeroLines3D() {
  const [webglSupported, setWebglSupported] = useState(true)

  useEffect(() => {
    // Check WebGL support
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setWebglSupported(false)
      }
    } catch (e) {
      setWebglSupported(false)
    }
  }, [])

  if (!webglSupported) {
    return <FallbackBackground />
  }

  return (
    <div className="absolute inset-0 opacity-90">
      <Canvas
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        }}
        dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
        camera={{
          position: [0, 2, 12],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
      >
        <HeroScene />
      </Canvas>
    </div>
  )
}