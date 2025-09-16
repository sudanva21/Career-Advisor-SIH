'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Line, Sphere } from '@react-three/drei'
import Text3DWrapper from '../Text3DWrapper'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'

interface RoadmapNode {
  id: string
  title: string
  type: 'skill' | 'project' | 'certification' | 'course' | 'internship' | 'job'
  status: 'locked' | 'available' | 'in_progress' | 'completed'
  position: [number, number, number]
  connections: string[]
  description: string
  duration?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  resources?: string[]
  prerequisites?: string[]
}

// 3D Roadmap Node Component
function RoadmapNode3D({ 
  node, 
  isSelected, 
  onSelect 
}: { 
  node: RoadmapNode
  isSelected: boolean
  onSelect: (node: RoadmapNode) => void 
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)

  // Node appearance based on type and status
  const getNodeAppearance = () => {
    const typeShapes = {
      skill: 'octahedron',
      project: 'box',
      certification: 'dodecahedron',
      course: 'sphere',
      internship: 'cylinder',
      job: 'cone'
    }

    const statusColors = {
      locked: '#666666',
      available: '#00FFFF',
      in_progress: '#FFD700',
      completed: '#00FF7F'
    }

    return {
      shape: typeShapes[node.type],
      color: statusColors[node.status],
      emissiveIntensity: node.status === 'completed' ? 0.5 : node.status === 'in_progress' ? 0.3 : 0.1
    }
  }

  const appearance = getNodeAppearance()

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Pulsing animation for available and in-progress nodes
      if (node.status === 'available' || node.status === 'in_progress') {
        const pulse = 1 + Math.sin(clock.elapsedTime * 3) * 0.1
        meshRef.current.scale.setScalar(pulse)
      }

      // Rotation for selected node
      if (isSelected) {
        meshRef.current.rotation.y = clock.elapsedTime * 2
      }
    }
  })

  const renderGeometry = () => {
    const size = 0.3
    switch (appearance.shape) {
      case 'octahedron':
        return <octahedronGeometry args={[size]} />
      case 'box':
        return <boxGeometry args={[size, size, size]} />
      case 'dodecahedron':
        return <dodecahedronGeometry args={[size]} />
      case 'sphere':
        return <sphereGeometry args={[size]} />
      case 'cylinder':
        return <cylinderGeometry args={[size * 0.7, size * 0.7, size * 1.2]} />
      case 'cone':
        return <coneGeometry args={[size, size * 1.5]} />
      default:
        return <sphereGeometry args={[size]} />
    }
  }

  return (
    <group position={node.position}>
      <Float 
        speed={node.status === 'in_progress' ? 3 : 1} 
        rotationIntensity={0.2} 
        floatIntensity={0.1}
      >
        <mesh
          ref={meshRef}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onClick={() => onSelect(node)}
          castShadow
          receiveShadow
        >
          {renderGeometry()}
          <meshStandardMaterial
            color={appearance.color}
            emissive={appearance.color}
            emissiveIntensity={hovered || isSelected ? appearance.emissiveIntensity + 0.2 : appearance.emissiveIntensity}
            transparent
            opacity={node.status === 'locked' ? 0.5 : 0.9}
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>

        {/* Status Indicator Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <ringGeometry args={[0.4, 0.45, 16]} />
          <meshBasicMaterial
            color={appearance.color}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Node Title */}
        <Text3DWrapper
          position={[0, 0.6, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
        >
          {node.title}
        </Text3DWrapper>

        {/* Type Badge */}
        <Text3DWrapper
          position={[0, -0.5, 0]}
          fontSize={0.1}
          color={appearance.color}
          anchorX="center"
          anchorY="middle"
        >
          {node.type.toUpperCase()}
        </Text3DWrapper>

        {/* Completion Glow */}
        {node.status === 'completed' && (
          <mesh>
            <sphereGeometry args={[0.6, 32, 32]} />
            <meshBasicMaterial
              color="#00FF7F"
              transparent
              opacity={0.2}
              side={THREE.BackSide}
            />
          </mesh>
        )}

        {/* Selection Highlight */}
        {isSelected && (
          <mesh>
            <sphereGeometry args={[0.8, 32, 32]} />
            <meshBasicMaterial
              color="#FFFFFF"
              transparent
              opacity={0.1}
              side={THREE.BackSide}
            />
          </mesh>
        )}

        {/* Lock Icon for locked nodes */}
        {node.status === 'locked' && (
          <Text3DWrapper
            position={[0, 0, 0.4]}
            fontSize={0.2}
            color="#666666"
            anchorX="center"
            anchorY="middle"
          >
            🔒
          </Text3DWrapper>
        )}
      </Float>
    </group>
  )
}

// Roadmap Connections Component
function RoadmapConnections({ nodes, selectedNode }: { 
  nodes: RoadmapNode[]
  selectedNode: RoadmapNode | null 
}) {
  const connections = useMemo(() => {
    const lines: Array<{ from: RoadmapNode, to: RoadmapNode, isPath: boolean }> = []
    
    nodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const connectedNode = nodes.find(n => n.id === connectionId)
        if (connectedNode) {
          const isPath = Boolean(selectedNode && 
            (node.id === selectedNode.id || connectedNode.id === selectedNode.id))
          lines.push({ from: node, to: connectedNode, isPath })
        }
      })
    })
    
    return lines
  }, [nodes, selectedNode])

  return (
    <>
      {connections.map((connection, index) => {
        const isCompleted = connection.from.status === 'completed' && 
                           connection.to.status === 'completed'
        
        return (
          <Line
            key={index}
            points={[connection.from.position, connection.to.position]}
            color={
              connection.isPath ? "#FFFFFF" :
              isCompleted ? "#00FF7F" : "#444444"
            }
            lineWidth={connection.isPath ? 5 : isCompleted ? 3 : 2}
            transparent
            opacity={connection.isPath ? 1 : isCompleted ? 0.8 : 0.4}
            dashed={connection.from.status === 'locked' || connection.to.status === 'locked'}
            dashSize={0.1}
            gapSize={0.05}
          />
        )
      })}
    </>
  )
}

