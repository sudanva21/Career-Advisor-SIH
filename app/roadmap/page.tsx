'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Sparkles, 
  ArrowLeft, 
  Share2, 
  Download, 
  BookmarkPlus,
  Play,
  CheckCircle
} from 'lucide-react'
import AIRoadmapGenerator from '@/components/roadmap/AIRoadmapGenerator'
import CareerRoadmap3D from '@/components/profile/CareerRoadmap3D'
import RoadmapVisualization from '@/components/roadmap/RoadmapVisualization'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import WebGLErrorBoundary from '@/components/ui/WebGLErrorBoundary'
import toast from 'react-hot-toast'

interface GeneratedRoadmap {
  id: string
  title: string
  description: string
  totalDuration: number
  phases: RoadmapPhase[]
  aiRecommendations: string[]
  difficulty: string
  estimatedOutcome: string
}

interface RoadmapPhase {
  id: string
  title: string
  description: string
  duration: number
  type: 'foundation' | 'intermediate' | 'advanced' | 'specialization'
  nodes: RoadmapNodeData[]
}

interface RoadmapNodeData {
  id: string
  title: string
  type: 'skill' | 'project' | 'certification' | 'course' | 'internship'
  description: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  resources: string[]
  skills: string[]
  importance: number
}

function RoadmapOverview({ roadmap, onStartJourney }: {
  roadmap: GeneratedRoadmap
  onStartJourney: () => void
}) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white"
        >
          {roadmap.title}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-300 max-w-2xl mx-auto"
        >
          {roadmap.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center space-x-6 text-sm"
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-neon-cyan rounded-full"></div>
            <span className="text-gray-300">{roadmap.totalDuration} months</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-neon-pink rounded-full"></div>
            <span className="text-gray-300 capitalize">{roadmap.difficulty}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-neon-purple rounded-full"></div>
            <span className="text-gray-300">{roadmap.phases.length} phases</span>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-center space-x-4"
      >
        <button
          onClick={onStartJourney}
          className="px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-xl font-semibold text-black hover:scale-105 transition-transform duration-200 flex items-center space-x-2 shadow-lg shadow-neon-cyan/25"
        >
          <Play size={20} />
          <span>Start Your Journey</span>
        </button>
        
        <button className="px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl font-semibold text-white hover:bg-gray-700 transition-colors flex items-center space-x-2">
          <BookmarkPlus size={20} />
          <span>Save Roadmap</span>
        </button>
        
        <button className="px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl font-semibold text-white hover:bg-gray-700 transition-colors flex items-center space-x-2">
          <Share2 size={20} />
          <span>Share</span>
        </button>
      </motion.div>

      {/* Roadmap Phases */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Phase Overview */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-white">Learning Phases</h2>
          
          {roadmap.phases.map((phase, index) => (
            <div key={phase.id} className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold ${
                  phase.type === 'foundation' ? 'bg-green-500/20 text-green-400' :
                  phase.type === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                  phase.type === 'advanced' ? 'bg-red-500/20 text-red-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-white">{phase.title}</h3>
                <span className="text-sm text-gray-400">({phase.duration} weeks)</span>
              </div>
              
              <p className="text-gray-300 mb-4">{phase.description}</p>
              
              <div className="grid grid-cols-2 gap-2">
                {phase.nodes.slice(0, 4).map((node) => (
                  <div key={node.id} className="text-sm text-gray-400 bg-gray-800/50 rounded-lg p-2">
                    {node.title}
                  </div>
                ))}
                {phase.nodes.length > 4 && (
                  <div className="text-sm text-neon-cyan bg-gray-800/50 rounded-lg p-2 text-center">
                    +{phase.nodes.length - 4} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-br from-neon-cyan/10 to-neon-pink/10 backdrop-blur-sm rounded-xl p-6 border border-neon-cyan/20">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles size={24} className="text-neon-cyan" />
              <h2 className="text-xl font-bold text-white">AI Recommendations</h2>
            </div>
            
            <ul className="space-y-3">
              {roadmap.aiRecommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle size={16} className="text-neon-cyan mt-1 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-3">Expected Outcome</h3>
            <p className="text-gray-300">{roadmap.estimatedOutcome}</p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-3">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-neon-cyan">
                  {roadmap.phases.reduce((sum, phase) => sum + phase.nodes.length, 0)}
                </div>
                <div className="text-sm text-gray-400">Learning Modules</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-neon-pink">
                  {roadmap.phases.reduce((sum, phase) => 
                    sum + phase.nodes.filter(node => node.type === 'project').length, 0
                  )}
                </div>
                <div className="text-sm text-gray-400">Projects</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function RoadmapPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [currentView, setCurrentView] = useState<'generator' | 'overview' | 'interactive' | '3d-view'>('generator')
  const [generatedRoadmap, setGeneratedRoadmap] = useState<GeneratedRoadmap | null>(null)
  const [savedRoadmap, setSavedRoadmap] = useState<any>(null)
  const [userRoadmaps, setUserRoadmaps] = useState<any[]>([])

  useEffect(() => {
    // Temporarily disabled for demo - remove this in production
    // if (!loading && !user) {
    //   router.push('/auth/signin')
    // }
  }, [user, loading, router])

  useEffect(() => {
    // Always try to fetch for demo purposes
    if (user || process.env.NODE_ENV === 'development') {
      fetchUserRoadmaps()
    }
  }, [user])

  const fetchUserRoadmaps = async () => {
    try {
      const response = await fetch('/api/roadmap')
      if (response.ok) {
        const { roadmaps } = await response.json()
        setUserRoadmaps(roadmaps || [])
        if (roadmaps && roadmaps.length > 0) {
          // Set most recent roadmap as active
          setSavedRoadmap(roadmaps[0])
        }
      }
    } catch (error) {
      console.error('Error fetching roadmaps:', error)
    }
  }

  const handleRoadmapGenerated = (roadmap: GeneratedRoadmap) => {
    setGeneratedRoadmap(roadmap)
    setCurrentView('overview')
  }

  const handleStartJourney = async () => {
    if (!generatedRoadmap) return

    try {
      // Save roadmap to user's profile
      const response = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedRoadmap.title,
          description: generatedRoadmap.description,
          careerGoal: generatedRoadmap.title.replace(' Learning Path', ''),
          currentLevel: generatedRoadmap.difficulty,
          duration: generatedRoadmap.totalDuration,
          nodes: generatedRoadmap.phases.flatMap(phase => phase.nodes),
          connections: generatedRoadmap.phases.map((phase, index) => ({
            from: index > 0 ? generatedRoadmap.phases[index - 1].id : 'start',
            to: phase.id,
            type: 'sequence'
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save roadmap')
      }

      const { roadmap: savedRoadmapData } = await response.json()
      setSavedRoadmap(savedRoadmapData)
      
      toast.success('Roadmap saved to your profile!')
      setCurrentView('interactive')
      
      // Refresh user roadmaps
      fetchUserRoadmaps()
    } catch (error) {
      console.error('Error saving roadmap:', error)
      toast.error('Failed to save roadmap. Please try again.')
    }
  }

  const handleUpdateProgress = async (nodeId: string, completed: boolean, notes?: string) => {
    if (!savedRoadmap) return
    
    try {
      // Update local state immediately for better UX
      const updatedNodes = JSON.parse(savedRoadmap.nodes).map((node: any) => 
        node.id === nodeId ? { ...node, completed, notes } : node
      )
      
      setSavedRoadmap({
        ...savedRoadmap,
        nodes: JSON.stringify(updatedNodes)
      })

      // Update progress on server
      const completedCount = updatedNodes.filter((node: any) => node.completed).length
      const progressPercentage = (completedCount / updatedNodes.length) * 100

      await fetch('/api/roadmap', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roadmapId: savedRoadmap.id,
          progress: progressPercentage
        })
      })

      toast.success('Progress updated!')
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error('Failed to update progress')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#0B0E17' }}>
        <div className="pt-24">
          <LoadingSpinner message="Loading roadmap generator..." />
        </div>
      </div>
    )
  }

  // Temporarily disabled for demo - remove this in production
  // if (!user) {
  //   return (
  //     <div className="min-h-screen" style={{ background: '#0B0E17' }}>
  //       <div className="pt-24 flex items-center justify-center">
  //         <div className="text-center">
  //           <h2 className="text-xl text-white mb-4">Authentication Required</h2>
  //           <p className="text-gray-400">Please sign in to access the roadmap generator.</p>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen" style={{ background: '#0B0E17' }}>
      {/* Header */}
      <div className="relative pt-24 pb-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center space-x-4">
              {currentView !== 'generator' && (
                <button
                  onClick={() => setCurrentView('generator')}
                  className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {currentView === 'generator' && 'AI Roadmap Generator'}
                  {currentView === 'overview' && 'Your Learning Roadmap'}
                  {currentView === 'interactive' && 'Interactive Roadmap'}
                  {currentView === '3d-view' && '3D Roadmap Visualization'}
                </h1>
                <p className="text-gray-400 mt-1">
                  {currentView === 'generator' && 'Create a personalized career learning path with AI'}
                  {currentView === 'overview' && 'Review and customize your AI-generated roadmap'}
                  {currentView === 'interactive' && 'Track progress and manage your learning journey'}
                  {currentView === '3d-view' && 'Explore your roadmap in immersive 3D'}
                </p>
              </div>
            </div>

            {(currentView === '3d-view' || currentView === 'interactive') && (
              <div className="flex space-x-2">
                {currentView === 'interactive' && (
                  <button
                    onClick={() => setCurrentView('3d-view')}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors"
                  >
                    3D View
                  </button>
                )}
                {currentView === '3d-view' && (
                  <button
                    onClick={() => setCurrentView('interactive')}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors"
                  >
                    Interactive
                  </button>
                )}
                <button
                  onClick={() => setCurrentView('overview')}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors"
                >
                  Overview
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-12">
        <AnimatePresence mode="wait">
          {currentView === 'generator' && (
            <motion.div
              key="generator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AIRoadmapGenerator onRoadmapGenerated={handleRoadmapGenerated} />
            </motion.div>
          )}

          {currentView === 'overview' && generatedRoadmap && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <RoadmapOverview
                roadmap={generatedRoadmap}
                onStartJourney={handleStartJourney}
              />
            </motion.div>
          )}

          {currentView === 'interactive' && savedRoadmap && (
            <motion.div
              key="interactive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="h-[600px]"
            >
              <RoadmapVisualization
                roadmap={{
                  id: savedRoadmap.id,
                  title: savedRoadmap.title,
                  description: savedRoadmap.description || '',
                  nodes: JSON.parse(savedRoadmap.nodes || '[]'),
                  connections: JSON.parse(savedRoadmap.connections || '[]'),
                  progress: savedRoadmap.progress || 0
                }}
                editable={true}
                onUpdateProgress={handleUpdateProgress}
                onSaveRoadmap={fetchUserRoadmaps}
              />
            </motion.div>
          )}

          {currentView === '3d-view' && (
            <motion.div
              key="3d-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6"
            >
              <WebGLErrorBoundary>
                <CareerRoadmap3D userId={user?.id || 'demo-user'} />
              </WebGLErrorBoundary>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}