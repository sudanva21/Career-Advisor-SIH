'use client'

import { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Line } from '@react-three/drei'
import Text3DWrapper from '../Text3DWrapper'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import WebGLContextManager from '../utils/WebGLContextManager'

interface RoadmapNode {
  id: string
  title: string
  position: [number, number, number]
  status: 'completed' | 'current' | 'locked'
  type: 'skill' | 'project' | 'milestone'
}

function RoadmapNode3D({ node, isActive }: { node: RoadmapNode; isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)

  const getNodeColor = () => {
    switch (node.status) {
      case 'completed': return '#00FF7F'
      case 'current': return '#00FFFF'
      case 'locked': return '#666666'
      default: return '#666666'
    }
  }

  const getNodeSize = () => {
    switch (node.type) {
      case 'milestone': return 0.3
      case 'project': return 0.25
      case 'skill': return 0.2
      default: return 0.2
    }
  }

  useFrame(({ clock }) => {
    if (meshRef.current) {
      if (node.status === 'current') {
        const pulse = 1 + Math.sin(clock.elapsedTime * 3) * 0.2
        meshRef.current.scale.setScalar(pulse)
      }
      
      if (isActive) {
        meshRef.current.rotation.y = clock.elapsedTime
      }
    }
  })

  return (
    <group position={node.position}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh
          ref={meshRef}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          {node.type === 'milestone' ? (
            <dodecahedronGeometry args={[getNodeSize()]} />
          ) : node.type === 'project' ? (
            <boxGeometry args={[getNodeSize(), getNodeSize(), getNodeSize()]} />
          ) : (
            <sphereGeometry args={[getNodeSize()]} />
          )}
          
          <meshStandardMaterial
            color={getNodeColor()}
            emissive={getNodeColor()}
            emissiveIntensity={hovered || isActive ? 0.4 : 0.2}
            transparent
            opacity={node.status === 'locked' ? 0.3 : 0.8}
          />
        </mesh>

        {/* Node label */}
        {(hovered || isActive) && (
          <Text3DWrapper
            position={[0, getNodeSize() + 0.3, 0]}
            fontSize={0.1}
            color="white"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.5}
          >
            {node.title}
          </Text3DWrapper>
        )}

        {/* Status indicator */}
        {node.status === 'completed' && (
          <Text3DWrapper
            position={[0, 0, getNodeSize() + 0.1]}
            fontSize={0.15}
            color="#00FF7F"
            anchorX="center"
            anchorY="middle"
          >
            ✓
          </Text3DWrapper>
        )}
      </Float>
    </group>
  )
}

function RoadmapConnections({ nodes }: { nodes: RoadmapNode[] }) {
  const connections = useMemo(() => {
    const lines: Array<{ from: RoadmapNode, to: RoadmapNode }> = []
    
    for (let i = 0; i < nodes.length - 1; i++) {
      lines.push({
        from: nodes[i],
        to: nodes[i + 1]
      })
    }
    
    return lines
  }, [nodes])

  return (
    <>
      {connections.map((connection, index) => {
        const isCompleted = connection.from.status === 'completed' && 
                           connection.to.status === 'completed'
        
        return (
          <Line
            key={index}
            points={[connection.from.position, connection.to.position]}
            color={isCompleted ? "#00FF7F" : "#444444"}
            lineWidth={isCompleted ? 2 : 1}
            transparent
            opacity={isCompleted ? 0.8 : 0.4}
          />
        )
      })}
    </>
  )
}

