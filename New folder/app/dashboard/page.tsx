'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Brain, 
  GraduationCap, 
  Target, 
  Clock, 
  TrendingUp, 
  Star,
  MapPin,
  Calendar,
  Award,
  Zap,
  BookOpen,
  Trophy,
  Bell,
  Settings,
  ChevronRight,
  Play,
  BarChart3,
  Bookmark,
  Activity,
  Code,
  Lightbulb,
  Users,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts'
import Link from 'next/link'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import WebGLErrorBoundary from '@/components/ui/WebGLErrorBoundary'
import InteractionErrorBoundary from '@/components/ui/InteractionErrorBoundary'
import ExternalChatbot from '@/components/ExternalChatbot'
import toast from 'react-hot-toast'
import { useDashboardUpdates } from '@/lib/hooks/useRealtimeUpdates'

// Dynamically import 3D components with SSR disabled
const RoadmapPreview3D = dynamic(() => import('@/components/dashboard/RoadmapPreview3D'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-800/50 rounded-xl animate-pulse" />
})

const SkillProgress3D = dynamic(() => import('@/components/dashboard/SkillProgress3D'), {
  ssr: false,
  loading: () => <div className="w-full h-48 bg-gray-800/50 rounded-xl animate-pulse" />
})

const AchievementShowcase3D = dynamic(() => import('@/components/dashboard/AchievementShowcase3D'), {
  ssr: false,
  loading: () => <div className="w-full h-32 bg-gray-800/50 rounded-xl animate-pulse" />
})

interface DashboardData {
  stats: {
    completedQuizzes: number
    savedColleges: number
    skillsAcquired: number
    achievementsUnlocked: number
    roadmapProgress: number
    weeklyProgress: number
  }
  recentActivity: Activity[]
  skillProgress: SkillData[]
  recommendations: Recommendation[]
  upcomingTasks: Task[]
}

interface Activity {
  id: string
  type: 'quiz' | 'college' | 'skill' | 'achievement' | 'roadmap'
  title: string
  description: string
  timestamp: Date
  icon: any
  color: string
}

interface SkillData {
  name: string
  current: number
  target: number
  category: string
}

interface Recommendation {
  id: string
  type: 'course' | 'skill' | 'college' | 'career'
  title: string
  description: string
  reason: string
  confidence: number
  action: string
}

interface Task {
  id: string
  title: string
  type: 'study' | 'practice' | 'apply' | 'research'
  priority: 'high' | 'medium' | 'low'
  dueDate: Date
  estimated: string
}

