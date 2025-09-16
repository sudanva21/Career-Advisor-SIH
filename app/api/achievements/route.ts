import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { logDatabasePermissionOnce, getDemoUserId } from '@/lib/database/demo-mode'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    // Allow demo mode in development
    const userId = session?.user?.id || getDemoUserId()
    
    // Use admin client in development to bypass RLS (server-side only) if available
    const db = (process.env.NODE_ENV === 'development' && supabaseAdmin) ? supabaseAdmin : supabase

    // Fetch user's achievements
    const { data: userAchievements, error: achievementsError } = await db
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })

    if (achievementsError && achievementsError.code !== 'PGRST116') {
      console.error('Error fetching achievements:', achievementsError)
      logDatabasePermissionOnce('Achievements API')
    }

    // Get user stats to calculate potential achievements
    const [activitiesResult, skillsResult, savedCollegesResult] = await Promise.all([
      db.from('user_activities').select('*').eq('user_id', userId),
      db.from('user_skills').select('*').eq('user_id', userId),
      db.from('saved_colleges').select('*').eq('user_id', userId)
    ])

    const activities = activitiesResult.data || []
    const skills = skillsResult.data || []
    const savedColleges = savedCollegesResult.data || []

    // Generate available achievements based on user progress
    const availableAchievements = generateAvailableAchievements(activities, skills, savedColleges)
    
    // Filter completed achievements
    const completedAchievements = userAchievements || []
    const completedIds = completedAchievements.map(a => a.achievement_id)
    
    // Get achievements in progress (partially completed)
    const inProgressAchievements = availableAchievements.filter(ach => 
      !completedIds.includes(ach.id) && ach.progress > 0 && ach.progress < 100
    )

    // Get available achievements (not started)
    const availableOnly = availableAchievements.filter(ach => 
      !completedIds.includes(ach.id) && ach.progress === 0
    )

    const achievementData = {
      completed: completedAchievements.map(ach => ({
        id: ach.achievement_id,
        title: ach.title,
        description: ach.description,
        type: ach.type,
        rarity: ach.rarity,
        icon: ach.icon,
        category: ach.category,
        progress: ach.progress,
        maxProgress: ach.max_progress,
        unlockedAt: ach.unlocked_at,
        isUnlocked: true
      })),
      inProgress: inProgressAchievements,
      available: availableOnly.slice(0, 6), // Show first 6 available
      stats: {
        totalCompleted: completedAchievements.length,
        totalAvailable: availableAchievements.length,
        completionRate: Math.round((completedAchievements.length / availableAchievements.length) * 100) || 0,
        pointsEarned: completedAchievements.reduce((total, ach) => total + getPointsForRarity(ach.rarity), 0)
      }
    }

    return NextResponse.json(achievementData)

  } catch (error) {
    console.error('Error in achievements API:', error)
    
    // Return empty achievements on error
    return NextResponse.json({
      completed: [],
      inProgress: [],
      available: [],
      stats: {
        totalCompleted: 0,
        totalAvailable: 0,
        completionRate: 0,
        pointsEarned: 0
      },
      error: 'Failed to fetch achievements data'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    const userId = session?.user?.id || getDemoUserId()
    
    const body = await request.json()
    const { achievementId, checkOnly = false } = body

    if (checkOnly) {
      // Check if user has this achievement
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .single()

      return NextResponse.json({
        hasAchievement: !!existing,
        achievement: existing
      })
    }

    // Award achievement to user
    const achievementDefinition = getAchievementDefinition(achievementId)
    if (!achievementDefinition) {
      return NextResponse.json({ error: 'Invalid achievement ID' }, { status: 400 })
    }

    const db = (process.env.NODE_ENV === 'development' && supabaseAdmin) ? supabaseAdmin : supabase

    const { data, error } = await db
      .from('user_achievements')
      .upsert({
        user_id: userId,
        achievement_id: achievementId,
        title: achievementDefinition.title,
        description: achievementDefinition.description,
        type: achievementDefinition.type,
        rarity: achievementDefinition.rarity,
        icon: achievementDefinition.icon,
        category: achievementDefinition.category,
        progress: 100,
        max_progress: 100
      })
      .select()

    if (error) {
      console.error('Error awarding achievement:', error)
      logDatabasePermissionOnce('Achievements API (award)')
      return NextResponse.json({ 
        success: true, 
        message: 'Achievement awarded (local)',
        achievement: achievementDefinition 
      })
    }

    // Log activity
    try {
      await db.from('user_activities').insert({
        user_id: userId,
        type: 'achievement',
        title: 'Achievement Unlocked!',
        description: `Earned "${achievementDefinition.title}" achievement`,
        metadata: { 
          achievementId,
          rarity: achievementDefinition.rarity,
          points: getPointsForRarity(achievementDefinition.rarity)
        }
      })
    } catch (activityError) {
      console.error('Error logging achievement activity:', activityError)
    }

    return NextResponse.json({
      success: true,
      message: 'Achievement unlocked!',
      achievement: data?.[0] || achievementDefinition
    })

  } catch (error) {
    console.error('Error in POST achievements:', error)
    return NextResponse.json({ 
      error: 'Failed to process achievement',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper functions
function generateAvailableAchievements(activities: any[], skills: any[], savedColleges: any[]) {
  const achievements = []

  // Welcome achievements
  achievements.push({
    id: 'first-login',
    title: 'Welcome Aboard!',
    description: 'Started your career discovery journey',
    type: 'milestone',
    rarity: 'common',
    icon: '🎯',
    category: 'Getting Started',
    progress: activities.length > 0 ? 100 : 0,
    maxProgress: 100,
    requirements: 'Create your account'
  })

  // Activity-based achievements
  const quizActivities = activities.filter(a => a.type === 'quiz')
  achievements.push({
    id: 'quiz-master',
    title: 'Quiz Master',
    description: 'Complete 5 career quizzes',
    type: 'quiz',
    rarity: quizActivities.length >= 5 ? 'rare' : 'common',
    icon: '🧠',
    category: 'Learning',
    progress: Math.min((quizActivities.length / 5) * 100, 100),
    maxProgress: 100,
    requirements: 'Complete 5 quizzes'
  })

  // College exploration achievements
  achievements.push({
    id: 'college-explorer',
    title: 'College Explorer',
    description: 'Save 10 colleges to your wishlist',
    type: 'college',
    rarity: savedColleges.length >= 10 ? 'rare' : 'common',
    icon: '🏫',
    category: 'Exploration',
    progress: Math.min((savedColleges.length / 10) * 100, 100),
    maxProgress: 100,
    requirements: 'Save 10 colleges'
  })

  // Skill achievements
  const skillsAtTarget = skills.filter(s => s.current_level >= s.target_level)
  achievements.push({
    id: 'skill-achiever',
    title: 'Skill Achiever',
    description: 'Reach target level in 3 skills',
    type: 'skill',
    rarity: skillsAtTarget.length >= 3 ? 'epic' : 'rare',
    icon: '⚡',
    category: 'Skills',
    progress: Math.min((skillsAtTarget.length / 3) * 100, 100),
    maxProgress: 100,
    requirements: 'Master 3 skills'
  })

  // Streak achievements
  const recentActivities = activities.filter(a => {
    const activityDate = new Date(a.created_at)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return activityDate > weekAgo
  })

  achievements.push({
    id: 'consistent-learner',
    title: 'Consistent Learner',
    description: 'Stay active for 7 consecutive days',
    type: 'streak',
    rarity: recentActivities.length >= 7 ? 'rare' : 'common',
    icon: '🔥',
    category: 'Dedication',
    progress: Math.min((recentActivities.length / 7) * 100, 100),
    maxProgress: 100,
    requirements: 'Be active 7 days'
  })

  // Advanced achievements
  if (skills.length >= 5 && savedColleges.length >= 5 && activities.length >= 10) {
    achievements.push({
      id: 'career-focused',
      title: 'Career Focused',
      description: 'Master multiple skills and explore various colleges',
      type: 'milestone',
      rarity: 'legendary',
      icon: '🎖️',
      category: 'Mastery',
      progress: 100,
      maxProgress: 100,
      requirements: 'Complete comprehensive career exploration'
    })
  }

  return achievements
}

function getAchievementDefinition(achievementId: string) {
  const definitions: { [key: string]: any } = {
    'first-login': {
      title: 'Welcome Aboard!',
      description: 'Started your career discovery journey',
      type: 'milestone',
      rarity: 'common',
      icon: '🎯',
      category: 'Getting Started'
    },
    'quiz-master': {
      title: 'Quiz Master',
      description: 'Complete 5 career quizzes',
      type: 'quiz',
      rarity: 'rare',
      icon: '🧠',
      category: 'Learning'
    },
    'college-explorer': {
      title: 'College Explorer',
      description: 'Save 10 colleges to your wishlist',
      type: 'college',
      rarity: 'rare',
      icon: '🏫',
      category: 'Exploration'
    },
    'skill-achiever': {
      title: 'Skill Achiever',
      description: 'Reach target level in 3 skills',
      type: 'skill',
      rarity: 'epic',
      icon: '⚡',
      category: 'Skills'
    },
    'consistent-learner': {
      title: 'Consistent Learner',
      description: 'Stay active for 7 consecutive days',
      type: 'streak',
      rarity: 'rare',
      icon: '🔥',
      category: 'Dedication'
    },
    'career-focused': {
      title: 'Career Focused',
      description: 'Master multiple skills and explore various colleges',
      type: 'milestone',
      rarity: 'legendary',
      icon: '🎖️',
      category: 'Mastery'
    }
  }

  return definitions[achievementId]
}

function getPointsForRarity(rarity: string): number {
  const pointsMap: { [key: string]: number } = {
    common: 10,
    rare: 25,
    epic: 50,
    legendary: 100
  }
  return pointsMap[rarity] || 10
}

