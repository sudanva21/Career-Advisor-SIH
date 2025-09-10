'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Users, 
  BookOpen,
  Award,
  MessageSquare,
  Zap,
  Settings,
  CheckCircle,
  Clock,
  ArrowRight,
  Lightbulb
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AIFeature {
  id: string
  title: string
  description: string
  icon: React.ElementType
  endpoint: string
  demoData: any
  color: string
  category: string
}

const aiFeatures: AIFeature[] = [
  {
    id: 'chat',
    title: 'AI Career Advisor',
    description: 'Get personalized career advice from our intelligent chatbot',
    icon: MessageSquare,
    endpoint: '/api/chat',
    color: 'from-blue-500 to-cyan-500',
    category: 'Guidance',
    demoData: {
      message: "What career path would be best for someone interested in technology and creativity?",
      provider: 'auto'
    }
  },
  {
    id: 'roadmap',
    title: 'AI Roadmap Generation',
    description: 'Create personalized learning roadmaps based on your goals',
    icon: Target,
    endpoint: '/api/roadmap/generate',
    color: 'from-purple-500 to-pink-500',
    category: 'Planning',
    demoData: {
      careerGoal: 'Full-Stack Web Developer',
      currentLevel: 'intermediate',
      timeCommitment: 15,
      preferredLearningStyle: 'practical',
      existingSkills: ['HTML', 'CSS', 'JavaScript'],
      interests: ['Web Development', 'Mobile Apps']
    }
  },
  {
    id: 'quiz-analysis',
    title: 'AI Career Analysis',
    description: 'Advanced AI analysis of career assessments and personality',
    icon: Brain,
    endpoint: '/api/quiz/analyze',
    color: 'from-green-500 to-emerald-500',
    category: 'Assessment',
    demoData: {
      personalInfo: {
        interests: ['Technology', 'Problem Solving', 'Innovation'],
        skills: ['Programming', 'Analysis', 'Communication'],
        goals: ['Software Developer', 'Tech Leadership'],
        experience: 'intermediate'
      },
      aiAnalysis: true
    }
  },
  {
    id: 'college-recommendations',
    title: 'AI College Matching',
    description: 'Find colleges that match your profile and career goals',
    icon: BookOpen,
    endpoint: '/api/colleges',
    color: 'from-orange-500 to-yellow-500',
    category: 'Education',
    demoData: {
      aiRecommendations: true,
      interests: 'Computer Science,Engineering',
      goals: 'Software Developer,Tech Entrepreneur',
      education: 'High School'
    }
  },
  {
    id: 'skill-insights',
    title: 'AI Skill Analysis',
    description: 'Get intelligent insights about your skill development',
    icon: TrendingUp,
    endpoint: '/api/skills',
    color: 'from-indigo-500 to-purple-500',
    category: 'Development',
    demoData: {
      aiInsights: true,
      goals: 'Full-stack development,Cloud computing,Leadership'
    }
  },
  {
    id: 'recommendations',
    title: 'AI Learning Recommendations',
    description: 'Personalized course and resource recommendations',
    icon: Lightbulb,
    endpoint: '/api/recommendations',
    color: 'from-teal-500 to-cyan-500',
    category: 'Learning',
    demoData: {
      aiPowered: true
    }
  },
  {
    id: 'achievements',
    title: 'AI Achievement Insights',
    description: 'Smart analysis of your progress and achievements',
    icon: Award,
    endpoint: '/api/achievements',
    color: 'from-rose-500 to-pink-500',
    category: 'Progress',
    demoData: {
      aiInsights: true
    }
  },
  {
    id: 'profile-analytics',
    title: 'AI Profile Analytics',
    description: 'Comprehensive AI analysis of your learning journey',
    icon: Users,
    endpoint: '/api/profile/analytics',
    color: 'from-violet-500 to-purple-500',
    category: 'Analytics',
    demoData: {
      aiInsights: true
    }
  }
]

