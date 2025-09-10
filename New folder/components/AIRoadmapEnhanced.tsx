'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { 
  Plus, 
  Target, 
  Calendar, 
  MapPin, 
  BookOpen, 
  Trophy, 
  Sparkles,
  Eye,
  Edit,
  Trash2,
  Play,
  Clock,
  BarChart3,
  Maximize2,
  Minimize2,
  Bot,
  Zap,
  Brain,
  Atom,
  Orbit,
  Stars
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import dynamic from 'next/dynamic'

// Enhanced dynamic imports
const RoadmapVisualization = dynamic(() => import('@/components/RoadmapVisualization'), {
  ssr: false,
  loading: () => <EnhancedLoader />
})

const BackgroundLines3D = dynamic(() => import('@/components/BackgroundLines3D'), {
  ssr: false
})

interface CareerRoadmap {
  id: string
  title: string
  description: string
  careerGoal: string
  currentLevel: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  nodes: any[]
  connections: any[]
  aiGenerated: boolean
  progress: number
  created_at: string
  updated_at: string
}

interface RoadmapGenerationForm {
  careerGoal: string
  currentLevel: 'beginner' | 'intermediate' | 'advanced'
  timeframe: string
  interests: string[]
  currentSkills: string[]
  learningStyle: string
  budget: string
}

// Enhanced Loading Component
const EnhancedLoader = () => (
  <div className="w-full h-96 bg-gradient-to-br from-space-dark via-purple-900/20 to-space-dark rounded-xl border border-neon-cyan/20 flex items-center justify-center relative overflow-hidden">
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
        <Brain className="w-8 h-8 text-neon-cyan absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </motion.div>
      <motion.p 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-neon-cyan text-sm font-medium"
      >
        Loading AI-Powered 3D Roadmap...
      </motion.p>
    </div>
  </div>
)

// Floating Particle Component
const FloatingParticle = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 100 }}
    animate={{ 
      opacity: [0, 1, 0],
      y: [-20, -200],
      x: [0, Math.random() * 100 - 50]
    }}
    transition={{ 
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeOut"
    }}
    className="absolute w-1 h-1 bg-neon-cyan rounded-full"
    style={{
      left: `${Math.random() * 100}%`,
      bottom: '0px'
    }}
  />
)

// Enhanced Background
const FuturisticBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    {/* Animated Grid */}
    <div className="absolute inset-0 opacity-10">
      <div 
        className="w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}
      />
    </div>
    
    {/* Floating Particles */}
    {[...Array(15)].map((_, i) => (
      <FloatingParticle key={i} delay={i * 0.3} />
    ))}
    
    {/* Orbital Rings */}
    <div className="absolute top-1/4 right-1/4 w-96 h-96 opacity-10">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="w-full h-full border border-neon-cyan/20 rounded-full"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        className="absolute inset-8 border border-neon-purple/20 rounded-full"
      />
    </div>
  </div>
)

