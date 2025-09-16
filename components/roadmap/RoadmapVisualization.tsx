'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Book, 
  Target, 
  Zap, 
  Star,
  ChevronRight,
  X,
  Plus,
  Edit3,
  Save
} from 'lucide-react'

interface RoadmapNode {
  id: string
  title: string
  type: 'skill' | 'project' | 'certification' | 'course' | 'internship'
  description: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  resources: string[]
  skills: string[]
  importance: number
  completed?: boolean
  notes?: string
  position?: { x: number; y: number }
}

interface RoadmapConnection {
  from: string
  to: string
  type?: string
}

interface RoadmapVisualizationProps {
  roadmap: {
    id: string
    title: string
    description: string
    nodes: RoadmapNode[]
    connections: RoadmapConnection[]
    progress?: number
  }
  editable?: boolean
  onUpdateProgress?: (nodeId: string, completed: boolean, notes?: string) => Promise<void>
  onSaveRoadmap?: (roadmap: any) => Promise<void>
}

const NodeTypeIcons = {
  skill: Target,
  project: Zap,
  certification: Star,
  course: Book,
  internship: CheckCircle
}

const DifficultyColors = {
  beginner: 'from-green-400 to-green-600',
  intermediate: 'from-yellow-400 to-yellow-600',
  advanced: 'from-red-400 to-red-600'
}