export default function AIFeatureDemo() {
  const [selectedFeature, setSelectedFeature] = useState<AIFeature | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', ...Array.from(new Set(aiFeatures.map(f => f.category)))]

  const filteredFeatures = activeCategory === 'All' 
    ? aiFeatures 
    : aiFeatures.filter(f => f.category === activeCategory)

  const testAIFeature = async (feature: AIFeature) => {
    setLoading(true)
    setResults(null)

    try {
      let url = feature.endpoint
      let options: any = {
        method: feature.endpoint.includes('generate') || 
                feature.endpoint.includes('analyze') ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }

      // Handle different request types
      if (feature.id === 'chat') {
        options.body = JSON.stringify(feature.demoData)
      } else if (feature.id === 'roadmap') {
        options.body = JSON.stringify(feature.demoData)
      } else if (feature.id === 'quiz-analysis') {
        options.body = JSON.stringify(feature.demoData)
      } else {
        // For GET requests, add query parameters
        const params = new URLSearchParams()
        Object.entries(feature.demoData).forEach(([key, value]) => {
          params.append(key, String(value))
        })
        url += `?${params.toString()}`
      }

      const response = await fetch(url, options)
      const data = await response.json()

      if (response.ok) {
        setResults(data)
        toast.success(`✨ AI feature tested successfully!`)
      } else {
        throw new Error(data.error || 'API request failed')
      }
    } catch (error) {
      console.error('AI feature test error:', error)
      toast.error('AI test failed - check console for details')
      setResults({
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-dark via-space-dark to-purple-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mb-4"
          >
            <div className="p-3 bg-gradient-to-r from-neon-cyan to-blue-500 rounded-xl mr-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              AI Feature Demo Center
            </h1>
          </motion.div>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Test and explore all AI-powered features in the Career Advisor Platform. 
            See how artificial intelligence enhances the user experience.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category
                  ? 'bg-neon-cyan text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredFeatures.map((feature) => (
            <motion.div
              key={feature.id}
              whileHover={{ scale: 1.02 }}
              className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 cursor-pointer transition-all ${
                selectedFeature?.id === feature.id ? 'ring-2 ring-neon-cyan' : ''
              }`}
              onClick={() => setSelectedFeature(feature)}
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                  {feature.category}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Test Panel */}
        <AnimatePresence>
          {selectedFeature && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700 overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${selectedFeature.color} p-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <selectedFeature.icon className="w-8 h-8 text-white mr-3" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedFeature.title}</h2>
                      <p className="text-white/80">{selectedFeature.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => testAIFeature(selectedFeature)}
                    disabled={loading}
                    className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Settings className="w-5 h-5" />
                        </motion.div>
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Test AI Feature</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Request Data */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-neon-cyan" />
                      Demo Request Data
                    </h3>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        {JSON.stringify(selectedFeature.demoData, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Results */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center">
                      {results ? (
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      ) : (
                        <Brain className="w-4 h-4 mr-2 text-gray-500" />
                      )}
                      AI Response
                    </h3>
                    <div className="bg-gray-900 rounded-lg p-4 min-h-[200px]">
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full"
                          />
                        </div>
                      ) : results ? (
                        <div className="space-y-4">
                          {results.error ? (
                            <div className="text-red-400 text-sm">
                              <strong>Error:</strong> {results.error}
                            </div>
                          ) : (
                            <pre className="text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(results, null, 2)}
                            </pre>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          Click "Test AI Feature" to see the AI response
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Feature Info */}
                <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                  <h4 className="text-white font-medium mb-2">API Endpoint</h4>
                  <code className="text-neon-cyan text-sm bg-gray-800 px-3 py-1 rounded">
                    {selectedFeature.endpoint}
                  </code>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid md:grid-cols-4 gap-4"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-neon-cyan mb-1">{aiFeatures.length}</div>
            <div className="text-gray-400 text-sm">AI Features</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{categories.length - 1}</div>
            <div className="text-gray-400 text-sm">Categories</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">2</div>
            <div className="text-gray-400 text-sm">AI Providers</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">∞</div>
            <div className="text-gray-400 text-sm">Possibilities</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}