// Enhanced Stats Card Component
function StatsCard({ icon: Icon, label, value, trend, color, onClick }: {
  icon: any
  label: string
  value: string | number
  trend?: { value: number, isPositive: boolean }
  color: string
  onClick?: () => void
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log(`📊 Stats card clicked: ${label}`)
    if (onClick) {
      onClick()
    } else {
      console.warn('⚠️ No onClick handler provided for stats card:', label)
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-all duration-300 cursor-pointer group ${onClick ? 'hover:shadow-lg' : ''}`}
      style={{ position: 'relative', zIndex: 1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color} bg-opacity-20`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
            trend.isPositive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
          }`}>
            <TrendingUp size={12} className={trend.isPositive ? '' : 'rotate-180'} />
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      
      <div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
          {label}
        </div>
      </div>
    </motion.div>
  )
}

// Activity Feed Component
function ActivityFeed({ activities, onActivityClick }: { 
  activities: Activity[], 
  onActivityClick: (activity: Activity) => void 
}) {
  const [realActivities, setRealActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activity?limit=20')
        const data = await response.json()
        setRealActivities(data.activities || [])
      } catch (error) {
        console.error('Failed to fetch activities:', error)
        // Fallback to provided activities
        setRealActivities(activities || [])
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const displayActivities = showAll ? realActivities : realActivities.slice(0, 6)

  const getActivityIcon = (type: string) => {
    const iconMap: any = {
      achievement: Trophy,
      roadmap: Target,
      college: Bookmark,
      quiz: Brain,
      skill: Zap,
      project: Code,
      streak: Users, // Using Users as Fire icon replacement
      recommendation: Lightbulb
    }
    return iconMap[type] || Activity
  }

  const handleActivityClick = async (activity: any) => {
    // Log click activity
    try {
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'interaction',
          title: 'Activity Clicked',
          description: `Clicked on "${activity.title}"`,
          metadata: { originalActivityId: activity.id, originalType: activity.type }
        })
      })
    } catch (error) {
      console.error('Failed to log activity click:', error)
    }
    
    onActivityClick(activity)
    toast(`Viewing: ${activity.title}`)
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-6 w-48"></div>
          <div className="space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex space-x-3">
                <div className="h-10 w-10 bg-gray-700 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Clock size={20} className="mr-2 text-neon-cyan" />
          Recent Activity
        </h3>
        <button 
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-neon-cyan hover:text-white transition-colors"
        >
          {showAll ? 'Show Less' : 'View All'}
        </button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {displayActivities.map((activity, index) => {
          const IconComponent = getActivityIcon(activity.type)
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors cursor-pointer group"
              onClick={() => handleActivityClick(activity)}
            >
              <div className={`p-2 rounded-lg ${activity.color || 'bg-neon-cyan'} bg-opacity-20 group-hover:bg-opacity-30 transition-colors`}>
                <IconComponent size={16} className="text-white" />
              </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-white truncate group-hover:text-neon-cyan transition-colors">
                {activity.title}
              </h4>
              <p className="text-xs text-gray-400 mt-1 group-hover:text-gray-300 transition-colors">
                {activity.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </span>
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full">
                    {activity.type}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
          )
        })}
      </div>
      
      {realActivities.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-400">
          <Activity size={48} className="mx-auto mb-2 opacity-50" />
          <p>No recent activity</p>
          <p className="text-sm">Start learning to see your activity here!</p>
        </div>
      )}
    </div>
  )
}

// AI Recommendations Component
function AIRecommendations({ 
  recommendations, 
  onRecommendationAction 
}: { 
  recommendations: Recommendation[], 
  onRecommendationAction: (recommendation: Recommendation) => void 
}) {
  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Brain size={20} className="mr-2 text-neon-pink" />
          AI Recommendations
        </h3>
        <div className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">
          Powered by AI
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-white group-hover:text-neon-cyan transition-colors">
                {rec.title}
              </h4>
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <Star size={12} className="text-yellow-400" />
                <span>{Math.round(rec.confidence * 100)}%</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mb-3">{rec.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Recommended because: {rec.reason}
              </span>
              <button 
                onClick={() => onRecommendationAction(rec)}
                className="px-3 py-1 bg-neon-cyan/20 text-neon-cyan text-xs rounded-lg hover:bg-neon-cyan/30 transition-colors"
              >
                {rec.action}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Upcoming Tasks Component  
function UpcomingTasks({ tasks, onTaskAction }: { 
  tasks: Task[], 
  onTaskAction: (task: Task) => void 
}) {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'low': return 'text-green-400 bg-green-400/10'
    }
  }

  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Target size={20} className="mr-2 text-neon-purple" />
          Upcoming Tasks
        </h3>
        <Link href="/roadmap" className="text-sm text-neon-purple hover:text-white transition-colors">
          View Roadmap
        </Link>
      </div>

      <div className="space-y-3">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/30 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
              <div>
                <h4 className="text-sm font-medium text-white group-hover:text-neon-cyan transition-colors">
                  {task.title}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className="text-xs text-gray-500">{task.estimated}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => onTaskAction(task)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded"
            >
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Progress Chart Component
function ProgressChart({ data }: { data: any[] }) {
  const [skillsData, setSkillsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSkillsData = async () => {
      try {
        const response = await fetch('/api/skills')
        const data = await response.json()
        setSkillsData(data)
      } catch (error) {
        console.error('Failed to fetch skills data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSkillsData()
  }, [])

  const handleSkillClick = async (skillId: string, currentProgress: number) => {
    const newProgress = Math.min(currentProgress + 5, 100)
    
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_progress',
          skillId,
          progress: newProgress
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Progress updated!')
        
        // Refresh skills data
        const skillsResponse = await fetch('/api/skills')
        const updatedSkillsData = await skillsResponse.json()
        setSkillsData(updatedSkillsData)
      }
    } catch (error) {
      toast.error('Failed to update skill progress')
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-6 w-48"></div>
          <div className="space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                  <div className="h-4 bg-gray-700 rounded w-10"></div>
                </div>
                <div className="h-2 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const displaySkills = skillsData?.skills?.slice(0, 6) || data

  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <BarChart3 size={20} className="mr-2 text-neon-cyan" />
          Skill Progress
        </h3>
        <div className="text-xs text-gray-400">
          Avg: {skillsData?.stats?.averageProgress || 0}%
        </div>
      </div>
      
      <div className="space-y-4">
        {displaySkills.map((skill: any, index: number) => (
          <div key={skill.id || index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-gray-300">{skill.name}</span>
                <span className="text-xs text-gray-500 ml-2">({skill.category})</span>
              </div>
              <span className="text-sm text-neon-cyan">{skill.current || skill.value}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 cursor-pointer hover:bg-gray-600 transition-colors"
                 onClick={() => handleSkillClick(skill.id, skill.current || skill.value)}>
              <motion.div 
                className="bg-gradient-to-r from-neon-cyan to-neon-purple h-2 rounded-full relative group"
                initial={{ width: 0 }}
                animate={{ width: `${skill.current || skill.value}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              >
                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </div>
            {skill.target && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Current: {skill.current}%</span>
                <span>Target: {skill.target}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-neon-cyan">{skillsData?.stats?.totalSkills || 0}</div>
            <div className="text-xs text-gray-400">Total Skills</div>
          </div>
          <div>
            <div className="text-lg font-bold text-neon-purple">{skillsData?.stats?.skillsImproving || 0}</div>
            <div className="text-xs text-gray-400">Improving</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-400">{skillsData?.stats?.skillsToFocus || 0}</div>
            <div className="text-xs text-gray-400">Need Focus</div>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <Link 
          href="/profile?tab=skills" 
          className="text-sm text-neon-cyan hover:text-white transition-colors flex items-center justify-center py-2 px-4 border border-neon-cyan/30 rounded-lg hover:bg-neon-cyan/10"
        >
          View All Skills & Add Experience
          <ExternalLink size={14} className="ml-1" />
        </Link>
      </div>
    </div>
  )
}

// Recent Achievements Component
function RecentAchievements({ userId }: { userId: string }) {
  const [achievements, setAchievements] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch('/api/achievements')
        const data = await response.json()
        setAchievements(data)
      } catch (error) {
        console.error('Failed to fetch achievements:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAchievements()
  }, [])

  const handleAchievementClick = async (achievement: any) => {
    toast.success(`${achievement.icon} ${achievement.title}!`)
    
    // Log achievement view
    try {
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'achievement',
          title: 'Achievement Viewed',
          description: `Viewed "${achievement.title}" achievement`,
          metadata: { achievementId: achievement.id }
        })
      })
    } catch (error) {
      console.error('Failed to log achievement view:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4 w-48"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const recentAchievements = achievements?.completed?.slice(-4) || []
  const inProgressAchievements = achievements?.inProgress?.slice(0, 2) || []

  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Trophy size={20} className="mr-2 text-yellow-400" />
          Recent Achievements
        </h3>
        <Link 
          href="/profile?tab=achievements"
          className="text-yellow-400 hover:text-white transition-colors text-sm"
        >
          View All
        </Link>
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-xl font-bold text-yellow-400">{achievements?.stats?.totalCompleted || 0}</div>
          <div className="text-xs text-gray-400">Unlocked</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-cyan-400">{achievements?.inProgress?.length || 0}</div>
          <div className="text-xs text-gray-400">In Progress</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-400">{achievements?.stats?.pointsEarned || 0}</div>
          <div className="text-xs text-gray-400">Points</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-orange-400">{achievements?.stats?.completionRate || 0}%</div>
          <div className="text-xs text-gray-400">Progress</div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-300 flex items-center">
          <Star size={16} className="mr-2 text-yellow-400" />
          Recently Unlocked
        </h4>
        
        <div className="grid gap-3">
          {recentAchievements.map((achievement: any, index: number) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-lg border border-yellow-500/20 cursor-pointer hover:bg-yellow-500/20 transition-colors group"
              onClick={() => handleAchievementClick(achievement)}
            >
              <div className="text-2xl">{achievement.icon}</div>
              <div className="flex-1">
                <h5 className="text-sm font-medium text-white group-hover:text-yellow-400 transition-colors">
                  {achievement.title}
                </h5>
                <p className="text-xs text-gray-400">
                  {achievement.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    achievement.rarity === 'legendary' ? 'bg-orange-500/20 text-orange-400' :
                    achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                    achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {achievement.rarity}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* In Progress Achievements */}
        {inProgressAchievements.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-300 flex items-center mb-3">
              <Target size={16} className="mr-2 text-cyan-400" />
              In Progress
            </h4>
            
            <div className="space-y-3">
              {inProgressAchievements.map((achievement: any) => (
                <div
                  key={achievement.id}
                  className="flex items-center space-x-3 p-3 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-lg border border-cyan-500/20"
                >
                  <div className="text-xl opacity-60">{achievement.icon}</div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-white">
                      {achievement.title}
                    </h5>
                    <p className="text-xs text-gray-400 mb-2">
                      {achievement.description}
                    </p>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                      <span>{Math.round((achievement.progress / achievement.maxProgress) * 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {achievements && achievements.completed && achievements.completed.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Trophy size={48} className="mx-auto mb-2 opacity-50" />
          <p>No achievements yet</p>
          <p className="text-sm">Complete quizzes and projects to start earning achievements!</p>
        </div>
      )}
    </div>
  )
}

export default function EnhancedDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('overview')

  // Handler functions for interactive elements
  const handleRecommendationAction = async (recommendation: Recommendation) => {
    try {
      toast.loading('Processing recommendation...')
      
      // Log activity for taking action on recommendation
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'recommendation',
          title: `Acted on AI Recommendation`,
          description: `Started working on: ${recommendation.title}`,
          metadata: { 
            recommendationId: recommendation.id,
            action: recommendation.action,
            confidence: recommendation.confidence
          }
        })
      })

      // Route based on recommendation type
      switch (recommendation.type) {
        case 'course':
          toast.success('Redirecting to courses...')
          // In a real app, this would redirect to the specific course
          window.open('https://coursera.org', '_blank')
          break
        case 'skill':
          toast.success('Opening skill development resources...')
          router.push('/roadmap')
          break
        case 'college':
          toast.success('Opening college information...')
          router.push('/colleges')
          break
        case 'career':
          toast.success('Exploring career opportunities...')
          window.open('https://linkedin.com/jobs', '_blank')
          break
        default:
          toast.success('Recommendation noted!')
      }
    } catch (error) {
      console.error('Error handling recommendation:', error)
      toast.error('Failed to process recommendation')
    }
  }

  const handleTaskAction = async (task: Task) => {
    try {
      toast.loading('Opening task details...')
      
      // Log activity for task interaction
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'task',
          title: 'Task Interaction',
          description: `Viewed details for: ${task.title}`,
          metadata: { 
            taskId: task.id,
            taskType: task.type,
            priority: task.priority
          }
        })
      })

      // Route based on task type
      switch (task.type) {
        case 'study':
          toast.success('Opening learning materials...')
          router.push('/roadmap')
          break
        case 'practice':
          toast.success('Opening practice environment...')
          router.push('/roadmap')
          break
        case 'apply':
          toast.success('Opening application resources...')
          router.push('/colleges')
          break
        case 'research':
          toast.success('Opening research materials...')
          router.push('/colleges')
          break
        default:
          toast.success('Task details loaded!')
      }
    } catch (error) {
      console.error('Error handling task:', error)
      toast.error('Failed to open task details')
    }
  }

  const handleActivityClick = (activity: Activity) => {
    // Route based on activity type
    switch (activity.type) {
      case 'achievement':
        router.push('/profile?tab=achievements')
        toast.success('Opening achievements...')
        break
      case 'roadmap':
        router.push('/roadmap')
        toast.success('Opening roadmap...')
        break
      case 'college':
        router.push('/colleges')
        toast.success('Opening colleges...')
        break
      case 'quiz':
        router.push('/quiz')
        toast.success('Opening quiz section...')
        break
      case 'skill':
        router.push('/profile?tab=skills')
        toast.success('Opening skills...')
        break
      default:
        toast.success('Activity details loaded!')
    }
  }

  const handleSkillClick = (skill: any) => {
    toast.success(`Opening ${skill.name} skill details...`)
    // In a real app, this would navigate to a detailed skill page
    router.push('/profile?tab=skills')
  }

  useEffect(() => {
    // In development mode, allow access without authentication for demo purposes
    if (!authLoading && !user && process.env.NODE_ENV !== 'development') {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    // Always fetch data in development, or when user is authenticated
    if (user || process.env.NODE_ENV === 'development') {
      fetchDashboardData()
    }
  }, [user])

  // Set up real-time updates for dashboard data using the new hook
  const { stats: realtimeStats, isLoading: realTimeLoading, error: realTimeError, isConnected, refresh } = useDashboardUpdates()
  
  useEffect(() => {
    if (isConnected) {
      console.log('🔄 Real-time connection established')
      toast.success('Real-time updates connected!', { duration: 2000 })
    }
  }, [isConnected])

  // Helper function to get icon component from string name
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'Trophy': Trophy,
      'Target': Target,
      'Bookmark': Bookmark,
      'Brain': Brain,
      'Zap': Zap,
      'Code': BookOpen,
      'Fire': Zap,
      'Lightbulb': Star,
      'GraduationCap': GraduationCap,
      'Clock': Clock,
      'Award': Award
    }
    return iconMap[iconName] || Trophy
  }

  // Helper function to get default color for activity type
  const getDefaultColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'achievement': 'bg-yellow-500',
      'roadmap': 'bg-neon-cyan',
      'college': 'bg-neon-pink',
      'quiz': 'bg-blue-500',
      'skill': 'bg-purple-500',
      'project': 'bg-green-500',
      'streak': 'bg-orange-500',
      'recommendation': 'bg-cyan-500'
    }
    return colorMap[type] || 'bg-gray-500'
  }

  const fetchDashboardData = async () => {
    try {
      console.log('🔄 Fetching comprehensive dashboard data...')
      setLoading(true)
      
      // Fetch dashboard data, user stats, skills, and recommendations concurrently
      const [dashboardResponse, userStatsResponse, skillsResponse, recommendationsResponse] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/user-stats'), // New comprehensive stats API
        fetch('/api/skills'),
        fetch('/api/recommendations')
      ])
      
      const [dashboardData, userStatsData, skillsData, recommendationsData] = await Promise.all([
        dashboardResponse.ok ? dashboardResponse.json() : { stats: {}, recentActivity: [], skillProgress: [], upcomingTasks: [] },
        userStatsResponse.ok ? userStatsResponse.json() : { success: false, stats: {} },
        skillsResponse.ok ? skillsResponse.json() : { skills: [] },
        recommendationsResponse.ok ? recommendationsResponse.json() : { recommendations: [] }
      ])
      
      // Use user stats for accurate counts, fallback to dashboard data
      const stats = userStatsData.success ? {
        completedQuizzes: userStatsData.stats.completedQuizzes,
        savedColleges: userStatsData.stats.savedColleges,
        skillsAcquired: userStatsData.stats.skillsTracked,
        achievementsUnlocked: userStatsData.stats.achievementsUnlocked,
        roadmapProgress: userStatsData.stats.averageSkillLevel,
        weeklyProgress: userStatsData.stats.weeklyProgress
      } : dashboardData.stats
      
      console.log('📊 Dashboard stats loaded:', stats)
      
      // Transform activity data to include proper icon components
      const transformedActivity = (dashboardData.recentActivity || []).map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp),
        icon: getIconComponent(activity.icon),
        color: activity.color || getDefaultColor(activity.type)
      }))
      
      // Use real skills data if available, otherwise use user stats top skills
      const skillProgress = skillsData.skills && skillsData.skills.length > 0 
        ? skillsData.skills.slice(0, 4).map((skill: any) => ({
            name: skill.name,
            current: skill.current,
            target: skill.target,
            category: skill.category
          }))
        : userStatsData.stats.topSkills?.slice(0, 4).map((skill: any) => ({
            name: skill.name,
            current: skill.level,
            target: skill.target,
            category: skill.category
          })) || dashboardData.skillProgress

      // Use real recommendations data if available
      const recommendations = recommendationsData.recommendations && recommendationsData.recommendations.length > 0
        ? recommendationsData.recommendations.slice(0, 3)
        : dashboardData.recommendations || []

      const transformedData: DashboardData = {
        stats,
        skillProgress,
        recommendations,
        recentActivity: transformedActivity,
        upcomingTasks: (dashboardData.upcomingTasks || []).map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate)
        }))
      }
      
      setDashboardData(transformedData)
      
      // Show feedback based on data quality
      if (userStatsData.success) {
        console.log('✅ Real user data loaded successfully')
      } else {
        console.log('⚠️ Limited user data available - encourage user to complete more activities')
      }
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to generate weekly progress from real activity data
  const generateWeeklyProgressData = (activities: Activity[]) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const today = new Date()
    const weekData = days.map((day, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (today.getDay() - 1) + index)
      
      const dayActivities = activities.filter(activity => {
        const activityDate = new Date(activity.timestamp)
        return activityDate.toDateString() === date.toDateString()
      })
      
      return {
        day,
        progress: dayActivities.length * 10 // 10 points per activity
      }
    })
    
    return weekData
  }

  // Generate progress data from real user activity
  const progressData = dashboardData?.recentActivity 
    ? generateWeeklyProgressData(dashboardData.recentActivity)
    : []

  if (authLoading || loading) {
    return <LoadingSpinner message="Loading your dashboard..." />
  }

  if ((!user && process.env.NODE_ENV !== 'development') || !dashboardData) {
    return null
  }

  return (
    <InteractionErrorBoundary>
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
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Welcome back, {profile?.first_name || user?.email?.split('@')[0] || 'Demo User'}! 
                </h1>
                <p className="text-gray-400 text-lg">
                  Continue your career discovery journey
                </p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                <button 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('🔔 Notification bell clicked!')
                    toast.success('No new notifications')
                    // In a real app, this would open a notifications panel
                  }}
                  className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-neon-cyan transition-all relative group"
                  title="View Notifications"
                  style={{ zIndex: 10 }}
                >
                  <Bell size={20} className="group-hover:text-neon-cyan transition-colors" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('👤 Profile button clicked!')
                    toast.success('Opening Your Profile')
                    router.push('/profile')
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-neon-cyan to-neon-pink text-black rounded-lg font-semibold hover:scale-105 transition-transform hover:shadow-lg hover:shadow-neon-cyan/25"
                  title="View Your Profile"
                  style={{ zIndex: 10 }}
                >
                  View Profile
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 pb-12">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard
            icon={Brain}
            label="Quiz Completions"
            value={realtimeStats.completedQuizzes}
            trend={{ value: 12, isPositive: true }}
            color="from-neon-cyan to-blue-500"
            onClick={() => {
              console.log('🧠 Navigating to completed quizzes...')
              toast.success('Opening Completed Quizzes')
              router.push('/dashboard/completed-quizzes')
            }}
          />
          
          <StatsCard
            icon={GraduationCap}
            label="Saved Colleges"
            value={realtimeStats.savedColleges}
            trend={{ value: 8, isPositive: true }}
            color="from-neon-pink to-purple-500"
            onClick={() => {
              console.log('🎓 Navigating to saved colleges...')
              toast.success('Opening Saved Colleges')
              router.push('/saved-colleges')
            }}
          />
          
          <StatsCard
            icon={Zap}
            label="Skills Acquired"
            value={realtimeStats.skillsAcquired}
            trend={{ value: 25, isPositive: true }}
            color="from-neon-purple to-violet-500"
            onClick={() => {
              console.log('⚡ Navigating to skills profile...')
              toast.success('Opening Skills Overview')
              router.push('/profile?tab=skills')
            }}
          />
          
          <StatsCard
            icon={Trophy}
            label="Achievements"
            value={realtimeStats.achievementsUnlocked}
            trend={{ value: 15, isPositive: true }}
            color="from-yellow-400 to-orange-500"
            onClick={() => {
              console.log('🏆 Navigating to achievements...')
              toast.success('Opening Achievements')
              router.push('/profile?tab=achievements')
            }}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* 3D Roadmap Preview */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Target size={20} className="mr-2 text-neon-cyan" />
                  Your 3D Roadmap Preview
                </h3>
                <button 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('🗺️ Roadmap link clicked!')
                    toast.success('Opening Full Roadmap')
                    router.push('/roadmap')
                  }}
                  className="text-neon-cyan hover:text-white transition-colors flex items-center space-x-1"
                >
                  <span>Explore Full Roadmap</span>
                  <ChevronRight size={16} />
                </button>
              </div>
              
              <WebGLErrorBoundary>
                <RoadmapPreview3D userId={user?.id || 'demo-user'} />
              </WebGLErrorBoundary>
              
              <div className="mt-4 p-4 bg-gray-800/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Overall Progress</span>
                  <span className="text-sm font-semibold text-neon-cyan">
                    {realtimeStats.roadmapProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-neon-cyan to-neon-pink rounded-full h-2 transition-all duration-500"
                    style={{ width: `${realtimeStats.roadmapProgress}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Progress Chart */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <BarChart3 size={20} className="mr-2 text-neon-cyan" />
                Weekly Progress
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#888888', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#888888', fontSize: 12 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="progress" 
                      stroke="#00FFFF" 
                      strokeWidth={3}
                      dot={{ fill: '#00FFFF', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#FF007F', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* 3D Skill Progress */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Zap size={20} className="mr-2 text-neon-purple" />
                Skill Progress
              </h3>
              <WebGLErrorBoundary>
                <SkillProgress3D skills={dashboardData.skillProgress} />
              </WebGLErrorBoundary>
            </motion.div>

            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <ActivityFeed 
                activities={dashboardData.recentActivity} 
                onActivityClick={handleActivityClick}
              />
            </motion.div>

            {/* Upcoming Tasks */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <UpcomingTasks 
                tasks={dashboardData.upcomingTasks} 
                onTaskAction={handleTaskAction}
              />
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* AI Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <AIRecommendations 
              recommendations={dashboardData.recommendations} 
              onRecommendationAction={handleRecommendationAction}
            />
          </motion.div>

          {/* Recent Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <RecentAchievements userId={user?.id || 'demo-user'} />
          </motion.div>
        </div>
      </div>
    </div>
    
    {/* External Chatbot - Only for Dashboard */}
    <ExternalChatbot />
    </InteractionErrorBoundary>
  )
}