export default function RoadmapVisualization({ 
  roadmap, 
  editable = false, 
  onUpdateProgress,
  onSaveRoadmap 
}: RoadmapVisualizationProps) {
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null)
  const [editingNotes, setEditingNotes] = useState(false)
  const [tempNotes, setTempNotes] = useState('')
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set())
  const [isUpdating, setIsUpdating] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate node positions in a hierarchical layout
  const positionedNodes = useMemo(() => {
    const nodes = roadmap.nodes.map((node, index) => {
      // Simple grid layout - could be enhanced with proper graph layout algorithm
      const nodesPerRow = Math.ceil(Math.sqrt(roadmap.nodes.length))
      const row = Math.floor(index / nodesPerRow)
      const col = index % nodesPerRow
      
      return {
        ...node,
        position: {
          x: col * 300 + 150,
          y: row * 200 + 100
        }
      }
    })
    
    return nodes
  }, [roadmap.nodes])

  useEffect(() => {
    // Initialize completed nodes from roadmap data
    const completed = new Set<string>()
    roadmap.nodes.forEach(node => {
      if (node.completed) {
        completed.add(node.id)
      }
    })
    setCompletedNodes(completed)
  }, [roadmap.nodes])

  const handleNodeClick = (node: RoadmapNode) => {
    setSelectedNode(node)
    setTempNotes(node.notes || '')
    setEditingNotes(false)
  }

  const handleToggleComplete = async (node: RoadmapNode) => {
    if (!editable || !onUpdateProgress) return
    
    setIsUpdating(true)
    const isCompleted = completedNodes.has(node.id)
    const newCompleted = new Set(completedNodes)
    
    if (isCompleted) {
      newCompleted.delete(node.id)
    } else {
      newCompleted.add(node.id)
    }
    
    setCompletedNodes(newCompleted)
    
    try {
      await onUpdateProgress(node.id, !isCompleted, node.notes)
    } catch (error) {
      console.error('Failed to update progress:', error)
      // Revert on error
      setCompletedNodes(completedNodes)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedNode || !editable || !onUpdateProgress) return
    
    setIsUpdating(true)
    try {
      await onUpdateProgress(selectedNode.id, completedNodes.has(selectedNode.id), tempNotes)
      setSelectedNode({ ...selectedNode, notes: tempNotes })
      setEditingNotes(false)
    } catch (error) {
      console.error('Failed to save notes:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.5, Math.min(2, prev * delta)))
  }

  const getConnectionPath = (from: RoadmapNode, to: RoadmapNode) => {
    if (!from.position || !to.position) return ''
    
    const startX = from.position.x + 50 // Node width/2
    const startY = from.position.y + 25 // Node height/2
    const endX = to.position.x + 50
    const endY = to.position.y + 25
    
    // Create curved path
    const controlX1 = startX + (endX - startX) * 0.5
    const controlY1 = startY
    const controlX2 = startX + (endX - startX) * 0.5
    const controlY2 = endY
    
    return `M ${startX},${startY} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${endX},${endY}`
  }

  const completionPercentage = (completedNodes.size / roadmap.nodes.length) * 100

  return (
    <div className="w-full h-full relative bg-space-dark/50 rounded-xl border border-gray-800 overflow-hidden">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-space-dark/90 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">{roadmap.title}</h3>
          <span className="text-sm text-gray-400">
            {completedNodes.size}/{roadmap.nodes.length} completed
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-neon-cyan to-neon-pink h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Visualization Area */}
      <div 
        ref={containerRef}
        className="w-full h-full pt-20 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ pointerEvents: 'auto' }}
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox="0 0 1000 800"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            pointerEvents: 'auto'
          }}
        >
          {/* Connections */}
          <g className="connections">
            {roadmap.connections.map((connection, index) => {
              const fromNode = positionedNodes.find(n => n.id === connection.from)
              const toNode = positionedNodes.find(n => n.id === connection.to)
              
              if (!fromNode || !toNode) return null
              
              return (
                <motion.path
                  key={`${connection.from}-${connection.to}`}
                  d={getConnectionPath(fromNode, toNode)}
                  stroke="url(#connectionGradient)"
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                />
              )
            })}
          </g>

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00bcd4" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#e91e63" stopOpacity={0.6} />
            </linearGradient>
          </defs>

          {/* Nodes */}
          <g className="nodes">
            {positionedNodes.map((node, index) => {
              const IconComponent = NodeTypeIcons[node.type]
              const isCompleted = completedNodes.has(node.id)
              const isSelected = selectedNode?.id === node.id
              
              return (
                <motion.g
                  key={node.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="cursor-pointer"
                  onClick={() => handleNodeClick(node)}
                >
                  {/* Node Background */}
                  <motion.rect
                    x={node.position!.x}
                    y={node.position!.y}
                    width="100"
                    height="50"
                    rx="8"
                    fill={isCompleted ? "url(#completedGradient)" : "url(#nodeGradient)"}
                    stroke={isSelected ? "#00bcd4" : isCompleted ? "#4ade80" : "#374151"}
                    strokeWidth={isSelected ? "3" : "1"}
                    whileHover={{ scale: 1.05 }}
                  />
                  
                  {/* Completion Indicator */}
                  {isCompleted && (
                    <circle
                      cx={node.position!.x + 85}
                      cy={node.position!.y + 15}
                      r="8"
                      fill="#4ade80"
                    />
                  )}
                  
                  {/* Node Content */}
                  <foreignObject
                    x={node.position!.x + 5}
                    y={node.position!.y + 5}
                    width="90"
                    height="40"
                  >
                    <div className="flex items-center space-x-2 text-white">
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs font-medium truncate">
                        {node.title}
                      </span>
                    </div>
                  </foreignObject>
                </motion.g>
              )
            })}
          </g>

          {/* Additional Gradient Definitions */}
          <defs>
            <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#374151" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>
            <linearGradient id="completedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.8} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Node Details Modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNode(null)}
          >
            <motion.div
              className="bg-space-dark border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {React.createElement(NodeTypeIcons[selectedNode.type], {
                    className: "w-6 h-6 text-neon-cyan"
                  })}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedNode.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span className="capitalize">{selectedNode.type}</span>
                      <span>•</span>
                      <span className="capitalize">{selectedNode.difficulty}</span>
                      <span>•</span>
                      <span>{selectedNode.duration}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-gray-300 mb-4">{selectedNode.description}</p>

              {/* Skills */}
              {selectedNode.skills.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white mb-2">Skills Learned</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-neon-cyan/20 text-neon-cyan text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {selectedNode.resources.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white mb-2">Resources</h4>
                  <ul className="space-y-1">
                    {selectedNode.resources.map((resource, index) => (
                      <li key={index} className="text-sm text-gray-400 flex items-center">
                        <ChevronRight className="w-3 h-3 mr-1" />
                        {resource}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Progress Section */}
              {editable && (
                <div className="border-t border-gray-700 pt-4">
                  {/* Completion Toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-white">Mark as Complete</span>
                    <button
                      onClick={() => handleToggleComplete(selectedNode)}
                      disabled={isUpdating}
                      className="flex items-center space-x-2"
                    >
                      {completedNodes.has(selectedNode.id) ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Notes Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-white">Notes</h4>
                      <button
                        onClick={() => {
                          if (editingNotes) {
                            handleSaveNotes()
                          } else {
                            setEditingNotes(true)
                          }
                        }}
                        disabled={isUpdating}
                        className="text-neon-cyan hover:text-neon-pink transition-colors"
                      >
                        {editingNotes ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {editingNotes ? (
                      <textarea
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Add your notes here..."
                        className="w-full h-20 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-neon-cyan"
                      />
                    ) : (
                      <div className="text-sm text-gray-400 min-h-[2rem]">
                        {selectedNode.notes || 'No notes added yet.'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col space-y-2">
        <button
          onClick={() => setZoom(prev => Math.min(2, prev * 1.2))}
          className="w-10 h-10 bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.5, prev * 0.8))}
          className="w-10 h-10 bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
        >
          <span className="text-lg font-bold">-</span>
        </button>
        <button
          onClick={() => {
            setZoom(1)
            setPan({ x: 0, y: 0 })
          }}
          className="px-3 py-1 bg-gray-800 border border-gray-600 rounded-lg text-xs text-white hover:bg-gray-700 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  )
}