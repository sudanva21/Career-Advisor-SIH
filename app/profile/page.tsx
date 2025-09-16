'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { User, Settings, Trophy, Target, BookOpen, TrendingUp } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Dynamically import 3D components with SSR disabled
const ProfileAvatar3D = dynamic(() => import('@/components/profile/ProfileAvatar3D'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-800/50 rounded-xl animate-pulse" />
})

const SkillTree3D = dynamic(() => import('@/components/profile/SkillTree3D'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-800/50 rounded-xl animate-pulse" />
})

const CareerRoadmap3D = dynamic(() => import('@/components/profile/CareerRoadmap3D'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-800/50 rounded-xl animate-pulse" />
})

const AchievementBadges = dynamic(() => import('@/components/profile/AchievementBadges'), {
  ssr: false,
  loading: () => <div className="w-full h-32 bg-gray-800/50 rounded-xl animate-pulse" />
})

const ProfileSettings = dynamic(() => import('@/components/profile/ProfileSettings'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-800/50 rounded-xl animate-pulse" />
})

export default function ProfilePage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [userStats, setUserStats] = useState({
    completedQuizzes: 0,
    savedColleges: 0,
    skillsAcquired: 0,
    achievementsUnlocked: 0,
    roadmapProgress: 0
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && profile) {
      fetchUserStats()
    }
  }, [user, profile])

  useEffect(() => {
    // Check URL parameter for tab selection
    const tabParam = searchParams.get('tab')
    if (tabParam && ['overview', 'skills', 'roadmap', 'achievements', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/profile/stats')
      if (response.ok) {
        const stats = await response.json()
        setUserStats(stats)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user || !profile) {
    return null
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'skills', label: '3D Skills Tree', icon: TrendingUp },
    { id: 'roadmap', label: 'Career Roadmap', icon: Target },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen" style={{ background: '#0B0E17' }}>
      {/* Header */}
      <div className="relative pt-24 pb-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Your <span className="bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
                Career Profile
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Track your progress, visualize your skills, and navigate your career journey
            </p>
          </motion.div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-20 z-40 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="flex space-x-1 bg-gray-900/50 rounded-xl p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-neon-cyan text-black shadow-lg shadow-neon-cyan/25'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <tab.icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Profile Header */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* 3D Avatar */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Your Avatar</h3>
                  <ProfileAvatar3D user={user} />
                  <div className="mt-4 text-center">
                    <h4 className="text-lg font-semibold text-white">
                      {profile.first_name} {profile.last_name}
                    </h4>
                    <p className="text-gray-400">{profile.email}</p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                <StatCard
                  title="Completed Quizzes"
                  value={userStats.completedQuizzes}
                  icon={BookOpen}
                  color="from-neon-cyan to-blue-500"
                />
                <StatCard
                  title="Saved Colleges"
                  value={userStats.savedColleges}
                  icon={Target}
                  color="from-neon-pink to-purple-500"
                />
                <StatCard
                  title="Skills Acquired"
                  value={userStats.skillsAcquired}
                  icon={TrendingUp}
                  color="from-neon-purple to-violet-500"
                />
                <StatCard
                  title="Achievements"
                  value={userStats.achievementsUnlocked}
                  icon={Trophy}
                  color="from-yellow-400 to-orange-500"
                />
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Achievements</h3>
              <AchievementBadges userId={user.id} limit={6} />
            </div>
          </motion.div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Interactive 3D Skills Tree</h3>
              <p className="text-gray-400 mb-6">
                Explore your skills in an immersive 3D visualization. Click on nodes to see details and progress.
              </p>
              <SkillTree3D userId={user.id} />
            </div>
          </motion.div>
        )}

        {/* Roadmap Tab */}
        {activeTab === 'roadmap' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Your Career Roadmap</h3>
              <p className="text-gray-400 mb-6">
                Navigate your personalized career journey with our AI-generated 3D roadmap.
              </p>
              <CareerRoadmap3D userId={user.id} />
            </div>
          </motion.div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">All Achievements</h3>
              <AchievementBadges userId={user.id} showAll={true} />
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProfileSettings onUpdate={(updatedProfile) => {
              // Handle profile update if needed
              console.log('Profile updated:', updatedProfile)
            }} />
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Stats Card Component
function StatCard({ title, value, icon: Icon, color }: {
  title: string
  value: number
  icon: any
  color: string
}) {
  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color} bg-opacity-20`}>
          <Icon size={24} className="text-white" />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-sm text-gray-400">{title}</div>
        </div>
      </div>
    </div>
  )
}