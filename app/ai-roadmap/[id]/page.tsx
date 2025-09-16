'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Target, 
  Clock, 
  BarChart3, 
  Maximize2, 
  Minimize2,
  Calendar,
  Trophy,
  BookOpen,
  ExternalLink,
  CheckCircle,
  Circle,
  Sparkles,
  Settings,
  Share2,
  Download,
  Play,
  Pause,
  X,
  DollarSign,
  Zap,
  RotateCcw
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import dynamic from 'next/dynamic'

// Enhanced dynamic imports for 3D components
const Enhanced3DRoadmapVisualization = dynamic(() => import('@/components/Enhanced3DRoadmapVisualization'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gradient-to-br from-space-dark via-purple-900/20 to-space-dark rounded-xl border border-neon-cyan/20 flex items-center justify-center">
      <div className="text-center">
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
        <p className="text-neon-cyan text-sm font-medium">Loading 3D Roadmap...</p>
      </div>
    </div>
  )
})

const BackgroundLines3D = dynamic(() => import('@/components/BackgroundLines3D'), {
  ssr: false
})

interface Resource {
  type: string
  name: string
  url?: string
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
  progress?: number
}

interface Phase {
  id: string
  title: string
  description: string
  duration: string
  milestones: Milestone[]
  completed?: boolean
  progress?: number
}

