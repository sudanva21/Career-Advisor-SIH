'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Zap, Target, BookOpen, Users, Award, Medal, Crown } from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  type: 'skill' | 'milestone' | 'quiz' | 'project' | 'streak' | 'social'
  icon: string
  color: string
  points: number
  unlockedAt: Date
  isNew?: boolean
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    trophy: Trophy,
    star: Star,
    zap: Zap,
    target: Target,
    book: BookOpen,
    users: Users,
    award: Award,
    medal: Medal,
    crown: Crown
  }
  return icons[iconName] || Trophy
}

const getRarityStyle = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common':
      return {
        borderColor: '#9CA3AF',
        glowColor: '#9CA3AF',
        bgGradient: 'from-gray-600/20 to-gray-700/20'
      }
    case 'rare':
      return {
        borderColor: '#3B82F6',
        glowColor: '#3B82F6',
        bgGradient: 'from-blue-600/20 to-blue-700/20'
      }
    case 'epic':
      return {
        borderColor: '#8B5CF6',
        glowColor: '#8B5CF6',
        bgGradient: 'from-purple-600/20 to-purple-700/20'
      }
    case 'legendary':
      return {
        borderColor: '#F59E0B',
        glowColor: '#F59E0B',
        bgGradient: 'from-yellow-600/20 to-orange-700/20'
      }
  }
}

