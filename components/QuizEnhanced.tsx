'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Brain, 
  Target,
  Star,
  BarChart3,
  History,
  Play,
  Sparkles,
  Clock,
  TrendingUp,
  Award,
  Calendar,
  Eye,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamically import 3D components
const CareerTree3D = dynamic(() => import('@/components/CareerTree3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-black/20 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-400 text-sm">Loading 3D Career Tree...</p>
      </div>
    </div>
  )
})

interface QuizQuestion {
  id: string
  question: string
  type: 'multiple_choice' | 'scale' | 'multi_select'
  options?: string[]
  category: 'interests' | 'skills' | 'preferences' | 'values' | 'goals'
}

interface QuizResult {
  careerPath: string
  score: number
  interests: string[]
  skills: string[]
  description: string
  relatedCareers: string[]
  averageSalary: string
  growthProspect: string
}

interface PastQuizResult {
  id: string
  career_path: string
  score: number
  interests: string[]
  skills: string[]
  created_at: string
}

const defaultQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: 'What type of work environment energizes you the most?',
    type: 'multiple_choice',
    category: 'preferences',
    options: ['Collaborative team environment', 'Independent remote work', 'Dynamic startup atmosphere', 'Structured corporate setting']
  },
  {
    id: '2',
    question: 'How much do you enjoy solving complex problems?',
    type: 'scale',
    category: 'interests'
  },
  {
    id: '3',
    question: 'Which activities do you find most engaging?',
    type: 'multi_select',
    category: 'interests',
    options: ['Creating and designing', 'Analyzing data and patterns', 'Leading and managing teams', 'Building and coding', 'Teaching and mentoring', 'Researching and exploring']
  },
  {
    id: '4',
    question: 'Rate your communication and presentation skills',
    type: 'scale',
    category: 'skills'
  },
  {
    id: '5',
    question: 'What aspects of work give you the most satisfaction?',
    type: 'multi_select',
    category: 'values',
    options: ['Making a positive impact', 'Learning new things', 'Earning good money', 'Having flexibility', 'Being recognized', 'Working with technology']
  },
  {
    id: '6',
    question: 'Which career paths interest you most?',
    type: 'multi_select',
    category: 'goals',
    options: ['Technology and Software', 'Business and Finance', 'Creative Arts and Design', 'Healthcare and Medicine', 'Education and Research', 'Marketing and Sales']
  },
  {
    id: '7',
    question: 'How important is work-life balance to you?',
    type: 'scale',
    category: 'values'
  },
  {
    id: '8',
    question: 'What is your preferred learning style?',
    type: 'multiple_choice',
    category: 'preferences',
    options: ['Hands-on practice', 'Reading and research', 'Visual learning', 'Collaborative learning']
  }
]

