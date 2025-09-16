'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Target, 
  Clock, 
  Brain, 
  Zap, 
  Users, 
  BookOpen, 
  Code, 
  Award,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface RoadmapRequest {
  careerGoal: string
  currentLevel: 'beginner' | 'intermediate' | 'advanced'
  interests: string[]
  preferredLearningStyle: 'visual' | 'hands_on' | 'theoretical' | 'mixed'
  timeCommitment: string // hours per week
  targetTimeline: string // months
  specificSkills?: string[]
}

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
  duration: number // weeks
  type: 'foundation' | 'intermediate' | 'advanced' | 'specialization'
  nodes: RoadmapNodeData[]
  prerequisites?: string[]
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
  importance: number // 1-5
}

// Step 1: Career Goal Selection
function CareerGoalStep({ onNext, initialData }: {
  onNext: (data: Partial<RoadmapRequest>) => void
  initialData: Partial<RoadmapRequest>
}) {
  const [selectedGoal, setSelectedGoal] = useState(initialData.careerGoal || '')
  const [customGoal, setCustomGoal] = useState('')

  const popularGoals = [
    { id: 'web-developer', title: 'Full-Stack Web Developer', icon: Code },
    { id: 'data-scientist', title: 'Data Scientist', icon: Brain },
    { id: 'ui-ux-designer', title: 'UI/UX Designer', icon: Sparkles },
    { id: 'mobile-developer', title: 'Mobile App Developer', icon: Zap },
    { id: 'devops-engineer', title: 'DevOps Engineer', icon: Users },
    { id: 'cybersecurity', title: 'Cybersecurity Specialist', icon: Award },
  ]

  const handleNext = () => {
    const goal = selectedGoal === 'custom' ? customGoal : selectedGoal
    if (goal) {
      onNext({ careerGoal: goal })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Career Goal</h2>
        <p className="text-gray-400">What career path do you want to pursue?</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {popularGoals.map((goal) => (
          <motion.button
            key={goal.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedGoal(goal.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
              selectedGoal === goal.id
                ? 'border-neon-cyan bg-neon-cyan/10 shadow-lg shadow-neon-cyan/25'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <goal.icon size={24} className={selectedGoal === goal.id ? 'text-neon-cyan' : 'text-gray-400'} />
              <span className="font-medium text-white">{goal.title}</span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[#0B0E17] text-gray-400">Or</span>
        </div>
      </div>

      <div>
        <button
          onClick={() => setSelectedGoal('custom')}
          className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
            selectedGoal === 'custom'
              ? 'border-neon-cyan bg-neon-cyan/10'
              : 'border-gray-700 hover:border-gray-600'
          }`}
        >
          <span className="font-medium text-white">Custom Career Goal</span>
        </button>
        
        {selectedGoal === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mt-3"
          >
            <input
              type="text"
              placeholder="Enter your custom career goal..."
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-neon-cyan focus:outline-none"
            />
          </motion.div>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={!selectedGoal || (selectedGoal === 'custom' && !customGoal)}
        className="w-full px-6 py-3 bg-neon-cyan text-black rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neon-cyan/80 transition-colors flex items-center justify-center space-x-2"
      >
        <span>Continue</span>
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

// Step 2: Experience Level
function ExperienceLevelStep({ onNext, onBack, initialData }: {
  onNext: (data: Partial<RoadmapRequest>) => void
  onBack: () => void
  initialData: Partial<RoadmapRequest>
}) {
  const [currentLevel, setCurrentLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    initialData.currentLevel || 'beginner'
  )

  const levels = [
    {
      id: 'beginner' as const,
      title: 'Beginner',
      description: 'New to the field with little to no experience',
      icon: BookOpen,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      id: 'intermediate' as const,
      title: 'Intermediate',
      description: 'Some experience with basic concepts and tools',
      icon: Target,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10'
    },
    {
      id: 'advanced' as const,
      title: 'Advanced',
      description: 'Experienced professional looking to specialize',
      icon: Award,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">What's Your Current Level?</h2>
        <p className="text-gray-400">This helps us customize the roadmap difficulty</p>
      </div>

      <div className="space-y-4">
        {levels.map((level) => (
          <motion.button
            key={level.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setCurrentLevel(level.id)}
            className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left ${
              currentLevel === level.id
                ? 'border-neon-cyan bg-neon-cyan/10 shadow-lg shadow-neon-cyan/25'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${level.bgColor}`}>
                <level.icon size={24} className={level.color} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-1">{level.title}</h3>
                <p className="text-gray-400">{level.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => onNext({ currentLevel })}
          className="flex-1 px-6 py-3 bg-neon-cyan text-black rounded-lg font-semibold hover:bg-neon-cyan/80 transition-colors flex items-center justify-center space-x-2"
        >
          <span>Continue</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}

// Step 3: Preferences & Timeline
function PreferencesStep({ onNext, onBack, initialData }: {
  onNext: (data: Partial<RoadmapRequest>) => void
  onBack: () => void
  initialData: Partial<RoadmapRequest>
}) {
  const [interests, setInterests] = useState<string[]>(initialData.interests || [])
  const [learningStyle, setLearningStyle] = useState(
    initialData.preferredLearningStyle || 'mixed'
  )
  const [timeCommitment, setTimeCommitment] = useState(initialData.timeCommitment || '10')
  const [timeline, setTimeline] = useState(initialData.targetTimeline || '6')

  const interestOptions = [
    'Frontend Development', 'Backend Development', 'Mobile Development',
    'Data Analysis', 'Machine Learning', 'UI/UX Design',
    'Cybersecurity', 'Cloud Computing', 'DevOps',
    'Game Development', 'Blockchain', 'IoT'
  ]

  const learningStyles = [
    { id: 'visual', title: 'Visual', description: 'Learn through diagrams, videos, and visual content' },
    { id: 'hands_on', title: 'Hands-on', description: 'Learn by building projects and practicing' },
    { id: 'theoretical', title: 'Theoretical', description: 'Learn through reading and understanding concepts' },
    { id: 'mixed', title: 'Mixed', description: 'Combination of all learning approaches' }
  ]

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const handleNext = () => {
    if (interests.length > 0) {
      onNext({
        interests,
        preferredLearningStyle: learningStyle as any,
        timeCommitment: `${timeCommitment} hours/week`,
        targetTimeline: `${timeline} months`
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Customize Your Learning</h2>
        <p className="text-gray-400">Tell us about your preferences and timeline</p>
      </div>

      {/* Interests */}
      <div>
        <h3 className="font-semibold text-white mb-3">Areas of Interest</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {interestOptions.map((interest) => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`p-3 rounded-lg border transition-all duration-200 text-sm ${
                interests.includes(interest)
                  ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                  : 'border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Learning Style */}
      <div>
        <h3 className="font-semibold text-white mb-3">Learning Style</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {learningStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setLearningStyle(style.id as any)}
              className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                learningStyle === style.id
                  ? 'border-neon-cyan bg-neon-cyan/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <h4 className="font-medium text-white mb-1">{style.title}</h4>
              <p className="text-sm text-gray-400">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Time & Timeline */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block font-semibold text-white mb-2">
            Time Commitment (hours/week)
          </label>
          <input
            type="range"
            min="5"
            max="40"
            value={timeCommitment}
            onChange={(e) => setTimeCommitment(e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-sm text-gray-400 mt-1">
            <span>5h</span>
            <span className="text-neon-cyan font-semibold">{timeCommitment}h</span>
            <span>40h</span>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-white mb-2">
            Target Timeline (months)
          </label>
          <input
            type="range"
            min="3"
            max="24"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-sm text-gray-400 mt-1">
            <span>3m</span>
            <span className="text-neon-cyan font-semibold">{timeline}m</span>
            <span>24m</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={interests.length === 0}
          className="flex-1 px-6 py-3 bg-neon-cyan text-black rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neon-cyan/80 transition-colors flex items-center justify-center space-x-2"
        >
          <span>Generate Roadmap</span>
          <Sparkles size={20} />
        </button>
      </div>
    </div>
  )
}

// Roadmap Generation Loading
function GeneratingRoadmap({ request }: { request: RoadmapRequest }) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    'Analyzing your goals...',
    'Matching skills and requirements...',
    'Generating learning path...',
    'Optimizing timeline...',
    'Adding resources and projects...',
    'Finalizing your roadmap...'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 100)

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval)
          return prev
        }
        return prev + 1
      })
    }, 800)

    return () => {
      clearInterval(interval)
      clearInterval(stepInterval)
    }
  }, [])

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <Loader2 size={48} className="text-neon-cyan animate-spin" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Creating Your AI-Powered Roadmap
        </h2>
        <p className="text-gray-400">
          Our AI is analyzing your preferences to create the perfect learning path
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-gray-800 rounded-full h-2 mb-4">
          <motion.div
            className="bg-gradient-to-r from-neon-cyan to-neon-pink h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-neon-cyan font-semibold">{progress}% Complete</p>
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: index <= currentStep ? 1 : 0.3,
              x: 0 
            }}
            className={`flex items-center space-x-3 ${
              index === currentStep ? 'text-neon-cyan' : 'text-gray-400'
            }`}
          >
            {index < currentStep ? (
              <div className="w-5 h-5 bg-neon-cyan rounded-full flex items-center justify-center">
                <span className="text-black text-xs">✓</span>
              </div>
            ) : index === currentStep ? (
              <div className="w-5 h-5 border-2 border-neon-cyan rounded-full animate-pulse" />
            ) : (
              <div className="w-5 h-5 border-2 border-gray-600 rounded-full" />
            )}
            <span className="text-sm">{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function AIRoadmapGenerator({ onRoadmapGenerated }: {
  onRoadmapGenerated: (roadmap: GeneratedRoadmap) => void
}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [roadmapData, setRoadmapData] = useState<Partial<RoadmapRequest>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const { user } = useAuth()

  const handleStepData = (data: Partial<RoadmapRequest>) => {
    setRoadmapData(prev => ({ ...prev, ...data }))
    
    if (currentStep === 3) {
      // Start generating roadmap
      generateRoadmap({ ...roadmapData, ...data } as RoadmapRequest)
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const generateRoadmap = async (request: RoadmapRequest) => {
    setIsGenerating(true)

    try {
      // Call the API to generate roadmap
      const response = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          careerGoal: request.careerGoal,
          currentLevel: request.currentLevel,
          timeCommitment: parseInt(request.timeCommitment.split(' ')[0]),
          preferredLearningStyle: request.preferredLearningStyle,
          existingSkills: request.specificSkills || [],
          interests: request.interests
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate roadmap')
      }

      const { roadmap } = await response.json()
      
      // Add some delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000))

      onRoadmapGenerated(roadmap)
    } catch (error) {
      console.error('Error generating roadmap:', error)
      toast.error('Failed to generate roadmap. Please try again.')
      
      // Fallback to mock roadmap for demo purposes
      const mockRoadmap: GeneratedRoadmap = {
        id: 'roadmap-' + Date.now(),
        title: `${request.careerGoal} Learning Path`,
        description: `A comprehensive ${request.targetTimeline} roadmap to become a ${request.careerGoal}`,
        totalDuration: parseInt(request.targetTimeline.split(' ')[0]),
        difficulty: request.currentLevel,
        estimatedOutcome: `Job-ready ${request.careerGoal} with portfolio projects`,
        aiRecommendations: [
          'Focus on building projects alongside learning theory',
          'Join developer communities for networking',
          'Consider contributing to open source projects',
          'Build a strong portfolio website'
        ],
        phases: [
          {
            id: 'foundation',
            title: 'Foundation Phase',
            description: 'Learn the fundamental concepts and tools',
            duration: 8,
            type: 'foundation',
            nodes: [
              {
                id: 'html-css',
                title: 'HTML & CSS Fundamentals',
                type: 'skill',
                description: 'Master the building blocks of web development',
                duration: '2 weeks',
                difficulty: 'beginner',
                resources: ['MDN Web Docs', 'freeCodeCamp', 'CSS Grid Garden'],
                skills: ['HTML5', 'CSS3', 'Responsive Design'],
                importance: 5
              },
              {
                id: 'javascript-basics',
                title: 'JavaScript Essentials',
                type: 'skill',
                description: 'Learn the programming language of the web',
                duration: '4 weeks',
                difficulty: 'beginner',
                resources: ['JavaScript.info', 'Eloquent JavaScript', 'MDN JavaScript Guide'],
                skills: ['ES6+', 'DOM Manipulation', 'Event Handling'],
                importance: 5
              }
            ]
          }
        ]
      }

      onRoadmapGenerated(mockRoadmap)
      toast.success('Roadmap generated successfully!')
    } finally {
      setIsGenerating(false)
    }
  }

  if (isGenerating) {
    return <GeneratingRoadmap request={roadmapData as RoadmapRequest} />
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold ${
              step <= currentStep
                ? 'border-neon-cyan bg-neon-cyan text-black'
                : 'border-gray-600 text-gray-400'
            }`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-20 h-0.5 ${
                step < currentStep ? 'bg-neon-cyan' : 'bg-gray-600'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <CareerGoalStep
              onNext={handleStepData}
              initialData={roadmapData}
            />
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ExperienceLevelStep
              onNext={handleStepData}
              onBack={() => setCurrentStep(1)}
              initialData={roadmapData}
            />
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <PreferencesStep
              onNext={handleStepData}
              onBack={() => setCurrentStep(2)}
              initialData={roadmapData}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}