function AchievementBadge({ achievement, onClick }: { 
  achievement: Achievement
  onClick: () => void 
}) {
  const IconComponent = getIcon(achievement.icon)
  const rarityStyle = getRarityStyle(achievement.rarity)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`relative cursor-pointer group`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Achievement Badge */}
      <div
        className={`relative w-16 h-16 rounded-xl border-2 bg-gradient-to-br ${rarityStyle.bgGradient} backdrop-blur-sm transition-all duration-300 hover:shadow-lg flex items-center justify-center`}
        style={{ 
          borderColor: rarityStyle.borderColor,
          boxShadow: isHovered ? `0 0 20px ${rarityStyle.glowColor}40` : 'none'
        }}
      >
        <IconComponent 
          size={24} 
          color={achievement.color}
          className="drop-shadow-sm"
        />

        {/* New Badge Indicator */}
        {achievement.isNew && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse">
            <div className="w-full h-full bg-red-400 rounded-full animate-ping" />
          </div>
        )}

        {/* Rarity Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: `radial-gradient(circle, ${rarityStyle.glowColor}20 0%, transparent 70%)`,
          }}
          animate={{
            opacity: isHovered ? 0.6 : 0.2,
            scale: isHovered ? 1.2 : 1
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-black/90 backdrop-blur-xl rounded-lg p-3 border border-gray-700 min-w-[200px]">
              <h4 className="font-semibold text-white text-sm mb-1">{achievement.title}</h4>
              <p className="text-gray-300 text-xs mb-2">{achievement.description}</p>
              
              <div className="flex items-center justify-between text-xs">
                <span className={`px-2 py-1 rounded-full font-medium ${
                  achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                  achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                  achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {achievement.rarity.toUpperCase()}
                </span>
                <span className="text-yellow-400 font-semibold">+{achievement.points} pts</span>
              </div>
              
              <div className="text-gray-400 text-xs mt-2">
                Unlocked {achievement.unlockedAt.toLocaleDateString()}
              </div>
              
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/90 border-r border-b border-gray-700 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function AchievementModal({ achievement, onClose }: {
  achievement: Achievement | null
  onClose: () => void
}) {
  if (!achievement) return null

  const IconComponent = getIcon(achievement.icon)
  const rarityStyle = getRarityStyle(achievement.rarity)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="bg-black/90 backdrop-blur-xl rounded-2xl border border-gray-700 p-8 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Achievement Icon */}
          <div className="text-center mb-6">
            <div
              className={`inline-flex w-24 h-24 rounded-2xl border-4 bg-gradient-to-br ${rarityStyle.bgGradient} items-center justify-center mb-4`}
              style={{ 
                borderColor: rarityStyle.borderColor,
                boxShadow: `0 0 30px ${rarityStyle.glowColor}60`
              }}
            >
              <IconComponent size={40} color={achievement.color} />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">{achievement.title}</h2>
            
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
              achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
              achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {achievement.rarity.toUpperCase()} ACHIEVEMENT
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-center mb-6 leading-relaxed">
            {achievement.description}
          </p>

          {/* Stats */}
          <div className="bg-gray-900/50 rounded-xl p-4 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Points Earned</span>
              <span className="text-yellow-400 font-bold">+{achievement.points}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Type</span>
              <span className="text-white capitalize">{achievement.type}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Unlocked</span>
              <span className="text-white">{achievement.unlockedAt.toLocaleDateString()}</span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-neon-cyan text-black rounded-lg font-semibold hover:bg-neon-cyan/80 transition-colors"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function AchievementBadges({ 
  userId, 
  limit, 
  showAll = false 
}: { 
  userId: string
  limit?: number
  showAll?: boolean
}) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock achievements data - replace with API call
  useEffect(() => {
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        title: 'First Steps',
        description: 'Completed your first career quiz',
        type: 'quiz',
        icon: 'star',
        color: '#FFD700',
        points: 50,
        rarity: 'common',
        unlockedAt: new Date('2024-01-15'),
        isNew: false
      },
      {
        id: '2',
        title: 'Knowledge Seeker',
        description: 'Completed 5 career assessments',
        type: 'milestone',
        icon: 'book',
        color: '#00FFFF',
        points: 150,
        rarity: 'rare',
        unlockedAt: new Date('2024-01-20'),
        isNew: false
      },
      {
        id: '3',
        title: 'Skill Master',
        description: 'Achieved expert level in 3 skills',
        type: 'skill',
        icon: 'zap',
        color: '#8B5CF6',
        points: 300,
        rarity: 'epic',
        unlockedAt: new Date('2024-01-25'),
        isNew: true
      },
      {
        id: '4',
        title: 'College Explorer',
        description: 'Saved 10 colleges to your wishlist',
        type: 'milestone',
        icon: 'target',
        color: '#FF007F',
        points: 100,
        rarity: 'common',
        unlockedAt: new Date('2024-01-22'),
        isNew: false
      },
      {
        id: '5',
        title: 'Project Pioneer',
        description: 'Completed your first project milestone',
        type: 'project',
        icon: 'trophy',
        color: '#F59E0B',
        points: 500,
        rarity: 'legendary',
        unlockedAt: new Date('2024-01-28'),
        isNew: true
      },
      {
        id: '6',
        title: 'Learning Streak',
        description: 'Maintained a 7-day learning streak',
        type: 'streak',
        icon: 'medal',
        color: '#10B981',
        points: 200,
        rarity: 'rare',
        unlockedAt: new Date('2024-01-30'),
        isNew: true
      }
    ]

    setTimeout(() => {
      let displayAchievements = mockAchievements
      
      if (!showAll && limit) {
        displayAchievements = mockAchievements.slice(0, limit)
      }
      
      setAchievements(displayAchievements)
      setLoading(false)
    }, 500)
  }, [userId, limit, showAll])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin w-6 h-6 border-4 border-gray-600 border-t-neon-cyan rounded-full" />
      </div>
    )
  }

  if (achievements.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy size={48} className="text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No achievements yet. Start your journey to unlock badges!</p>
      </div>
    )
  }

  return (
    <>
      <div className={`${
        showAll 
          ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4' 
          : 'flex flex-wrap gap-4'
      }`}>
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AchievementBadge
              achievement={achievement}
              onClick={() => setSelectedAchievement(achievement)}
            />
          </motion.div>
        ))}
      </div>

      {/* Achievement Modal */}
      <AchievementModal
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </>
  )
}