export default function RoadmapPreview3D({ userId }: { userId: string }) {
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const [webglError, setWebglError] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextManager = WebGLContextManager.getInstance()

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (canvasRef.current) {
        const gl = canvasRef.current.getContext('webgl2') || canvasRef.current.getContext('webgl')
        if (gl) {
          // Remove event listeners if they exist
          const contextLostHandler = (gl as any).__contextLostHandler
          const contextRestoredHandler = (gl as any).__contextRestoredHandler
          
          if (contextLostHandler) {
            canvasRef.current.removeEventListener('webglcontextlost', contextLostHandler)
          }
          if (contextRestoredHandler) {
            canvasRef.current.removeEventListener('webglcontextrestored', contextRestoredHandler)
          }
        }
        
        contextManager.unregisterContext(canvasRef.current)
      }
    }
  }, [contextManager])

  // Handle hot reload cleanup
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const handleBeforeUnload = () => {
        if (canvasRef.current) {
          contextManager.unregisterContext(canvasRef.current)
        }
      }

      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        handleBeforeUnload()
      }
    }
  }, [contextManager])

  // Real roadmap data fetching
  const [roadmapData, setRoadmapData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoadmapData = async () => {
      try {
        const response = await fetch(`/api/roadmap/latest?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.roadmap) {
            setRoadmapData(data.roadmap)
          } else {
            console.log('No roadmap data found for user:', userId)
          }
        } else {
          console.error('Failed to fetch roadmap data - response not ok:', response.status)
        }
      } catch (error) {
        console.error('Failed to fetch roadmap data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchRoadmapData()
    } else {
      setLoading(false)
    }
  }, [userId])

  const roadmapNodes: RoadmapNode[] = useMemo(() => {
    if (!roadmapData?.phases) {
      return []
    }

    const nodes: RoadmapNode[] = []
    let nodeIndex = 0

    roadmapData.phases.forEach((phase: any, phaseIndex: number) => {
      // Add phase milestone
      nodes.push({
        id: `phase-${phase.id || phaseIndex}`,
        title: phase.title || `Phase ${phaseIndex + 1}`,
        position: [phaseIndex * 2.5 - 2, 1, 0],
        status: phase.status === 'completed' ? 'completed' : 
                phase.status === 'in_progress' ? 'current' : 'locked',
        type: 'milestone'
      })

      // Add skills from this phase
      phase.skills?.slice(0, 3).forEach((skill: any, skillIndex: number) => {
        nodes.push({
          id: `skill-${skill.id || `${phaseIndex}-${skillIndex}`}`,
          title: skill.name || skill.title || 'Skill',
          position: [
            phaseIndex * 2.5 - 2 + (skillIndex - 1) * 0.8, 
            -0.5 - skillIndex * 0.3, 
            0
          ],
          status: skill.status === 'completed' ? 'completed' :
                  skill.status === 'in_progress' ? 'current' : 'locked',
          type: 'skill'
        })
      })

      // Add projects from this phase
      phase.projects?.slice(0, 2).forEach((project: any, projectIndex: number) => {
        nodes.push({
          id: `project-${project.id || `${phaseIndex}-${projectIndex}`}`,
          title: project.name || project.title || 'Project',
          position: [
            phaseIndex * 2.5 - 2 + projectIndex * 1.2 - 0.6, 
            -1.5, 
            projectIndex * 0.5 - 0.25
          ],
          status: project.status === 'completed' ? 'completed' :
                  project.status === 'in_progress' ? 'current' : 'locked',
          type: 'project'
        })
      })
    })

    return nodes
  }, [roadmapData])

  // Show fallback if WebGL error
  if (webglError) {
    return (
      <div className="relative h-64 bg-gradient-to-b from-gray-900/20 to-black/20 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">🗺️</div>
          <div className="text-sm">3D Preview Unavailable</div>
          <div className="text-xs text-gray-500">WebGL not supported</div>
        </div>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="relative h-64 bg-gradient-to-b from-gray-900/20 to-black/20 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">⏳</div>
          <div className="text-sm">Loading roadmap...</div>
        </div>
      </div>
    )
  }

  // Show empty state if no roadmap exists
  if (!roadmapData || roadmapNodes.length === 0) {
    return (
      <div className="relative h-64 bg-gradient-to-b from-gray-900/20 to-black/20 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-3">🗺️</div>
          <div className="text-lg font-semibold text-white mb-2">Generate Your First Roadmap</div>
          <div className="text-sm text-gray-400 mb-4 px-4">
            Create an AI-powered career roadmap to visualize your learning path and track your progress
          </div>
          <button 
            onClick={() => window.open('/ai-roadmap', '_blank')}
            className="px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-pink text-black font-semibold rounded-lg hover:scale-105 transition-transform"
          >
            Generate Your First Roadmap
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-64 bg-gradient-to-b from-gray-900/20 to-black/20 rounded-xl overflow-hidden" style={{ marginTop: '0px' }}>
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 2, 8], fov: 45 }}
        style={{ background: 'transparent' }}
        onCreated={({ gl, scene, camera }) => {
          try {
            // Register canvas with context manager
            if (canvasRef.current) {
              const context = canvasRef.current.getContext('webgl2') || canvasRef.current.getContext('webgl')
              if (context) {
                contextManager.registerContext(canvasRef.current, context)
              }
            }
            
            // Configure renderer for better error handling
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            gl.setClearColor(0x000000, 0) // Transparent background
            
            // Handle context lost with more robust error handling
            const handleContextLost = (event: Event) => {
              event.preventDefault()
              console.warn('WebGL context lost in RoadmapPreview3D')
              setWebglError(true)
              
              // Cleanup any ongoing animations
              if (canvasRef.current) {
                contextManager.unregisterContext(canvasRef.current)
              }
            }

            const handleContextRestored = () => {
              console.log('WebGL context restored in RoadmapPreview3D')
              setWebglError(false)
              
              // Re-register with context manager
              if (canvasRef.current) {
                const context = canvasRef.current.getContext('webgl2') || canvasRef.current.getContext('webgl')
                if (context) {
                  contextManager.registerContext(canvasRef.current, context)
                }
              }
            }

            gl.domElement.addEventListener('webglcontextlost', handleContextLost, false)
            gl.domElement.addEventListener('webglcontextrestored', handleContextRestored, false)

            // Store cleanup functions for later use
            ;(gl as any).__contextLostHandler = handleContextLost
            ;(gl as any).__contextRestoredHandler = handleContextRestored

          } catch (error) {
            console.error('WebGL setup error:', error)
            setWebglError(true)
          }
        }}
        onError={(error) => {
          console.error('Canvas error:', error)
          setWebglError(true)
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
        <pointLight position={[5, 5, 5]} intensity={0.6} />
        <pointLight position={[-5, -5, 5]} intensity={0.3} color="#00FFFF" />

        {/* Roadmap Nodes */}
        {roadmapNodes.map(node => (
          <RoadmapNode3D
            key={node.id}
            node={node}
            isActive={activeNode === node.id}
          />
        ))}

        {/* Connections */}
        <RoadmapConnections nodes={roadmapNodes} />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={20}
          minDistance={2}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          panSpeed={0.8}
          autoRotate={false}
        />
      </Canvas>

      {/* Controls Overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="text-xs text-gray-400">
          Drag to rotate • Scroll to zoom • Right-click to pan
        </div>
        
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-400">Completed</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
            <span className="text-gray-400">Current</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <span className="text-gray-400">Locked</span>
          </div>
        </div>
      </div>
    </div>
  )
}