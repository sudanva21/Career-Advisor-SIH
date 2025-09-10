'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Clock, TrendingUp, Award, Calendar, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface QuizResult {
  id: string
  career_path: string
  score: number
  interests: string[]
  skills: string[]
  answers: any
  created_at: string
}

export default function CompletedQuizzesPage() {
  const { user, authLoading } = useAuth()
  const router = useRouter()
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user && process.env.NODE_ENV !== 'development') {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user || process.env.NODE_ENV === 'development') {
      fetchQuizResults()
    }
  }, [user])

  const fetchQuizResults = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/quiz/results')
      
      if (!response.ok) {
        throw new Error('Failed to fetch quiz results')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setQuizResults(data.results || [])
      } else {
        setError(data.error || 'Failed to load quiz results')
      }
    } catch (error) {
      console.error('Error fetching quiz results:', error)
      setError('Failed to load quiz results')
      toast.error('Failed to load quiz results')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: 'Excellent', color: 'bg-green-500' }
    if (score >= 80) return { text: 'Very Good', color: 'bg-blue-500' }
    if (score >= 60) return { text: 'Good', color: 'bg-yellow-500' }
    return { text: 'Needs Improvement', color: 'bg-red-500' }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (authLoading || loading) {
    return <LoadingSpinner message="Loading your quiz results..." />
  }

  return (
    <div className="min-h-screen" style={{ background: '#0B0E17' }}>
      {/* Header */}
      <div className="relative pt-24 pb-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Link
                  href="/dashboard"
                  className="mr-4 p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-neon-cyan transition-all"
                >
                  <ArrowLeft size={20} />
                </Link>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center">
                    <Brain size={36} className="mr-3 text-neon-cyan" />
                    Completed Quizzes
                  </h1>
                  <p className="text-gray-400 text-lg mt-2">
                    Track your career assessment progress and results
                  </p>
                </div>
              </div>
              
              <Link
                href="/quiz"
                className="px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-pink text-black rounded-lg font-semibold hover:scale-105 transition-transform hover:shadow-lg hover:shadow-neon-cyan/25"
              >
                Take New Quiz
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-12">
        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {quizResults.length === 0 && !error ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-12 max-w-2xl mx-auto">
              <Brain size={80} className="mx-auto mb-6 text-neon-cyan opacity-50" />
              <h2 className="text-2xl font-bold text-white mb-4">
                No Quizzes Completed Yet
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                You haven't completed any quizzes yet. Try completing one to get started!
                <br />
                Our AI-powered career assessment will help you discover your ideal career path.
              </p>
              <Link
                href="/quiz"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-pink text-black rounded-lg font-semibold hover:scale-105 transition-transform hover:shadow-lg hover:shadow-neon-cyan/25"
              >
                <Brain size={20} className="mr-2" />
                Take Your First Quiz
              </Link>
            </div>
          </motion.div>
        ) : (
          // Quiz Results Grid
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {quizResults.map((quiz, index) => {
              const badge = getScoreBadge(quiz.score)
              
              return (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-neon-cyan to-blue-500 bg-opacity-20 mr-4">
                        <Brain size={24} className="text-neon-cyan" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white group-hover:text-neon-cyan transition-colors">
                          Career Assessment
                        </h3>
                        <div className="flex items-center text-gray-400 text-sm mt-1">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(quiz.created_at)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getScoreColor(quiz.score)} mb-1`}>
                        {quiz.score}%
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color} text-white`}>
                        {badge.text}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Career Path */}
                    <div className="bg-gray-800/30 rounded-lg p-4">
                      <h4 className="text-neon-pink font-semibold mb-2 flex items-center">
                        <Award size={16} className="mr-2" />
                        Recommended Career Path
                      </h4>
                      <p className="text-white text-lg font-medium">{quiz.career_path}</p>
                    </div>

                    {/* Interests */}
                    {quiz.interests && quiz.interests.length > 0 && (
                      <div>
                        <h4 className="text-gray-300 font-semibold mb-2 text-sm">Identified Interests</h4>
                        <div className="flex flex-wrap gap-2">
                          {quiz.interests.slice(0, 4).map((interest, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-neon-cyan/20 text-neon-cyan text-xs rounded-full"
                            >
                              {interest}
                            </span>
                          ))}
                          {quiz.interests.length > 4 && (
                            <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                              +{quiz.interests.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {quiz.skills && quiz.skills.length > 0 && (
                      <div>
                        <h4 className="text-gray-300 font-semibold mb-2 text-sm">Identified Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {quiz.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-neon-purple/20 text-neon-purple text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {quiz.skills.length > 3 && (
                            <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                              +{quiz.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                      <button
                        onClick={() => {
                          toast.success('Opening detailed quiz analysis...')
                          // In a real app, this would show detailed results
                        }}
                        className="text-neon-cyan hover:text-white text-sm font-medium transition-colors flex items-center"
                      >
                        <TrendingUp size={14} className="mr-1" />
                        View Analysis
                      </button>
                      
                      <button
                        onClick={() => {
                          toast.success('Retaking quiz with similar parameters...')
                          router.push('/quiz')
                        }}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                      >
                        Retake Quiz
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Summary Stats */}
        {quizResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <TrendingUp size={24} className="mr-3 text-neon-pink" />
              Your Quiz Performance
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-neon-cyan mb-2">
                  {quizResults.length}
                </div>
                <div className="text-gray-400">Total Quizzes</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-neon-pink mb-2">
                  {Math.round(quizResults.reduce((acc, quiz) => acc + quiz.score, 0) / quizResults.length)}%
                </div>
                <div className="text-gray-400">Average Score</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-neon-purple mb-2">
                  {quizResults.filter(quiz => quiz.score >= 80).length}
                </div>
                <div className="text-gray-400">High Scores (80%+)</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}