'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, 
  BookOpen, 
  Trophy, 
  Calendar, 
  Clock,
  CheckCircle,
  Circle,
  ArrowRight,
  ExternalLink,
  DollarSign,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

interface Resource {
  type: string
  name: string
  url: string
  cost: string
  duration: string
}

interface Milestone {
  id: string
  title: string
  description: string
  skills: string[]
  resources: Resource[]
  deliverables: string[]
  completed?: boolean
}

interface Phase {
  id: string
  title: string
  description: string
  duration: string
  milestones: Milestone[]
  completed?: boolean
}

interface RoadmapNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: any
}

interface CareerRoadmap {
  id: string
  title: string
  description: string
  careerGoal: string
  nodes: RoadmapNode[]
  connections: any[]
  progress: number
  phases?: Phase[]
  ai_recommendations?: {
    colleges: Array<{
      name: string
      location: string
      program: string
      why: string
      type: string
    }>
    certifications: string[]
    networking: string[]
    portfolio: string[]
  }
  timeline?: {
    short_term: string
    medium_term: string
    long_term: string
  }
}

interface RoadmapVisualizationProps {
  roadmap: CareerRoadmap
}

export default function RoadmapVisualization({ roadmap }: RoadmapVisualizationProps) {
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null)
  const [view, setView] = useState<'timeline' | 'network' | 'phases'>('phases')
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Extract phases from roadmap data or create from nodes
  const phases = roadmap.phases || extractPhasesFromNodes(roadmap.nodes)
  const totalMilestones = phases.reduce((acc, phase) => acc + (phase.milestones?.length || 0), 0)
  const completedMilestones = phases.reduce((acc, phase) => 
    acc + (phase.milestones?.filter(m => m.completed).length || 0), 0
  )

  function extractPhasesFromNodes(nodes: RoadmapNode[]): Phase[] {
    const phaseNodes = nodes.filter(n => n.type === 'phase')
    const milestoneNodes = nodes.filter(n => n.type === 'milestone')
    
    return phaseNodes.map((phaseNode, index) => ({
      id: phaseNode.id,
      title: phaseNode.data.title || `Phase ${index + 1}`,
      description: phaseNode.data.description || '',
      duration: phaseNode.data.duration || '2 months',
      milestones: milestoneNodes
        .filter(m => m.id.startsWith(`milestone-${index}-`))
        .map(m => ({
          id: m.id,
          title: m.data.title || 'Milestone',
          description: m.data.description || '',
          skills: m.data.skills || [],
          resources: m.data.resources || [],
          deliverables: m.data.deliverables || [],
          completed: Math.random() > 0.7 // Random completion for demo
        }))
    }))
  }

  const renderTimelineView = () => (
    <div className="space-y-6">
      {phases.map((phase, phaseIndex) => (
        <div key={phase.id} className="relative">
          {/* Phase Timeline Line */}
          {phaseIndex < phases.length - 1 && (
            <div className="absolute left-6 top-16 w-0.5 h-full bg-gradient-to-b from-neon-cyan to-neon-purple opacity-30" />
          )}
          
          {/* Phase Header */}
          <div className="flex items-start space-x-4 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
              phase.completed 
                ? 'bg-neon-cyan border-neon-cyan text-black'
                : 'border-neon-cyan text-neon-cyan bg-black/30'
            }`}>
              <Target className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">{phase.title}</h3>
              <p className="text-gray-300 mb-2">{phase.description}</p>
              <div className="flex items-center text-sm text-gray-400">
                <Clock className="w-4 h-4 mr-1" />
                {phase.duration}
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="ml-16 space-y-3">
            {phase.milestones?.map((milestone, milestoneIndex) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (phaseIndex * 0.2) + (milestoneIndex * 0.1) }}
                className={`bg-black/30 backdrop-blur-sm border rounded-lg p-4 cursor-pointer hover:border-neon-cyan/50 transition-colors ${
                  selectedNode?.id === milestone.id ? 'border-neon-cyan' : 'border-white/10'
                }`}
                onClick={() => setSelectedNode({ id: milestone.id, type: 'milestone', position: { x: 0, y: 0 }, data: milestone })}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-white">{milestone.title}</h4>
                  {milestone.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-300 mb-2">{milestone.description}</p>
                
                {milestone.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {milestone.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                    {milestone.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded">
                        +{milestone.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {milestone.resources?.length > 0 && (
                  <div className="text-xs text-gray-400">
                    <BookOpen className="w-3 h-3 inline mr-1" />
                    {milestone.resources.length} resource{milestone.resources.length > 1 ? 's' : ''}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  const renderNetworkView = () => (
    <div className="relative w-full h-full min-h-96 bg-black/20 rounded-lg p-4 overflow-hidden">
      <svg width="100%" height="100%" className="absolute inset-0">
        {/* Render connections */}
        {roadmap.connections?.map((connection, index) => {
          const sourceNode = roadmap.nodes.find(n => n.id === connection.source)
          const targetNode = roadmap.nodes.find(n => n.id === connection.target)
          
          if (!sourceNode || !targetNode) return null
          
          return (
            <line
              key={connection.id || index}
              x1={sourceNode.position.x + 50}
              y1={sourceNode.position.y + 25}
              x2={targetNode.position.x + 50}
              y2={targetNode.position.y + 25}
              stroke="rgba(34, 211, 238, 0.3)"
              strokeWidth="2"
            />
          )
        })}
      </svg>

      {/* Render nodes */}
      {roadmap.nodes?.map((node, index) => (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`absolute w-24 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-medium cursor-pointer transition-all hover:scale-110 ${
            node.type === 'phase' 
              ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
              : 'bg-purple-500/20 border-purple-400 text-purple-300'
          } ${selectedNode?.id === node.id ? 'scale-110 ring-2 ring-white/50' : ''}`}
          style={{
            left: Math.min(node.position.x, window.innerWidth - 200),
            top: Math.min(node.position.y, 300)
          }}
          onClick={() => setSelectedNode(node)}
        >
          {node.data.title?.slice(0, 12) || 'Node'}
        </motion.div>
      ))}
    </div>
  )

  const renderPhasesView = () => (
    <div className="grid gap-6">
      {phases.map((phase, index) => (
        <motion.div
          key={phase.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                phase.completed ? 'bg-green-500' : 'bg-neon-cyan'
              }`}>
                <Target className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{phase.title}</h3>
                <p className="text-sm text-gray-400">{phase.duration}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">
                {phase.milestones?.filter(m => m.completed).length || 0} / {phase.milestones?.length || 0} complete
              </div>
              <div className="w-24 bg-gray-700 rounded-full h-2 mt-1">
                <div
                  className="bg-neon-cyan h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((phase.milestones?.filter(m => m.completed).length || 0) / (phase.milestones?.length || 1)) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>

          <p className="text-gray-300 mb-4">{phase.description}</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {phase.milestones?.map((milestone) => (
              <div
                key={milestone.id}
                className={`border rounded-lg p-3 cursor-pointer transition-colors hover:border-neon-cyan/50 ${
                  milestone.completed ? 'border-green-500/50 bg-green-500/10' : 'border-white/10 bg-black/20'
                }`}
                onClick={() => setSelectedNode({ id: milestone.id, type: 'milestone', position: { x: 0, y: 0 }, data: milestone })}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white text-sm">{milestone.title}</h4>
                  {milestone.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-2">{milestone.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{milestone.skills?.length || 0} skills</span>
                  <span>{milestone.resources?.length || 0} resources</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )

  return (
    <div ref={containerRef} className="w-full h-full">
      {/* View Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('phases')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'phases' 
                ? 'bg-neon-cyan text-black' 
                : 'bg-black/30 text-gray-300 hover:text-white'
            }`}
          >
            Phases View
          </button>
          <button
            onClick={() => setView('timeline')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'timeline' 
                ? 'bg-neon-cyan text-black' 
                : 'bg-black/30 text-gray-300 hover:text-white'
            }`}
          >
            Timeline View
          </button>
          <button
            onClick={() => setView('network')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'network' 
                ? 'bg-neon-cyan text-black' 
                : 'bg-black/30 text-gray-300 hover:text-white'
            }`}
          >
            Network View
          </button>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>{completedMilestones} / {totalMilestones} completed</span>
          <div className="w-32 bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-neon-cyan to-neon-purple h-2 rounded-full transition-all duration-500"
              style={{ width: `${totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Visualization Area */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {view === 'timeline' && renderTimelineView()}
              {view === 'network' && renderNetworkView()}
              {view === 'phases' && renderPhasesView()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 sticky top-4">
            {selectedNode ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{selectedNode.data.title}</h3>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-gray-300 mb-4">{selectedNode.data.description}</p>

                {selectedNode.data.skills?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-white mb-2">Skills to Develop</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedNode.data.skills.map((skill: string) => (
                        <span key={skill} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.data.resources?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-white mb-2">Learning Resources</h4>
                    <div className="space-y-2">
                      {selectedNode.data.resources.slice(0, 3).map((resource: Resource, index: number) => (
                        <div key={index} className="bg-black/20 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">{resource.name}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              resource.cost === 'Free' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                            }`}>
                              {resource.cost}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mb-2">{resource.type} • {resource.duration}</div>
                          {resource.url !== 'Self-study' && (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-neon-cyan hover:underline flex items-center"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Resource
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.data.deliverables?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Deliverables</h4>
                    <ul className="space-y-1">
                      {selectedNode.data.deliverables.map((deliverable: string, index: number) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start">
                          <Trophy className="w-3 h-3 mt-1 mr-2 flex-shrink-0 text-yellow-500" />
                          {deliverable}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium text-white mb-2">Roadmap Overview</h3>
                <p className="text-sm mb-4">{roadmap.description}</p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Total Phases</span>
                    <span className="text-neon-cyan">{phases.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Milestones</span>
                    <span className="text-neon-cyan">{totalMilestones}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Progress</span>
                    <span className="text-neon-cyan">{Math.round((completedMilestones / totalMilestones) * 100) || 0}%</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-4">Click on any phase or milestone to see details</p>
              </div>
            )}
          </div>

          {/* AI Recommendations */}
          {roadmap.ai_recommendations && (
            <div className="mt-6 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">AI Recommendations</h3>
              
              {roadmap.ai_recommendations.colleges?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white mb-2">Recommended Colleges</h4>
                  <div className="space-y-2">
                    {roadmap.ai_recommendations.colleges.slice(0, 2).map((college, index) => (
                      <div key={index} className="bg-black/20 rounded-lg p-3">
                        <div className="text-sm font-medium text-white">{college.name}</div>
                        <div className="text-xs text-gray-400">{college.location} • {college.type}</div>
                        <div className="text-xs text-gray-300 mt-1">{college.program}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {roadmap.timeline && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Timeline Goals</h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-gray-400">Short-term:</span>
                      <span className="text-gray-300 ml-2">{roadmap.timeline.short_term}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Long-term:</span>
                      <span className="text-gray-300 ml-2">{roadmap.timeline.long_term}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}