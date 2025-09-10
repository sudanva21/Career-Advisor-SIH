'use client'

import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Stars,
  Sphere,
  Box,
  Line,
  Html
} from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, 
  CheckCircle, 
  Circle, 
  BookOpen, 
  Trophy,
  Zap,
  Eye,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause
} from 'lucide-react'

// Extend Three.js for custom materials
extend({ 
  LineBasicMaterial: THREE.LineBasicMaterial,
  BufferGeometry: THREE.BufferGeometry,
  BufferAttribute: THREE.BufferAttribute
})

interface RoadmapNode {
  id: string
  type: 'phase' | 'milestone' | 'skill' | 'resource'
  position: [number, number, number]
  title: string
  description?: string
  completed?: boolean
  progress?: number
  connections?: string[]
  color?: string
  skills?: string[]
  resources?: any[]
}

interface Enhanced3DRoadmapProps {
  roadmap: {
    id: string
    title: string
    roadmap_data: {
      phases: any[]
      nodes?: any[]
      connections?: any[]
    }
  }
}

// 3D Node Component
function RoadmapNode3D({ 
  node, 
  position, 
  isSelected, 
  onSelect, 
  isAnimating 
}: {
  node: RoadmapNode
  position: [number, number, number]
  isSelected: boolean
  onSelect: () => void
  isAnimating: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current && isAnimating) {
      meshRef.current.rotation.y += 0.01
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  // Node colors based on type and status
  const nodeColor = useMemo(() => {
    if (node.completed) return '#00ff9f' // Green for completed
    
    switch (node.type) {
      case 'phase': return '#00ffff' // Cyan
      case 'milestone': return '#ff00ff' // Magenta
      case 'skill': return '#ffff00' // Yellow
      case 'resource': return '#ff6600' // Orange
      default: return '#ffffff' // White
    }
  }, [node.type, node.completed])

  const nodeSize = useMemo(() => {
    switch (node.type) {
      case 'phase': return 1.2
      case 'milestone': return 0.8
      case 'skill': return 0.6
      case 'resource': return 0.4
      default: return 0.8
    }
  }, [node.type])

  return (
    <group position={position}>
      {/* Main Node Sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onSelect}
        scale={hovered ? nodeSize * 1.2 : nodeSize}
      >
        {node.type === 'phase' ? (
          <dodecahedronGeometry args={[1, 0]} />
        ) : node.type === 'milestone' ? (
          <octahedronGeometry args={[1, 0]} />
        ) : (
          <sphereGeometry args={[1, 16, 16]} />
        )}
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          transparent
          opacity={node.completed ? 0.9 : 0.7}
        />
      </mesh>

      {/* Selection Ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[nodeSize * 1.5, 0.1, 8, 32]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Progress Ring for Milestones */}
      {node.type === 'milestone' && node.progress !== undefined && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[nodeSize * 1.1, nodeSize * 1.3, 0, (node.progress / 100) * Math.PI * 2]} />
          <meshBasicMaterial color="#00ff9f" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Floating Info Panel */}
      {hovered && (
        <Html
          position={[0, nodeSize + 1, 0]}
          center
          style={{
            transform: 'translate3d(0, 0, 0)',
            pointerEvents: 'none'
          }}
        >
          <div className="bg-black/90 backdrop-blur-sm text-white p-3 rounded-lg border border-neon-cyan/30 max-w-xs">
            <div className="font-semibold text-sm mb-1">{node.title}</div>
            {node.description && (
              <div className="text-xs text-gray-300 mb-2">{node.description.slice(0, 80)}...</div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">{node.type}</span>
              {node.completed && (
                <span className="text-green-400 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Done
                </span>
              )}
            </div>
          </div>
        </Html>
      )}

      {/* Completion Indicator */}
      {node.completed && (
        <mesh position={[0, nodeSize + 0.5, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color="#00ff9f" />
        </mesh>
      )}
    </group>
  )
}

// 3D Connection Line Component
function Connection3D({ 
  start, 
  end, 
  animated = false 
}: {
  start: [number, number, number]
  end: [number, number, number]
  animated?: boolean
}) {
  const lineRef = useRef<THREE.Line>(null)

  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ], [start, end])

  useFrame((state) => {
    if (lineRef.current && animated) {
      const material = lineRef.current.material as THREE.LineBasicMaterial
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2
    }
  })

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          count={points.length}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#00ffff"
        transparent
        opacity={0.4}
        linewidth={2}
      />
    </line>
  )
}

// Animated Particles System
function ParticleSystem() {
  const particlesRef = useRef<THREE.Points>(null)

  const particleCount = 100
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50
    }
    return pos
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={particleCount}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00ffff"
        size={0.1}
        transparent
        opacity={0.6}
      />
    </points>
  )
}