interface CareerRoadmap {
  id: string
  title: string
  description: string
  career_goal: string
  current_level: string
  duration_months: number
  roadmap_data: {
    phases: Phase[]
    nodes: any[]
    connections: any[]
  }
  progress: number
  created_at: string
  updated_at: string
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

export default function RoadmapDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const [view, setView] = useState<'overview' | 'detailed' | '3d'>('overview')

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin?next=/ai-roadmap')
      return
    }

    if (params.id) {
      loadRoadmapDetails(params.id as string)
    }
  }, [user, params.id, router])

  const loadRoadmapDetails = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📋 Loading roadmap details for ID:', id)
      
      const response = await fetch(`/api/roadmap/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Roadmap not found')
          return
        }
        if (response.status === 401) {
          router.push('/auth/signin?next=/ai-roadmap')
          return
        }
        throw new Error(`Failed to load roadmap: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success || !data.roadmap) {
        throw new Error('Invalid response from server')
      }

      console.log('✅ Roadmap loaded successfully:', data.roadmap.title)
      setRoadmap(data.roadmap)
      
    } catch (error: any) {
      console.error('❌ Error loading roadmap:', error)
      setError(error.message || 'Failed to load roadmap details')
      toast.error('Failed to load roadmap details')
    } finally {
      setLoading(false)
    }
  }

  const updateMilestoneProgress = async (milestoneId: string, completed: boolean) => {
    if (!roadmap) return

    try {
      // Optimistic update
      const updatedRoadmap = {
        ...roadmap,
        roadmap_data: {
          ...roadmap.roadmap_data,
          phases: roadmap.roadmap_data.phases.map(phase => ({
            ...phase,
            milestones: phase.milestones.map(milestone => 
              milestone.id === milestoneId 
                ? { ...milestone, completed }
                : milestone
            )
          }))
        }
      }
      setRoadmap(updatedRoadmap)

      // Update server
      const response = await fetch(`/api/roadmap/${roadmap.id}/milestone/${milestoneId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      })

      if (!response.ok) {
        throw new Error('Failed to update milestone')
      }

      toast.success(completed ? 'Milestone completed! 🎉' : 'Milestone unmarked')
      
    } catch (error) {
      // Revert optimistic update
      loadRoadmapDetails(roadmap.id)
      toast.error('Failed to update milestone')
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-space-dark text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-700 rounded-xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gray-700 rounded-xl"></div>
              <div className="h-96 bg-gray-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-space-dark text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Target className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">
              {error || 'Roadmap Not Found'}
            </h1>
            <p className="text-gray-400 mb-8">
              The roadmap you're looking for doesn't exist or you don't have access to it.
            </p>
            <button
              onClick={() => router.push('/ai-roadmap')}
              className="bg-neon-cyan text-black px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Back to Roadmaps
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  const phases = roadmap.roadmap_data?.phases || []
  const totalMilestones = phases.reduce((acc, phase) => acc + (phase.milestones?.length || 0), 0)
  const completedMilestones = phases.reduce((acc, phase) => 
    acc + (phase.milestones?.filter(m => m.completed).length || 0), 0
  )
  const completionPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

  return (
    <div className="min-h-screen bg-space-dark text-white relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0">
        <BackgroundLines3D />
      </div>

      <div className="relative z-10 pt-20">
        {/* Header with Navigation */}
        <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-16 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/ai-roadmap')}
                  className="flex items-center text-gray-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Roadmaps
                </motion.button>
                <div className="h-6 w-px bg-white/20"></div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                  {roadmap.title}
                </h1>
              </div>

              <div className="flex items-center space-x-3">
                {/* View Toggle */}
                <div className="flex items-center bg-black/30 rounded-lg p-1">
                  <button
                    onClick={() => setView('overview')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      view === 'overview' 
                        ? 'bg-neon-cyan text-black' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setView('detailed')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      view === 'detailed' 
                        ? 'bg-neon-cyan text-black' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Detailed
                  </button>
                  <button
                    onClick={() => setView('3d')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      view === '3d' 
                        ? 'bg-neon-cyan text-black' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    3D View
                  </button>
                </div>

                <button className="p-2 text-gray-400 hover:text-white transition-colors bg-black/20 rounded-lg hover:bg-white/10">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-white transition-colors bg-black/20 rounded-lg hover:bg-white/10">
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-gray-400 hover:text-white transition-colors bg-black/20 rounded-lg hover:bg-white/10"
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-space-dark pt-24' : 'relative'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Roadmap Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-br from-black/40 to-purple-900/20 backdrop-blur-sm rounded-2xl border border-neon-cyan/20 p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-4xl font-bold text-white mb-3">
                      {roadmap.title}
                    </h2>
                    <p className="text-xl text-gray-300 mb-4">
                      {roadmap.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center bg-black/30 rounded-lg px-4 py-2">
                        <Target className="w-4 h-4 mr-2 text-neon-cyan" />
                        {roadmap.career_goal}
                      </span>
                      <span className="flex items-center bg-black/30 rounded-lg px-4 py-2">
                        <Clock className="w-4 h-4 mr-2 text-neon-purple" />
                        {roadmap.duration_months} months
                      </span>
                      <span className="flex items-center bg-black/30 rounded-lg px-4 py-2">
                        <Trophy className="w-4 h-4 mr-2 text-neon-pink" />
                        Level: {roadmap.current_level}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 lg:mt-0 lg:ml-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">
                        {Math.round(completionPercentage)}%
                      </div>
                      <div className="text-sm text-gray-400 mb-4">
                        {completedMilestones} / {totalMilestones} milestones
                      </div>
                      <div className="w-32 bg-gray-700 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${completionPercentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="bg-gradient-to-r from-neon-cyan to-neon-purple h-3 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Content Views */}
            <AnimatePresence mode="wait">
              {view === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  {/* Phases Overview */}
                  <div className="lg:col-span-2">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <BarChart3 className="w-6 h-6 text-neon-cyan mr-3" />
                      Roadmap Phases
                    </h3>
                    <div className="space-y-6">
                      {phases.map((phase, index) => (
                        <motion.div
                          key={phase.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-cyan/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                phase.completed ? 'bg-green-500' : 'bg-neon-cyan'
                              }`}>
                                <Target className="w-5 h-5 text-black" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-white">{phase.title}</h4>
                                <p className="text-sm text-gray-400">{phase.duration}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-400">
                                {phase.milestones?.filter(m => m.completed).length || 0} / {phase.milestones?.length || 0} milestones
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

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {phase.milestones?.slice(0, 6).map((milestone) => (
                              <div
                                key={milestone.id}
                                className={`border rounded-lg p-3 cursor-pointer transition-colors hover:border-neon-cyan/50 ${
                                  milestone.completed ? 'border-green-500/50 bg-green-500/10' : 'border-white/10 bg-black/20'
                                }`}
                                onClick={() => setSelectedMilestone(milestone)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-white text-sm truncate pr-2">{milestone.title}</h5>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      updateMilestoneProgress(milestone.id, !milestone.completed)
                                    }}
                                  >
                                    {milestone.completed ? (
                                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-gray-400 flex-shrink-0 hover:text-neon-cyan transition-colors" />
                                    )}
                                  </button>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>{milestone.skills?.length || 0} skills</span>
                                  <span>{milestone.resources?.length || 0} resources</span>
                                </div>
                              </div>
                            ))}
                            {(phase.milestones?.length || 0) > 6 && (
                              <div className="border border-white/10 rounded-lg p-3 bg-black/20 flex items-center justify-center text-gray-400 text-sm">
                                +{(phase.milestones?.length || 0) - 6} more milestones
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Sidebar Info */}
                  <div className="space-y-6">
                    {/* Timeline */}
                    {roadmap.timeline && (
                      <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                          <Calendar className="w-5 h-5 text-neon-purple mr-2" />
                          Timeline
                        </h4>
                        <div className="space-y-4">
                          <div className="border-l-2 border-green-400 pl-4">
                            <h5 className="font-medium text-green-400 text-sm">Short Term</h5>
                            <p className="text-gray-300 text-sm">{roadmap.timeline.short_term}</p>
                          </div>
                          <div className="border-l-2 border-yellow-400 pl-4">
                            <h5 className="font-medium text-yellow-400 text-sm">Medium Term</h5>
                            <p className="text-gray-300 text-sm">{roadmap.timeline.medium_term}</p>
                          </div>
                          <div className="border-l-2 border-red-400 pl-4">
                            <h5 className="font-medium text-red-400 text-sm">Long Term</h5>
                            <p className="text-gray-300 text-sm">{roadmap.timeline.long_term}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Recommendations */}
                    {roadmap.ai_recommendations && (
                      <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                          <Sparkles className="w-5 h-5 text-neon-pink mr-2" />
                          AI Recommendations
                        </h4>
                        
                        {roadmap.ai_recommendations.colleges?.length > 0 && (
                          <div className="mb-4">
                            <h5 className="font-medium text-neon-cyan text-sm mb-2">Recommended Colleges</h5>
                            <div className="space-y-2">
                              {roadmap.ai_recommendations.colleges.slice(0, 3).map((college, idx) => (
                                <div key={idx} className="bg-black/20 rounded p-2">
                                  <div className="font-medium text-white text-sm">{college.name}</div>
                                  <div className="text-xs text-gray-400">{college.location} - {college.program}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {roadmap.ai_recommendations.certifications?.length > 0 && (
                          <div>
                            <h5 className="font-medium text-neon-purple text-sm mb-2">Certifications</h5>
                            <div className="flex flex-wrap gap-1">
                              {roadmap.ai_recommendations.certifications.slice(0, 4).map((cert, idx) => (
                                <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                                  {cert}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-white mb-4">Quick Actions</h4>
                      <div className="space-y-3">
                        <button 
                          onClick={() => setView('3d')}
                          className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple text-black font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                        >
                          View in 3D
                        </button>
                        <button className="w-full bg-black/30 border border-white/20 text-white py-2 px-4 rounded-lg hover:border-neon-cyan/50 transition-colors">
                          Export PDF
                        </button>
                        <button className="w-full bg-black/30 border border-white/20 text-white py-2 px-4 rounded-lg hover:border-neon-cyan/50 transition-colors">
                          Share Roadmap
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {view === 'detailed' && (
                <motion.div
                  key="detailed"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <DetailedView 
                    roadmap={roadmap} 
                    onMilestoneUpdate={updateMilestoneProgress}
                    onMilestoneSelect={setSelectedMilestone}
                  />
                </motion.div>
              )}

              {view === '3d' && (
                <motion.div
                  key="3d"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'} relative overflow-hidden rounded-xl`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-purple-900/20" />
                  <Enhanced3DRoadmapVisualization roadmap={roadmap} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Milestone Detail Modal */}
      <AnimatePresence>
        {selectedMilestone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedMilestone(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-space-dark border border-neon-cyan/20 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <MilestoneDetailModal
                milestone={selectedMilestone}
                onClose={() => setSelectedMilestone(null)}
                onToggleComplete={(completed) => {
                  updateMilestoneProgress(selectedMilestone.id, completed)
                  setSelectedMilestone(null)
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Detailed Timeline View Component
function DetailedView({ 
  roadmap, 
  onMilestoneUpdate, 
  onMilestoneSelect 
}: {
  roadmap: CareerRoadmap
  onMilestoneUpdate: (milestoneId: string, completed: boolean) => void
  onMilestoneSelect: (milestone: Milestone) => void
}) {
  const phases = roadmap.roadmap_data?.phases || []

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center">
          <Target className="w-6 h-6 text-neon-cyan mr-3" />
          Detailed Roadmap Timeline
        </h3>
        <p className="text-gray-400">Complete interactive view of your career journey</p>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-neon-cyan via-neon-purple to-neon-pink opacity-50"></div>

        {phases.map((phase, phaseIndex) => (
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: phaseIndex * 0.2 }}
            className="relative mb-12"
          >
            {/* Phase Header */}
            <div className="flex items-start space-x-6 mb-6">
              <div className="relative z-10 w-16 h-16 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full flex items-center justify-center border-4 border-space-dark">
                <Target className="w-8 h-8 text-black" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-neon-pink rounded-full flex items-center justify-center text-xs font-bold text-black">
                  {phaseIndex + 1}
                </div>
              </div>
              <div className="flex-1 bg-gradient-to-r from-black/40 to-purple-900/20 backdrop-blur-sm rounded-2xl border border-neon-cyan/20 p-6">
                <h4 className="text-2xl font-bold text-white mb-3">{phase.title}</h4>
                <p className="text-gray-300 mb-4">{phase.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center bg-black/30 rounded-lg px-3 py-1">
                    <Clock className="w-4 h-4 mr-2 text-neon-purple" />
                    {phase.duration}
                  </span>
                  <span className="flex items-center bg-black/30 rounded-lg px-3 py-1">
                    <BookOpen className="w-4 h-4 mr-2 text-neon-cyan" />
                    {phase.milestones?.length || 0} milestones
                  </span>
                  <span className="flex items-center bg-black/30 rounded-lg px-3 py-1">
                    <Trophy className="w-4 h-4 mr-2 text-neon-pink" />
                    {phase.milestones?.filter(m => m.completed).length || 0} completed
                  </span>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="ml-24 space-y-4">
              {phase.milestones?.map((milestone, milestoneIndex) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (phaseIndex * 0.2) + (milestoneIndex * 0.1) }}
                  className={`relative bg-black/30 backdrop-blur-sm border rounded-xl p-6 cursor-pointer transition-all hover:scale-[1.02] ${
                    milestone.completed 
                      ? 'border-green-500/50 bg-green-500/10' 
                      : 'border-white/10 hover:border-neon-cyan/50'
                  }`}
                  onClick={() => onMilestoneSelect(milestone)}
                >
                  {/* Completion Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onMilestoneUpdate(milestone.id, !milestone.completed)
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    {milestone.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 hover:text-neon-cyan" />
                    )}
                  </button>

                  <div className="pr-12">
                    <h5 className="text-lg font-semibold text-white mb-2">{milestone.title}</h5>
                    <p className="text-gray-300 mb-4">{milestone.description}</p>

                    {/* Progress Bar */}
                    {milestone.progress !== undefined && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-400 mb-2">
                          <span>Progress</span>
                          <span>{milestone.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-neon-cyan to-neon-purple h-2 rounded-full transition-all duration-500"
                            style={{ width: `${milestone.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {milestone.skills?.length > 0 && (
                      <div className="mb-4">
                        <h6 className="text-sm font-medium text-gray-400 mb-2">Skills to Learn:</h6>
                        <div className="flex flex-wrap gap-2">
                          {milestone.skills.map((skill, idx) => (
                            <span 
                              key={idx} 
                              className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Deliverables */}
                    {milestone.deliverables?.length > 0 && (
                      <div className="mb-4">
                        <h6 className="text-sm font-medium text-gray-400 mb-2">Deliverables:</h6>
                        <ul className="space-y-1">
                          {milestone.deliverables.map((deliverable, idx) => (
                            <li key={idx} className="text-sm text-gray-300 flex items-center">
                              <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full mr-2"></div>
                              {deliverable}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Resources Count */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {milestone.resources?.length || 0} resources available
                      </span>
                      <span className="text-neon-cyan hover:text-white cursor-pointer">
                        View Details →
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Milestone Detail Modal Component
function MilestoneDetailModal({ 
  milestone, 
  onClose, 
  onToggleComplete 
}: {
  milestone: Milestone
  onClose: () => void
  onToggleComplete: (completed: boolean) => void
}) {
  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            milestone.completed ? 'bg-green-500' : 'bg-neon-cyan'
          }`}>
            <Target className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">{milestone.title}</h3>
            <p className="text-gray-300">{milestone.description}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Progress */}
      {milestone.progress !== undefined && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-semibold text-white">Progress</h4>
            <span className="text-2xl font-bold text-neon-cyan">{milestone.progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-neon-cyan to-neon-purple h-3 rounded-full transition-all duration-500"
              style={{ width: `${milestone.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Skills Section */}
      {milestone.skills?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Zap className="w-5 h-5 text-yellow-400 mr-2" />
            Skills to Master
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {milestone.skills.map((skill, idx) => (
              <div key={idx} className="bg-black/30 border border-purple-500/30 rounded-lg p-3">
                <span className="text-purple-300 font-medium">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resources Section */}
      {milestone.resources?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <BookOpen className="w-5 h-5 text-green-400 mr-2" />
            Learning Resources
          </h4>
          <div className="space-y-3">
            {milestone.resources.map((resource, idx) => (
              <div key={idx} className="bg-black/30 border border-white/10 rounded-lg p-4 hover:border-neon-cyan/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-white mb-1">{resource.name}</h5>
                    <p className="text-sm text-gray-400 mb-2">{resource.type}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {resource.duration}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {resource.cost}
                      </span>
                    </div>
                  </div>
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-neon-cyan transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deliverables Section */}
      {milestone.deliverables?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
            Deliverables
          </h4>
          <div className="space-y-2">
            {milestone.deliverables.map((deliverable, idx) => (
              <div key={idx} className="flex items-center bg-black/30 border border-white/10 rounded-lg p-3">
                <div className="w-2 h-2 bg-neon-cyan rounded-full mr-3"></div>
                <span className="text-gray-300">{deliverable}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-xl transition-colors"
        >
          Close
        </button>
        <button
          onClick={() => {
            onToggleComplete(!milestone.completed)
          }}
          className={`px-6 py-3 font-semibold rounded-xl transition-all ${
            milestone.completed
              ? 'bg-yellow-600 hover:bg-yellow-500 text-black'
              : 'bg-gradient-to-r from-neon-cyan to-neon-purple text-black hover:opacity-90'
          }`}
        >
          {milestone.completed ? (
            <>
              <RotateCcw className="w-4 h-4 mr-2 inline" />
              Mark as Incomplete
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2 inline" />
              Mark as Complete
            </>
          )}
        </button>
      </div>
    </div>
  )
}