// Progress Stats Component
function ProgressStats({ nodes }: { nodes: RoadmapNode[] }) {
  const stats = useMemo(() => {
    const total = nodes.length
    const completed = nodes.filter(n => n.status === 'completed').length
    const inProgress = nodes.filter(n => n.status === 'in_progress').length
    const available = nodes.filter(n => n.status === 'available').length
    
    return {
      total,
      completed,
      inProgress,
      available,
      completionRate: Math.round((completed / total) * 100)
    }
  }, [nodes])

  return (
    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 space-y-3">
      <h4 className="text-white font-semibold text-sm">Roadmap Progress</h4>
      
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Overall Progress</span>
          <span>{stats.completionRate}%</span>
        </div>
        <div className="w-32 bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-neon-cyan to-green-500 rounded-full h-2 transition-all duration-500"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>

      {/* Status Counts */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-400">Completed</span>
          </div>
          <span className="text-white font-medium">{stats.completed}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span className="text-gray-400">In Progress</span>
          </div>
          <span className="text-white font-medium">{stats.inProgress}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full" />
            <span className="text-gray-400">Available</span>
          </div>
          <span className="text-white font-medium">{stats.available}</span>
        </div>
      </div>
    </div>
  )
}

// Node Detail Panel
function NodeDetailPanel({ node, onClose, onAction }: { 
  node: RoadmapNode | null
  onClose: () => void
  onAction: (action: 'start' | 'continue' | 'complete', nodeId: string) => void
}) {
  if (!node) return null

  const getActionButton = () => {
    switch (node.status) {
      case 'available':
        return (
          <button
            onClick={() => onAction('start', node.id)}
            className="w-full px-4 py-2 bg-neon-cyan text-black rounded-lg font-semibold hover:bg-neon-cyan/80 transition-colors"
          >
            Start Learning
          </button>
        )
      case 'in_progress':
        return (
          <div className="space-y-2">
            <button
              onClick={() => onAction('continue', node.id)}
              className="w-full px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
            >
              Continue
            </button>
            <button
              onClick={() => onAction('complete', node.id)}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-400 transition-colors"
            >
              Mark Complete
            </button>
          </div>
        )
      case 'completed':
        return (
          <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-center font-semibold">
            ✓ Completed
          </div>
        )
      case 'locked':
        return (
          <div className="px-4 py-2 bg-gray-700/50 text-gray-400 rounded-lg text-center">
            🔒 Locked
          </div>
        )
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ duration: 0.3 }}
        className="absolute top-4 right-4 bg-black/90 backdrop-blur-xl rounded-lg p-6 w-80 border border-gray-700 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{node.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Type & Status */}
          <div className="flex space-x-2">
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
              {node.type.toUpperCase()}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              node.status === 'completed' ? 'bg-green-500/20 text-green-400' :
              node.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
              node.status === 'available' ? 'bg-cyan-500/20 text-cyan-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {node.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-gray-300">{node.description}</p>
          </div>

          {/* Duration & Difficulty */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            {node.duration && (
              <div>
                <span className="text-gray-400">Duration</span>
                <p className="text-white font-medium">{node.duration}</p>
              </div>
            )}
            <div>
              <span className="text-gray-400">Difficulty</span>
              <p className={`font-medium ${
                node.difficulty === 'beginner' ? 'text-green-400' :
                node.difficulty === 'intermediate' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {node.difficulty}
              </p>
            </div>
          </div>

          {/* Prerequisites */}
          {node.prerequisites && node.prerequisites.length > 0 && (
            <div>
              <span className="text-sm text-gray-400">Prerequisites</span>
              <ul className="mt-1 space-y-1">
                {node.prerequisites.map((prereq, index) => (
                  <li key={index} className="text-sm text-gray-300">• {prereq}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Resources */}
          {node.resources && node.resources.length > 0 && (
            <div>
              <span className="text-sm text-gray-400">Resources</span>
              <ul className="mt-1 space-y-1">
                {node.resources.map((resource, index) => (
                  <li key={index} className="text-sm text-neon-cyan hover:text-white cursor-pointer">
                    • {resource}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4">
            {getActionButton()}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function CareerRoadmap3D({ userId }: { userId: string }) {
  const [nodes, setNodes] = useState<RoadmapNode[]>([])
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock roadmap data - replace with API call
  useEffect(() => {
    const mockNodes: RoadmapNode[] = [
      {
        id: '1',
        title: 'HTML & CSS Basics',
        type: 'skill',
        status: 'completed',
        position: [0, 0, 0],
        connections: ['2', '3'],
        description: 'Learn the fundamentals of HTML and CSS for web development',
        duration: '2 weeks',
        difficulty: 'beginner'
      },
      {
        id: '2',
        title: 'JavaScript Fundamentals',
        type: 'skill',
        status: 'completed',
        position: [-2, 1, 1],
        connections: ['4', '5'],
        description: 'Master JavaScript basics including variables, functions, and DOM manipulation',
        duration: '4 weeks',
        difficulty: 'beginner'
      },
      {
        id: '3',
        title: 'Personal Portfolio',
        type: 'project',
        status: 'in_progress',
        position: [2, 1, 1],
        connections: ['6'],
        description: 'Build a personal portfolio website to showcase your work',
        duration: '1 week',
        difficulty: 'beginner',
        prerequisites: ['HTML & CSS Basics']
      },
      {
        id: '4',
        title: 'React Fundamentals',
        type: 'skill',
        status: 'available',
        position: [-3, 2, 2],
        connections: ['7'],
        description: 'Learn React library for building user interfaces',
        duration: '6 weeks',
        difficulty: 'intermediate',
        prerequisites: ['JavaScript Fundamentals']
      },
      {
        id: '5',
        title: 'Node.js Backend',
        type: 'skill',
        status: 'available',
        position: [-1, 2, 2],
        connections: ['8'],
        description: 'Learn server-side JavaScript with Node.js',
        duration: '5 weeks',
        difficulty: 'intermediate',
        prerequisites: ['JavaScript Fundamentals']
      },
      {
        id: '6',
        title: 'React Certification',
        type: 'certification',
        status: 'locked',
        position: [2, 2, 2],
        connections: [],
        description: 'Get certified in React development',
        duration: '1 day',
        difficulty: 'intermediate',
        prerequisites: ['Personal Portfolio', 'React Fundamentals']
      },
      {
        id: '7',
        title: 'Full-Stack Project',
        type: 'project',
        status: 'locked',
        position: [-2, 3, 3],
        connections: ['9'],
        description: 'Build a complete full-stack web application',
        duration: '8 weeks',
        difficulty: 'advanced',
        prerequisites: ['React Fundamentals', 'Node.js Backend']
      },
      {
        id: '8',
        title: 'Internship',
        type: 'internship',
        status: 'locked',
        position: [0, 3, 3],
        connections: ['10'],
        description: 'Apply for web development internships',
        duration: '3 months',
        difficulty: 'intermediate',
        prerequisites: ['Full-Stack Project']
      },
      {
        id: '9',
        title: 'Tech Interview Prep',
        type: 'course',
        status: 'locked',
        position: [-1, 4, 4],
        connections: ['10'],
        description: 'Prepare for technical interviews',
        duration: '4 weeks',
        difficulty: 'advanced'
      },
      {
        id: '10',
        title: 'Junior Developer Role',
        type: 'job',
        status: 'locked',
        position: [0, 5, 5],
        connections: [],
        description: 'Land your first junior developer position',
        duration: 'Ongoing',
        difficulty: 'intermediate',
        prerequisites: ['Internship', 'Tech Interview Prep']
      }
    ]

    setTimeout(() => {
      setNodes(mockNodes)
      setLoading(false)
    }, 1000)
  }, [userId])

  const handleNodeAction = (action: 'start' | 'continue' | 'complete', nodeId: string) => {
    setNodes(prevNodes => 
      prevNodes.map(node => {
        if (node.id === nodeId) {
          switch (action) {
            case 'start':
              return { ...node, status: 'in_progress' as const }
            case 'complete':
              return { ...node, status: 'completed' as const }
            default:
              return node
          }
        }
        return node
      })
    )
  }

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-gray-600 border-t-neon-cyan rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading your career roadmap...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-96 bg-gradient-to-b from-gray-900/30 to-black/30 rounded-xl overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [6, 6, 6], fov: 60 }}
        style={{ background: 'transparent' }}
        shadows
        onCreated={({ gl }) => {
          // Configure renderer for better stability
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
          
          // Add WebGL context loss handlers
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault()
            console.warn('WebGL context lost in CareerRoadmap3D')
          }, false)

          gl.domElement.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored in CareerRoadmap3D')
          }, false)
        }}
        gl={{ 
          antialias: true, 
          alpha: true,
          preserveDrawingBuffer: false,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false
        }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} castShadow />
        <pointLight position={[-10, -10, 5]} intensity={0.4} color="#00FFFF" />
        <pointLight position={[5, -10, -5]} intensity={0.3} color="#FF007F" />

        {/* Roadmap Nodes */}
        {nodes.map(node => (
          <RoadmapNode3D
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            onSelect={setSelectedNode}
          />
        ))}

        {/* Connections */}
        <RoadmapConnections nodes={nodes} selectedNode={selectedNode} />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={4}
          maxDistance={20}
        />
      </Canvas>

      {/* UI Overlays */}
      <ProgressStats nodes={nodes} />

      <NodeDetailPanel
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onAction={handleNodeAction}
      />

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
        <p className="text-xs text-gray-400">
          Click nodes for details • Drag to explore • Different shapes = different types
        </p>
      </div>
    </div>
  )
}