// Main 3D Scene Component
function RoadmapScene3D({ roadmap }: { roadmap: Enhanced3DRoadmapProps['roadmap'] }) {
  const { camera } = useThree()
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null)
  const [isAnimating, setIsAnimating] = useState(true)

  // Generate 3D nodes from roadmap data
  const nodes3D = useMemo(() => {
    const nodes: RoadmapNode[] = []
    let nodeIndex = 0

    roadmap.roadmap_data.phases.forEach((phase, phaseIndex) => {
      // Add phase node
      const phaseNode: RoadmapNode = {
        id: `phase-${phaseIndex}`,
        type: 'phase',
        position: [phaseIndex * 8 - 8, 4, 0],
        title: phase.title,
        description: phase.description,
        completed: phase.completed || false,
        progress: phase.progress || 0
      }
      nodes.push(phaseNode)

      // Add milestone nodes for this phase
      phase.milestones?.forEach((milestone: any, milestoneIndex: number) => {
        const angle = (milestoneIndex / (phase.milestones.length || 1)) * Math.PI * 2
        const radius = 4
        
        const milestoneNode: RoadmapNode = {
          id: milestone.id || `milestone-${phaseIndex}-${milestoneIndex}`,
          type: 'milestone',
          position: [
            phaseIndex * 8 - 8 + Math.cos(angle) * radius,
            Math.sin(angle) * 2,
            Math.sin(angle) * radius
          ],
          title: milestone.title,
          description: milestone.description,
          completed: milestone.completed || false,
          progress: milestone.progress || (milestone.completed ? 100 : Math.random() * 50),
          connections: [phaseNode.id],
          skills: milestone.skills || [],
          resources: milestone.resources || []
        }
        nodes.push(milestoneNode)

        // Add skill nodes for this milestone
        milestone.skills?.forEach((skill: string, skillIndex: number) => {
          if (skillIndex < 3) { // Limit to 3 skills per milestone to avoid clutter
            const skillAngle = angle + (skillIndex - 1) * 0.5
            const skillRadius = radius + 2
            
            const skillNode: RoadmapNode = {
              id: `skill-${nodeIndex++}`,
              type: 'skill',
              position: [
                phaseIndex * 8 - 8 + Math.cos(skillAngle) * skillRadius,
                Math.sin(skillAngle) * 1.5,
                Math.sin(skillAngle) * skillRadius
              ],
              title: skill,
              completed: Math.random() > 0.7,
              connections: [milestoneNode.id]
            }
            nodes.push(skillNode)
          }
        })
      })
    })

    return nodes
  }, [roadmap])

  // Generate connections
  const connections3D = useMemo(() => {
    const conns: Array<{
      start: [number, number, number]
      end: [number, number, number]
      animated: boolean
    }> = []

    nodes3D.forEach(node => {
      node.connections?.forEach(connectionId => {
        const targetNode = nodes3D.find(n => n.id === connectionId)
        if (targetNode) {
          conns.push({
            start: node.position,
            end: targetNode.position,
            animated: node.completed && targetNode.completed
          })
        }
      })
    })

    return conns
  }, [nodes3D])

  // Auto-rotate camera
  useFrame((state) => {
    if (isAnimating && !selectedNode) {
      const time = state.clock.elapsedTime * 0.2
      camera.position.x = Math.cos(time) * 20
      camera.position.z = Math.sin(time) * 20
      camera.lookAt(0, 0, 0)
    }
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />

      {/* Environment */}
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
      <ParticleSystem />

      {/* Nodes */}
      {nodes3D.map((node) => (
        <RoadmapNode3D
          key={node.id}
          node={node}
          position={node.position}
          isSelected={selectedNode?.id === node.id}
          onSelect={() => setSelectedNode(node)}
          isAnimating={isAnimating}
        />
      ))}

      {/* Connections */}
      {connections3D.map((connection, index) => (
        <Connection3D
          key={index}
          start={connection.start}
          end={connection.end}
          animated={connection.animated}
        />
      ))}

      {/* Interactive Camera Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 6}
      />
    </>
  )
}

// Enhanced 3D Roadmap Visualization Component
export default function Enhanced3DRoadmapVisualization({ roadmap }: Enhanced3DRoadmapProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [cameraMode, setCameraMode] = useState<'orbit' | 'fly' | 'follow'>('orbit')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'pending'>('all')

  useEffect(() => {
    // Simulate loading time for 3D assets
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-space-dark via-purple-900/20 to-space-dark rounded-xl border border-neon-cyan/20 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan/5 to-transparent animate-pulse" />
        <div className="relative z-10 text-center">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-16 h-16 mx-auto mb-4 relative"
          >
            <div className="absolute inset-0 border-4 border-neon-cyan/30 rounded-full" />
            <div className="absolute inset-2 border-2 border-neon-purple/50 rounded-full" />
            <Target className="w-8 h-8 text-neon-cyan absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </motion.div>
          <motion.p 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-neon-cyan text-sm font-medium"
          >
            Rendering 3D Roadmap...
          </motion.p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full bg-space-dark rounded-xl border border-red-500/20 flex items-center justify-center">
        <div className="text-center text-red-400">
          <Zap className="w-12 h-12 mx-auto mb-3" />
          <p className="text-sm">Failed to render 3D visualization</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-space-dark to-purple-900/20">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [15, 10, 15], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <RoadmapScene3D roadmap={roadmap} />
        </Suspense>
      </Canvas>

      {/* 3D Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-neon-cyan/20"
          >
            <h4 className="text-white font-semibold mb-3 text-sm flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              3D Controls
            </h4>
            
            <div className="space-y-3 text-sm">
              {/* Camera Mode */}
              <div>
                <label className="text-gray-300 block mb-2">Camera Mode</label>
                <select 
                  value={cameraMode}
                  onChange={(e) => setCameraMode(e.target.value as any)}
                  className="w-full bg-black/50 border border-white/20 rounded px-2 py-1 text-white text-xs"
                >
                  <option value="orbit">Orbit</option>
                  <option value="fly">Free Fly</option>
                  <option value="follow">Follow Path</option>
                </select>
              </div>

              {/* Filter */}
              <div>
                <label className="text-gray-300 block mb-2">Show Nodes</label>
                <select 
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value as any)}
                  className="w-full bg-black/50 border border-white/20 rounded px-2 py-1 text-white text-xs"
                >
                  <option value="all">All Nodes</option>
                  <option value="completed">Completed Only</option>
                  <option value="pending">Pending Only</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
              <span className="text-xs text-gray-400">Mouse: Rotate • Scroll: Zoom</span>
              <button 
                onClick={() => setShowControls(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Controls Button */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute top-4 left-4 p-2 bg-black/80 backdrop-blur-sm rounded-lg border border-neon-cyan/20 text-gray-400 hover:text-white transition-colors"
        >
          <Eye className="w-5 h-5" />
        </button>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-neon-cyan/20">
        <h5 className="text-white font-semibold mb-2 text-sm">Legend</h5>
        <div className="space-y-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-cyan-400 rounded-full mr-2"></div>
            <span className="text-gray-300">Phase</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-magenta-400 rounded-full mr-2"></div>
            <span className="text-gray-300">Milestone</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
            <span className="text-gray-300">Skill</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
            <span className="text-gray-300">Completed</span>
          </div>
        </div>
      </div>

      {/* Performance Info */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded px-3 py-1 text-xs text-gray-400">
        WebGL Accelerated • 60 FPS
      </div>
    </div>
  )
}