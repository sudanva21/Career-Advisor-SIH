'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  History, 
  Trophy, 
  Calendar, 
  BarChart3, 
  TrendingUp,
  Brain,
  Target,
  Play,
  Star,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface PastQuizResult {
  id: string
  career_path: string
  score: number
  interests: string[]
  skills: string[]
  answers: any
  ai_analysis?: any
  created_at: string
}

export default function PastQuizResultsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [quizResults, setQuizResults] = useState<PastQuizResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResult, setSelectedResult] = useState<PastQuizResult | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin?next=/quiz/past-results')
      return
    }
    loadPastResults()
  }, [user, router])

  const loadPastResults = async () => {
    try {
      const response = await fetch('/api/quiz/past-results')
      if (response.ok) {
        const data = await response.json()
        setQuizResults(data.results || [])
      } else {
        throw new Error('Failed to load results')
      }
    } catch (error) {
      console.error('Failed to load past quiz results:', error)
      toast.error('Failed to load past quiz results')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'from-green-500/20 to-emerald-500/20'
    if (score >= 60) return 'from-yellow-500/20 to-amber-500/20'
    return 'from-orange-500/20 to-red-500/20'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-space-dark text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-cyan-900/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-neon-cyan/5 to-neon-purple/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-neon-purple/5 to-neon-pink/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Link href="/quiz">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 hover:border-neon-cyan/50 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-400 hover:text-white" />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                Quiz History
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                Track your career assessment progress over time
              </p>
            </div>
          </div>
          
          <Link href="/quiz">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-neon-cyan to-neon-purple text-black font-semibold px-6 py-3 rounded-xl flex items-center"
            >
              <Play className="w-5 h-5 mr-2" />
              Take New Quiz
            </motion.button>
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-600 rounded mb-4" />
                <div className="h-4 bg-gray-700 rounded mb-2" />
                <div className="h-4 bg-gray-700 rounded w-2/3" />
              </motion.div>
            ))}
          </div>
        ) : quizResults.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1] 
              }}
              transition={{ 
                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity }
              }}
              className="w-24 h-24 bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <History className="w-12 h-12 text-neon-cyan" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-4">No Quiz History Yet</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Take your first career assessment quiz to start building your personalized career insights and track your progress over time.
            </p>
            <Link href="/quiz">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-neon-cyan to-neon-purple text-black font-bold px-8 py-4 rounded-xl"
              >
                Take Your First Quiz
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Statistics Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-gradient-to-br from-black/40 to-purple-900/20 backdrop-blur-sm rounded-xl border border-neon-cyan/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Quizzes</p>
                    <p className="text-2xl font-bold text-white">{quizResults.length}</p>
                  </div>
                  <Brain className="w-8 h-8 text-neon-cyan" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-black/40 to-purple-900/20 backdrop-blur-sm rounded-xl border border-neon-purple/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Average Score</p>
                    <p className="text-2xl font-bold text-white">
                      {Math.round(quizResults.reduce((acc, result) => acc + result.score, 0) / quizResults.length)}%
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-neon-purple" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-black/40 to-purple-900/20 backdrop-blur-sm rounded-xl border border-neon-pink/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Best Score</p>
                    <p className="text-2xl font-bold text-white">
                      {Math.max(...quizResults.map(r => r.score))}%
                    </p>
                  </div>
                  <Trophy className="w-8 h-8 text-neon-pink" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-black/40 to-purple-900/20 backdrop-blur-sm rounded-xl border border-green-500/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Latest Score</p>
                    <p className="text-2xl font-bold text-white">
                      {quizResults[0]?.score || 0}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </motion.div>

            {/* Quiz Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizResults.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 10px 30px rgba(0, 255, 255, 0.2)"
                  }}
                  className="bg-gradient-to-br from-black/40 to-purple-900/20 backdrop-blur-sm rounded-xl border border-white/10 hover:border-neon-cyan/50 p-6 cursor-pointer transition-all duration-300 group"
                  onClick={() => setSelectedResult(result)}
                >
                  {/* Score Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`bg-gradient-to-r ${getScoreBackground(result.score)} px-3 py-1 rounded-lg`}>
                      <span className={`text-sm font-bold ${getScoreColor(result.score)}`}>
                        {result.score}% Match
                      </span>
                    </div>
                    <div className="flex items-center text-gray-400 group-hover:text-neon-cyan transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Career Path */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-neon-cyan transition-colors">
                    {result.career_path}
                  </h3>

                  {/* Interests */}
                  <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-2">Key Interests:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.interests.slice(0, 3).map((interest, i) => (
                        <span 
                          key={i}
                          className="bg-neon-cyan/10 text-neon-cyan text-xs px-2 py-1 rounded-lg border border-neon-cyan/20"
                        >
                          {interest}
                        </span>
                      ))}
                      {result.interests.length > 3 && (
                        <span className="text-gray-400 text-xs">
                          +{result.interests.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-2">Top Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.skills.slice(0, 2).map((skill, i) => (
                        <span 
                          key={i}
                          className="bg-neon-purple/10 text-neon-purple text-xs px-2 py-1 rounded-lg border border-neon-purple/20"
                        >
                          {skill}
                        </span>
                      ))}
                      {result.skills.length > 2 && (
                        <span className="text-gray-400 text-xs">
                          +{result.skills.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center text-gray-400 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(result.created_at)}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Detailed Result Modal */}
        <AnimatePresence>
          {selectedResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedResult(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gradient-to-br from-space-dark via-purple-900/50 to-space-dark backdrop-blur-xl rounded-2xl border border-neon-cyan/30 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center bg-gradient-to-r ${getScoreBackground(selectedResult.score)} px-4 py-2 rounded-xl mb-4`}>
                    <Star className={`w-5 h-5 mr-2 ${getScoreColor(selectedResult.score)}`} />
                    <span className={`font-bold ${getScoreColor(selectedResult.score)}`}>
                      {selectedResult.score}% Career Match
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedResult.career_path}</h2>
                  <p className="text-gray-400">{formatDate(selectedResult.created_at)}</p>
                </div>

                <div className="space-y-6">
                  {/* Interests */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-neon-cyan" />
                      Your Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedResult.interests.map((interest, i) => (
                        <span 
                          key={i}
                          className="bg-neon-cyan/10 text-neon-cyan px-3 py-2 rounded-lg border border-neon-cyan/20"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-neon-purple" />
                      Your Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedResult.skills.map((skill, i) => (
                        <span 
                          key={i}
                          className="bg-neon-purple/10 text-neon-purple px-3 py-2 rounded-lg border border-neon-purple/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Analysis */}
                  {selectedResult.ai_analysis && (
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-neon-pink" />
                        AI Analysis
                      </h3>
                      <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                        <p className="text-gray-300 leading-relaxed">
                          {selectedResult.ai_analysis.summary || 'Detailed AI analysis will be available with future assessments.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setSelectedResult(null)}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    Close
                  </button>
                  <Link href="/quiz" className="flex-1">
                    <button className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple text-black font-bold py-3 px-6 rounded-xl flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retake Quiz
                    </button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}