export default function QuizEnhanced() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [view, setView] = useState<'landing' | 'quiz' | 'results'>('landing')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [result, setResult] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [pastQuizzes, setPastQuizzes] = useState<PastQuizResult[]>([])
  const [loadingPast, setLoadingPast] = useState(true)
  const [questions, setQuestions] = useState(defaultQuestions)

  useEffect(() => {
    if (user) {
      loadPastQuizzes()
    } else {
      setLoadingPast(false)
    }
  }, [user])

  const loadPastQuizzes = async () => {
    try {
      const response = await fetch('/api/quiz/past-results')
      if (response.ok) {
        const data = await response.json()
        setPastQuizzes(data.results || [])
      }
    } catch (error) {
      console.error('Failed to load past quizzes:', error)
    } finally {
      setLoadingPast(false)
    }
  }

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      submitQuiz()
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitQuiz = async () => {
    setLoading(true)
    
    try {
      // Submit quiz with real AI analysis
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
            question: questions.find(q => q.id === questionId)?.question || '',
            type: questions.find(q => q.id === questionId)?.type || 'unknown'
          })),
          personalInfo: {
            interests: extractInterestsFromAnswers(),
            skills: extractSkillsFromAnswers(),
            experience: 'beginner'
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit quiz')
      }
      
      const data = await response.json()
      
      // Transform the response to match our QuizResult interface
      const aiResult: QuizResult = {
        careerPath: data.recommendations.primaryCareer.title,
        score: data.recommendations.primaryCareer.match,
        interests: data.recommendations.primaryCareer.skills || [],
        skills: data.recommendations.primaryCareer.skills || [],
        description: data.recommendations.primaryCareer.description,
        relatedCareers: data.recommendations.alternativeCareers?.map((c: any) => c.title) || [],
        averageSalary: data.recommendations.primaryCareer.salaryRange || 'Competitive',
        growthProspect: data.recommendations.primaryCareer.outlook || 'Positive outlook'
      }
      
      setResult(aiResult)
      setView('results')
      toast.success('Quiz completed with AI analysis!')
      
      // Refresh past quizzes
      if (user) {
        await loadPastQuizzes()
      }
      
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast.error('Failed to submit quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const extractInterestsFromAnswers = () => {
    const interests: string[] = []
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId)
      if (question?.category === 'interests' && Array.isArray(answer)) {
        interests.push(...answer)
      }
    })
    return interests
  }

  const extractSkillsFromAnswers = () => {
    const skills: string[] = []
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId)
      if (question?.category === 'skills' && Array.isArray(answer)) {
        skills.push(...answer)
      }
    })
    return skills
  }

  const startNewQuiz = () => {
    setView('quiz')
    setCurrentQuestion(0)
    setAnswers({})
    setResult(null)
  }

  const restartQuiz = () => {
    startNewQuiz()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-space-dark flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Responses...</h2>
          <p className="text-gray-400">Our AI is calculating your perfect career match</p>
        </div>
      </div>
    )
  }

  // Results view
  if (view === 'results' && result) {
    return (
      <div className="min-h-screen bg-space-dark relative overflow-hidden py-20">
        {/* Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid-bg"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-full flex items-center justify-center">
                <Target className="w-10 h-10 text-space-dark" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Your Perfect Career Match!
            </h1>
            <div className="flex items-center justify-center space-x-2 text-neon-cyan">
              <Star className="w-6 h-6 fill-current" />
              <span className="text-2xl font-bold">{result.score}% Match</span>
              <Star className="w-6 h-6 fill-current" />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Career Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card p-8 rounded-2xl"
            >
              <h2 className="text-3xl font-bold text-white mb-4">{result.careerPath}</h2>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                {result.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-neon-cyan" />
                    <span className="text-sm font-medium text-gray-300">Salary Range</span>
                  </div>
                  <p className="text-neon-cyan font-bold">{result.averageSalary}</p>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-neon-pink" />
                    <span className="text-sm font-medium text-gray-300">Growth</span>
                  </div>
                  <p className="text-neon-pink font-bold text-sm">{result.growthProspect}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Your Top Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-neon-cyan/20 text-neon-cyan text-sm rounded-full border border-neon-cyan/30"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Key Skills to Develop</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-neon-pink/20 text-neon-pink text-sm rounded-full border border-neon-pink/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-4">
                <button
                  onClick={restartQuiz}
                  className="flex-1 py-3 px-4 border border-gray-600 text-gray-300 rounded-lg hover:border-neon-cyan hover:text-neon-cyan transition-all"
                >
                  Retake Quiz
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-neon-cyan to-neon-pink text-space-dark font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Go to Dashboard
                </button>
              </div>
            </motion.div>

            {/* 3D Career Tree */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass-card p-6 rounded-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Brain className="w-6 h-6 mr-2 text-neon-cyan" />
                Career Ecosystem
              </h3>
              
              <CareerTree3D
                careerPath={result.careerPath}
                relatedCareers={result.relatedCareers}
                skills={result.skills}
              />
              
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-white mb-3">Related Career Paths</h4>
                <div className="space-y-2">
                  {result.relatedCareers.map((career, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-black/20 rounded-lg">
                      <span className="text-gray-300 text-sm">{career}</span>
                      <button className="text-neon-pink hover:text-neon-cyan transition-colors text-xs">
                        Explore →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setView('landing')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Quiz Hub
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Quiz view
  if (view === 'quiz') {
    const currentQ = questions[currentQuestion]
    const progress = ((currentQuestion + 1) / questions.length) * 100

    return (
      <div className="min-h-screen bg-space-dark relative overflow-hidden py-20">
        {/* Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid-bg"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-4">Career Discovery Quiz</h1>
            <div className="flex items-center justify-center space-x-4 text-gray-400">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-2 mb-8">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-neon-cyan to-neon-pink h-2 rounded-full"
            />
          </div>

          {/* Question Card */}
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8 rounded-2xl mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              {currentQ.question}
            </h2>

            {/* Question Content */}
            {currentQ.type === 'scale' && (
              <ScaleQuestion question={currentQ} questionId={currentQ.id} answers={answers} onAnswer={handleAnswer} />
            )}
            
            {currentQ.type === 'multiple_choice' && (
              <MultipleChoiceQuestion question={currentQ} questionId={currentQ.id} answers={answers} onAnswer={handleAnswer} />
            )}
            
            {currentQ.type === 'multi_select' && (
              <MultiSelectQuestion question={currentQ} questionId={currentQ.id} answers={answers} onAnswer={handleAnswer} />
            )}
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:border-neon-cyan hover:text-neon-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            <button
              onClick={nextQuestion}
              disabled={!answers[currentQ.id]}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-pink text-space-dark font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{currentQuestion === questions.length - 1 ? 'Complete Quiz' : 'Next'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setView('landing')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Quiz Hub
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Landing page view
  return (
    <div className="min-h-screen bg-space-dark text-white relative overflow-hidden pt-16">
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
          className="text-center mb-12"
        >
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1] 
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
            className="w-24 h-24 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink rounded-full mx-auto flex items-center justify-center mb-6 relative overflow-hidden"
          >
            <Brain className="w-12 h-12 text-space-dark relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
              Career Quiz Hub
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover your perfect career path with AI-powered assessments and track your journey over time
          </p>
        </motion.div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Start New Quiz */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0, 255, 255, 0.2)" }}
            className="bg-gradient-to-br from-black/40 to-purple-900/20 backdrop-blur-sm rounded-2xl border border-neon-cyan/30 p-8 cursor-pointer group"
            onClick={startNewQuiz}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-space-dark" />
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-neon-cyan transition-colors" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-neon-cyan transition-colors">
              Start New Assessment
            </h3>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Take our comprehensive AI-powered career assessment to discover your ideal career path with personalized insights and recommendations.
            </p>
            
            <div className="flex items-center text-neon-cyan">
              <Sparkles className="w-5 h-5 mr-2" />
              <span className="font-semibold">Powered by Advanced AI</span>
            </div>
          </motion.div>

          {/* View Past Results */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(147, 51, 234, 0.2)" }}
            className="bg-gradient-to-br from-black/40 to-purple-900/20 backdrop-blur-sm rounded-2xl border border-neon-purple/30 p-8 cursor-pointer group"
          >
            <Link href="/quiz/past-results" className="block">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-neon-purple to-neon-pink rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <History className="w-8 h-8 text-space-dark" />
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-neon-purple transition-colors" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-neon-purple transition-colors">
                View Quiz History
              </h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Track your career assessment progress over time and see how your interests and career matches have evolved.
              </p>
              
              <div className="flex items-center text-neon-purple">
                <Award className="w-5 h-5 mr-2" />
                <span className="font-semibold">{pastQuizzes.length} Quiz{pastQuizzes.length !== 1 ? 'es' : ''} Completed</span>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Recent Quiz Results Preview */}
        {!loadingPast && pastQuizzes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-3 text-neon-cyan" />
              Recent Results
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pastQuizzes.slice(0, 3).map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4 hover:border-neon-cyan/50 transition-colors group cursor-pointer"
                >
                  <Link href="/quiz/past-results" className="block">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`bg-gradient-to-r ${getScoreBackground(quiz.score)} px-2 py-1 rounded-lg`}>
                        <span className={`text-xs font-bold ${getScoreColor(quiz.score)}`}>
                          {quiz.score}%
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-neon-cyan transition-colors" />
                    </div>
                    
                    <h4 className="font-semibold text-white mb-2 group-hover:text-neon-cyan transition-colors">
                      {quiz.career_path}
                    </h4>
                    
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(quiz.created_at)}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-6">
              <Link href="/quiz/past-results">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-neon-cyan hover:text-white transition-colors font-semibold"
                >
                  View All Results →
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Statistics */}
        {!loadingPast && pastQuizzes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
              <div className="text-2xl font-bold text-neon-cyan mb-1">{pastQuizzes.length}</div>
              <div className="text-gray-400 text-sm">Total Assessments</div>
            </div>
            
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
              <div className="text-2xl font-bold text-neon-purple mb-1">
                {Math.round(pastQuizzes.reduce((acc, quiz) => acc + quiz.score, 0) / pastQuizzes.length)}%
              </div>
              <div className="text-gray-400 text-sm">Average Match</div>
            </div>
            
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
              <div className="text-2xl font-bold text-neon-pink mb-1">
                {Math.max(...pastQuizzes.map(q => q.score))}%
              </div>
              <div className="text-gray-400 text-sm">Best Score</div>
            </div>
            
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {new Set(pastQuizzes.map(q => q.career_path)).size}
              </div>
              <div className="text-gray-400 text-sm">Career Paths</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Question Components
const ScaleQuestion = ({ question, questionId, answers, onAnswer }: any) => {
  const value = answers[questionId] || 5
  
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onAnswer(questionId, parseInt(e.target.value))}
          className="w-full max-w-md h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #00FFFF 0%, #00FFFF ${value * 10}%, #374151 ${value * 10}%, #374151 100%)`
          }}
        />
      </div>
      <div className="flex justify-between text-sm text-gray-400 max-w-md mx-auto">
        <span>1 (Low)</span>
        <span className="text-neon-cyan font-bold text-lg">{value}</span>
        <span>10 (High)</span>
      </div>
    </div>
  )
}

const MultipleChoiceQuestion = ({ question, questionId, answers, onAnswer }: any) => {
  const selectedValue = answers[questionId] || ''
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {question.options?.map((option: string, index: number) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAnswer(questionId, option)}
          className={`p-4 rounded-lg border text-left transition-all ${
            selectedValue === option
              ? 'border-neon-cyan bg-neon-cyan/10 text-white'
              : 'border-gray-600 bg-black/20 text-gray-300 hover:border-gray-500'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full border-2 ${
              selectedValue === option
                ? 'border-neon-cyan bg-neon-cyan'
                : 'border-gray-500'
            }`}>
              {selectedValue === option && (
                <CheckCircle className="w-4 h-4 text-space-dark" />
              )}
            </div>
            <span>{option}</span>
          </div>
        </motion.button>
      ))}
    </div>
  )
}

const MultiSelectQuestion = ({ question, questionId, answers, onAnswer }: any) => {
  const selectedValues = answers[questionId] || []
  
  const toggleOption = (option: string) => {
    const newSelected = selectedValues.includes(option)
      ? selectedValues.filter((item: string) => item !== option)
      : [...selectedValues, option]
    onAnswer(questionId, newSelected)
  }
  
  return (
    <div>
      <p className="text-gray-400 text-sm mb-4">Select all that apply:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options?.map((option: string, index: number) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleOption(option)}
            className={`p-3 rounded-lg border text-left transition-all ${
              selectedValues.includes(option)
                ? 'border-neon-cyan bg-neon-cyan/10 text-white'
                : 'border-gray-600 bg-black/20 text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded border-2 ${
                selectedValues.includes(option)
                  ? 'border-neon-cyan bg-neon-cyan'
                  : 'border-gray-500'
              }`}>
                {selectedValues.includes(option) && (
                  <CheckCircle className="w-4 h-4 text-space-dark" />
                )}
              </div>
              <span className="text-sm">{option}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}