export default function AIRoadmapEnhanced() {
  const { user } = useAuth()
  const router = useRouter()
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [selectedRoadmap, setSelectedRoadmap] = useState<CareerRoadmap | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { threshold: 0.1 })
  
  const [formData, setFormData] = useState<RoadmapGenerationForm>({
    careerGoal: '',
    currentLevel: 'beginner',
    timeframe: '12',
    interests: [],
    currentSkills: [],
    learningStyle: 'mixed',
    budget: 'low'
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin?next=/ai-roadmap')
      return
    }
    loadRoadmaps()
  }, [user, router])

  const loadRoadmaps = async () => {
    try {
      console.log('📋 Loading user roadmaps...')
      const response = await fetch('/api/roadmap/list')
      const data = await response.json()
      
      if (!response.ok) {
        const errorMessage = data.error || 'Failed to load roadmaps'
        console.error('❌ API Error:', { status: response.status, error: errorMessage })
        toast.error(errorMessage)
        return
      }

      console.log(`✅ Loaded ${data.roadmaps?.length || 0} roadmaps`)
      setRoadmaps(data.roadmaps || [])
    } catch (error) {
      console.error('❌ Network error loading roadmaps:', error)
      toast.error('Network error: Unable to load roadmaps')
    } finally {
      setLoading(false)
    }
  }

  const generateRoadmap = async () => {
    if (!formData.careerGoal.trim()) {
      toast.error('Please enter a career goal')
      return
    }

    setGenerating(true)
    console.log('🤖 Starting roadmap generation...', { careerGoal: formData.careerGoal })
    
    try {
      const response = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (!response.ok) {
        // Show specific error message from backend
        const errorMessage = data.error || 'Failed to generate roadmap'
        console.error('❌ API Error:', { status: response.status, error: errorMessage })
        toast.error(errorMessage)
        return
      }

      if (!data.success || !data.roadmap) {
        console.error('❌ Invalid response:', data)
        toast.error('Invalid response from server')
        return
      }

      console.log('✅ Roadmap generated successfully:', data.roadmap.id)
      setRoadmaps(prev => [data.roadmap, ...prev])
      setShowGenerator(false)
      setSelectedRoadmap(data.roadmap)
      toast.success('🎉 AI roadmap generated successfully!')
      
      // Reset form
      setFormData({
        careerGoal: '',
        currentLevel: 'beginner',
        timeframe: '12',
        interests: [],
        currentSkills: [],
        learningStyle: 'mixed',
        budget: 'low'
      })
    } catch (error) {
      console.error('❌ Network error:', error)
      toast.error('Network error: Unable to connect to server')
    } finally {
      setGenerating(false)
    }
  }

  const deleteRoadmap = async (id: string) => {
    try {
      const response = await fetch(`/api/roadmap/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setRoadmaps(prev => prev.filter(r => r.id !== id))
        if (selectedRoadmap?.id === id) {
          setSelectedRoadmap(null)
        }
        toast.success('Roadmap deleted')
      }
    } catch (error) {
      toast.error('Failed to delete roadmap')
    }
  }

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      currentSkills: prev.currentSkills.includes(skill)
        ? prev.currentSkills.filter(s => s !== skill)
        : [...prev.currentSkills, skill]
    }))
  }

  if (!user) return null

  const interestOptions = [
    'Technology', 'Design', 'Marketing', 'Finance', 'Healthcare', 'Education',
    'Research', 'Management', 'Sales', 'Data Analysis', 'Creative Arts', 'Engineering'
  ]

  const skillOptions = [
    'Programming', 'Communication', 'Leadership', 'Problem Solving', 'Project Management',
    'Data Analysis', 'Design', 'Writing', 'Public Speaking', 'Critical Thinking',
    'Teamwork', 'Time Management'
  ]

  return (
    <div className="min-h-screen bg-space-dark text-white relative overflow-hidden pt-16">
      {/* Enhanced Background */}
      <FuturisticBackground />
      
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        <BackgroundLines3D />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <motion.div 
          ref={headerRef}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: isHeaderInView ? [1, 1.1, 1] : 1
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-full mx-auto flex items-center justify-center relative overflow-hidden">
                <Atom className="w-12 h-12 text-space-dark relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
              {/* Orbital rings */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border border-neon-cyan/30 rounded-full"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8 border border-neon-purple/20 rounded-full"
              />
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 relative"
          >
            <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
              AI Career Nexus
            </span>
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-2 bg-gradient-to-r from-neon-cyan/20 via-transparent to-neon-purple/20 blur-xl -z-10"
            />
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Unlock your future with AI-powered career roadmaps designed to evolve with you
          </motion.p>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 30px rgba(0, 255, 255, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGenerator(true)}
            className="relative group bg-gradient-to-r from-neon-cyan to-neon-purple text-black font-bold px-8 py-4 rounded-2xl text-lg overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-purple opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            <div className="relative z-10 flex items-center">
              <Zap className="w-6 h-6 mr-3" />
              Create AI Roadmap
              <Sparkles className="w-5 h-5 ml-3" />
            </div>
          </motion.button>
        </motion.div>

        {/* Enhanced Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Enhanced Roadmap List */}
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-8">
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Orbit className="w-8 h-8 text-neon-cyan mr-3" />
                Your Roadmaps
              </h2>
              
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-neon-cyan/20 animate-pulse"
                    >
                      <div className="h-4 bg-gradient-to-r from-neon-cyan/30 to-neon-purple/30 rounded mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    </motion.div>
                  ))}
                </div>
              ) : roadmaps.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 bg-gradient-to-br from-black/20 to-purple-900/20 rounded-2xl border border-neon-cyan/20 backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Stars className="w-20 h-20 text-neon-cyan mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-3">Begin Your Journey</h3>
                  <p className="text-gray-400 text-sm mb-6 px-4">
                    Create your first AI-powered career roadmap and unlock unlimited possibilities
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowGenerator(true)}
                    className="bg-gradient-to-r from-neon-cyan to-neon-purple text-black px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                  >
                    Launch AI Generator
                  </motion.button>
                </motion.div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-neon-cyan/20">
                  {roadmaps.map((roadmap, index) => (
                    <motion.div
                      key={roadmap.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: "0 10px 30px rgba(0, 255, 255, 0.2)"
                      }}
                      className={`group bg-gradient-to-br from-black/40 to-purple-900/20 backdrop-blur-sm rounded-xl border p-5 cursor-pointer transition-all duration-300 ${
                        selectedRoadmap?.id === roadmap.id
                          ? 'border-neon-cyan bg-neon-cyan/10 shadow-lg shadow-neon-cyan/25'
                          : 'border-white/10 hover:border-neon-cyan/50'
                      }`}
                      onClick={() => router.push(`/ai-roadmap/${roadmap.id}`)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-white truncate pr-2 group-hover:text-neon-cyan transition-colors">
                          {roadmap.title}
                        </h3>
                        {roadmap.aiGenerated && (
                          <motion.span 
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="flex-shrink-0 p-2 bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 rounded-lg border border-neon-purple/30"
                          >
                            <Sparkles className="w-4 h-4 text-neon-purple" />
                          </motion.span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                        {roadmap.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 mb-4">
                        <span className="flex items-center bg-black/20 rounded-lg px-2 py-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {roadmap.duration}mo
                        </span>
                        <span className="flex items-center bg-black/20 rounded-lg px-2 py-1">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          {roadmap.progress}%
                        </span>
                      </div>
                      
                      {/* Enhanced Progress Bar */}
                      <div className="w-full bg-gray-800 rounded-full h-2 mb-4 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${roadmap.progress}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="bg-gradient-to-r from-neon-cyan to-neon-purple h-2 rounded-full relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                        </motion.div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedRoadmap(roadmap)
                            }}
                            className="p-2 text-gray-400 hover:text-neon-cyan transition-colors rounded-lg hover:bg-neon-cyan/10"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              // Edit functionality
                            }}
                            className="p-2 text-gray-400 hover:text-neon-purple transition-colors rounded-lg hover:bg-neon-purple/10"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteRoadmap(roadmap.id)
                          }}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Enhanced Roadmap Visualization */}
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2"
          >
            {selectedRoadmap ? (
              <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-space-dark' : ''}`}>
                <div className={`${
                  isFullscreen 
                    ? 'h-full p-4' 
                    : 'bg-gradient-to-br from-black/40 to-purple-900/20 backdrop-blur-sm rounded-2xl border border-neon-cyan/20 p-6'
                }`}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent"
                      >
                        {selectedRoadmap.title}
                      </motion.h2>
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-300 mb-4"
                      >
                        {selectedRoadmap.description}
                      </motion.p>
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap gap-4 text-sm text-gray-400"
                      >
                        <span className="flex items-center bg-black/30 rounded-lg px-3 py-1">
                          <Target className="w-4 h-4 mr-2 text-neon-cyan" />
                          {selectedRoadmap.careerGoal}
                        </span>
                        <span className="flex items-center bg-black/30 rounded-lg px-3 py-1">
                          <Clock className="w-4 h-4 mr-2 text-neon-purple" />
                          {selectedRoadmap.duration} months
                        </span>
                        <span className="flex items-center bg-black/30 rounded-lg px-3 py-1">
                          <BarChart3 className="w-4 h-4 mr-2 text-neon-pink" />
                          {selectedRoadmap.progress}% complete
                        </span>
                      </motion.div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-3 text-gray-400 hover:text-white transition-colors bg-black/20 rounded-xl hover:bg-neon-cyan/10"
                    >
                      {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
                    </motion.button>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className={`${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'} relative overflow-hidden rounded-xl`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-purple-900/20" />
                    <RoadmapVisualization roadmap={selectedRoadmap} />
                  </motion.div>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-black/40 to-purple-900/20 backdrop-blur-sm rounded-2xl border border-neon-cyan/20 p-12 text-center min-h-[500px] flex flex-col justify-center"
              >
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Target className="w-24 h-24 text-neon-cyan mx-auto mb-6" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Select a Roadmap to Visualize
                </h3>
                <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                  Choose from your AI-generated career roadmaps or create a new one to see your path unfold in stunning 3D visualization
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Enhanced Generation Modal */}
        <AnimatePresence>
          {showGenerator && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowGenerator(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 100 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 100 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="bg-gradient-to-br from-space-dark via-purple-900/50 to-space-dark backdrop-blur-xl rounded-2xl border border-neon-cyan/30 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-neon-cyan/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="inline-block mb-4"
                  >
                    <Brain className="w-16 h-16 text-neon-cyan" />
                  </motion.div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent mb-4">
                    AI Roadmap Generator
                  </h2>
                  <p className="text-gray-300">
                    Let our advanced AI create a personalized career roadmap just for you
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Career Goal */}
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-white font-semibold mb-3 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-neon-cyan" />
                      Career Goal
                    </label>
                    <input
                      type="text"
                      value={formData.careerGoal}
                      onChange={(e) => setFormData(prev => ({ ...prev, careerGoal: e.target.value }))}
                      placeholder="e.g., Full Stack Developer, Data Scientist, UI/UX Designer..."
                      className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 transition-all"
                    />
                  </motion.div>

                  {/* Level and Timeframe */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="block text-white font-semibold mb-3">Current Level</label>
                      <div className="space-y-2">
                        {['beginner', 'intermediate', 'advanced'].map((level) => (
                          <label key={level} className="flex items-center cursor-pointer group">
                            <input
                              type="radio"
                              name="currentLevel"
                              value={level}
                              checked={formData.currentLevel === level}
                              onChange={(e) => setFormData(prev => ({ ...prev, currentLevel: e.target.value as any }))}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 transition-all ${
                              formData.currentLevel === level 
                                ? 'border-neon-cyan bg-neon-cyan' 
                                : 'border-gray-500 group-hover:border-neon-cyan/50'
                            }`} />
                            <span className={`capitalize transition-colors ${
                              formData.currentLevel === level ? 'text-neon-cyan' : 'text-gray-300 group-hover:text-white'
                            }`}>
                              {level}
                            </span>
                          </label>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="block text-white font-semibold mb-3">Timeframe (months)</label>
                      <select
                        value={formData.timeframe}
                        onChange={(e) => setFormData(prev => ({ ...prev, timeframe: e.target.value }))}
                        className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-neon-cyan focus:outline-none transition-all"
                      >
                        <option value="6">6 months</option>
                        <option value="12">12 months</option>
                        <option value="18">18 months</option>
                        <option value="24">24 months</option>
                      </select>
                    </motion.div>
                  </div>

                  {/* Interests */}
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-white font-semibold mb-3">Interests</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {interestOptions.map((interest) => (
                        <motion.button
                          key={interest}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleInterestToggle(interest)}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                            formData.interests.includes(interest)
                              ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                              : 'border-gray-600 bg-black/20 text-gray-300 hover:border-neon-cyan/50 hover:text-white'
                          }`}
                        >
                          {interest}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Skills */}
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-white font-semibold mb-3">Current Skills</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {skillOptions.map((skill) => (
                        <motion.button
                          key={skill}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSkillToggle(skill)}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                            formData.currentSkills.includes(skill)
                              ? 'border-neon-purple bg-neon-purple/10 text-neon-purple'
                              : 'border-gray-600 bg-black/20 text-gray-300 hover:border-neon-purple/50 hover:text-white'
                          }`}
                        >
                          {skill}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Learning Style and Budget */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <label className="block text-white font-semibold mb-3">Learning Style</label>
                      <select
                        value={formData.learningStyle}
                        onChange={(e) => setFormData(prev => ({ ...prev, learningStyle: e.target.value }))}
                        className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-neon-cyan focus:outline-none transition-all"
                      >
                        <option value="visual">Visual</option>
                        <option value="hands-on">Hands-on</option>
                        <option value="reading">Reading/Research</option>
                        <option value="mixed">Mixed Approach</option>
                      </select>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <label className="block text-white font-semibold mb-3">Budget</label>
                      <select
                        value={formData.budget}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                        className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-neon-cyan focus:outline-none transition-all"
                      >
                        <option value="free">Free resources only</option>
                        <option value="low">Low ($0-$100)</option>
                        <option value="medium">Medium ($100-$500)</option>
                        <option value="high">High ($500+)</option>
                      </select>
                    </motion.div>
                  </div>

                  {/* Generate Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex gap-4 pt-6"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowGenerator(false)}
                      className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={generateRoadmap}
                      disabled={generating || !formData.careerGoal.trim()}
                      className="flex-1 bg-gradient-to-r from-neon-cyan to-neon-purple text-black font-bold py-4 px-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden"
                    >
                      {generating ? (
                        <>
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full mr-3" 
                          />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6 mr-3" />
                          Generate with AI
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        .scrollbar-thumb-neon-cyan\\/20::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 255, 0.2);
          border-radius: 3px;
        }
        .scrollbar-thumb-neon-cyan\\/20::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 255, 0.4);
        }
      `}</style>
    </div>
  )
}