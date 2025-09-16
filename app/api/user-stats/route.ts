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
    
    if (!userId && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('📊 Fetching comprehensive user statistics for:', userId)

    try {
      // Fetch all user-related data in parallel for comprehensive statistics
      const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase
      const [
        quizResultsResult,
        savedCollegesResult,
        userSkillsResult,
        userActivitiesResult,
        userAchievementsResult,
        roadmapsResult
      ] = await Promise.allSettled([
        db.from('quiz_results').select('*').eq('user_id', userId),
        db.from('saved_colleges').select('*').eq('user_id', userId),
        db.from('user_skills').select('*').eq('user_id', userId),
        db.from('user_activities').select('*').eq('user_id', userId),
        db.from('user_achievements').select('*').eq('user_id', userId),
        db.from('career_roadmaps').select('*').eq('userId', userId)
      ])

      // Extract data with fallbacks
      const quizResults = quizResultsResult.status === 'fulfilled' ? quizResultsResult.value.data || [] : []
      const savedColleges = savedCollegesResult.status === 'fulfilled' ? savedCollegesResult.value.data || [] : []
      const userSkills = userSkillsResult.status === 'fulfilled' ? userSkillsResult.value.data || [] : []
      const activities = userActivitiesResult.status === 'fulfilled' ? userActivitiesResult.value.data || [] : []
      const achievements = userAchievementsResult.status === 'fulfilled' ? userAchievementsResult.value.data || [] : []
      const roadmaps = roadmapsResult.status === 'fulfilled' ? roadmapsResult.value.data || [] : []

      // Calculate comprehensive statistics
      const stats = {
        // Basic counts (matching dashboard interface)
        completedQuizzes: quizResults.length,
        savedColleges: savedColleges.length,
        skillsAcquired: userSkills.length, // Match dashboard interface
        achievementsUnlocked: achievements.length,
        roadmapProgress: userSkills.length > 0 
          ? Math.round(userSkills.reduce((sum, skill) => sum + (skill.current_level || 0), 0) / userSkills.length)
          : 0,
        weeklyProgress: calculateWeeklyProgress(activities),
        
        // Additional stats
        skillsTracked: userSkills.length,
        roadmapsCreated: roadmaps.length,
        totalActivities: activities.length,

        // Advanced analytics
        averageSkillLevel: userSkills.length > 0 
          ? Math.round(userSkills.reduce((sum, skill) => sum + (skill.current_level || 0), 0) / userSkills.length)
          : 0,
        
        highestSkillLevel: userSkills.length > 0 
          ? Math.max(...userSkills.map(skill => skill.current_level || 0))
          : 0,

        skillCategories: [...new Set(userSkills.map(skill => skill.category).filter(Boolean))],

        // Career insights
        topCareerPaths: getTopCareerPaths(quizResults),
        primaryInterests: getTopInterests(quizResults),
        
        // Activity patterns
        activityBreakdown: getActivityBreakdown(activities),
        recentActivityCount: activities.filter(activity => 
          new Date(activity.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        
        // Progress indicators
        weeklyProgress: calculateWeeklyProgress(activities),
        monthlyProgress: calculateMonthlyProgress(activities),
        
        // Achievement insights
        achievementTypes: [...new Set(achievements.map(a => a.type).filter(Boolean))],
        rareAchievements: achievements.filter(a => a.rarity === 'epic' || a.rarity === 'legendary').length,
        
        // Learning patterns
        preferredLearningTime: determineLearningTime(activities),
        consistencyScore: calculateConsistencyScore(activities),
        
        // Goal tracking
        skillsNearTarget: userSkills.filter(skill => 
          skill.target_level && skill.current_level >= skill.target_level * 0.8
        ).length,
        
        skillsNeedingAttention: userSkills.filter(skill => 
          skill.target_level && skill.current_level < skill.target_level * 0.5
        ).length
      }

      // Get detailed breakdowns
      const detailedStats = {
        ...stats,
        recentQuizzes: quizResults.slice(0, 5).map(quiz => ({
          id: quiz.id,
          careerPath: quiz.career_path,
          score: quiz.score,
          date: quiz.created_at,
          interests: quiz.interests
        })),
        topSkills: userSkills
          .sort((a, b) => (b.current_level || 0) - (a.current_level || 0))
          .slice(0, 10)
          .map(skill => ({
            name: skill.skill_name,
            level: skill.current_level,
            target: skill.target_level,
            category: skill.category
          })),
        recentAchievements: achievements
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map(achievement => ({
            id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            type: achievement.type,
            rarity: achievement.rarity,
            date: achievement.created_at
          })),
        collegePreferences: analyzeSavedColleges(savedColleges)
      }

      console.log('📊 User statistics calculated:', {
        quizzes: stats.completedQuizzes,
        colleges: stats.savedColleges,
        skills: stats.skillsTracked,
        achievements: stats.achievementsUnlocked
      })

      return NextResponse.json({
        success: true,
        stats: detailedStats,
        lastUpdated: new Date().toISOString()
      })

    } catch (dbError) {
      console.error('Database error fetching user stats:', dbError)
      logDatabasePermissionOnce('User Stats API')
      
      // Return basic fallback stats
      return NextResponse.json({
        success: true,
        stats: getFallbackStats(),
        fallback: true,
        lastUpdated: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Error in GET /api/user-stats:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch user statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper functions
function getTopCareerPaths(quizResults: any[]): string[] {
  const careerCounts = quizResults.reduce((acc: any, quiz) => {
    if (quiz.career_path) {
      acc[quiz.career_path] = (acc[quiz.career_path] || 0) + 1
    }
    return acc
  }, {})
  
  return Object.entries(careerCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([path]) => path)
}

function getTopInterests(quizResults: any[]): string[] {
  const interestCounts: any = {}
  
  quizResults.forEach(quiz => {
    if (quiz.interests && Array.isArray(quiz.interests)) {
      quiz.interests.forEach((interest: string) => {
        interestCounts[interest] = (interestCounts[interest] || 0) + 1
      })
    }
  })
  
  return Object.entries(interestCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([interest]) => interest)
}

function getActivityBreakdown(activities: any[]): any {
  return activities.reduce((acc: any, activity) => {
    const type = activity.type || 'other'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})
}

function calculateWeeklyProgress(activities: any[]): number {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentActivities = activities.filter(activity => 
    new Date(activity.created_at) > oneWeekAgo
  )
  return Math.min(100, recentActivities.length * 10) // 10 points per activity, max 100
}

function calculateMonthlyProgress(activities: any[]): number {
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recentActivities = activities.filter(activity => 
    new Date(activity.created_at) > oneMonthAgo
  )
  return Math.min(100, recentActivities.length * 5) // 5 points per activity, max 100
}

function determineLearningTime(activities: any[]): string {
  // Simple heuristic based on activity timestamps
  const hours = activities.map(activity => new Date(activity.created_at).getHours())
  const avgHour = hours.reduce((sum, hour) => sum + hour, 0) / Math.max(hours.length, 1)
  
  if (avgHour < 12) return 'morning'
  if (avgHour < 17) return 'afternoon'
  return 'evening'
}

function calculateConsistencyScore(activities: any[]): number {
  if (activities.length < 7) return activities.length * 10 // Give points for any activity
  
  // Calculate days with activities in the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recentActivities = activities.filter(activity => 
    new Date(activity.created_at) > thirtyDaysAgo
  )
  
  const activeDays = new Set(
    recentActivities.map(activity => 
      new Date(activity.created_at).toDateString()
    )
  ).size
  
  return Math.min(100, (activeDays / 30) * 100) // Percentage of days with activity
}

function analyzeSavedColleges(savedColleges: any[]): any {
  if (savedColleges.length === 0) return {}
  
  const locations = savedColleges.map(college => college.location || college.state).filter(Boolean)
  const types = savedColleges.map(college => college.type).filter(Boolean)
  
  return {
    preferredLocations: [...new Set(locations)].slice(0, 5),
    preferredTypes: [...new Set(types)],
    averageRating: savedColleges.reduce((sum, college) => sum + (college.rating || 0), 0) / savedColleges.length
  }
}

function getFallbackStats(): any {
  return {
    // Dashboard interface fields
    completedQuizzes: 0,
    savedColleges: 0,
    skillsAcquired: 0,
    achievementsUnlocked: 0,
    roadmapProgress: 0,
    weeklyProgress: 0,
    
    // Additional stats
    skillsTracked: 0,
    roadmapsCreated: 0,
    totalActivities: 0,
    averageSkillLevel: 0,
    highestSkillLevel: 0,
    skillCategories: [],
    topCareerPaths: [],
    primaryInterests: [],
    activityBreakdown: {},
    recentActivityCount: 0,
    monthlyProgress: 0,
    achievementTypes: [],
    rareAchievements: 0,
    preferredLearningTime: 'flexible',
    consistencyScore: 0,
    skillsNearTarget: 0,
    skillsNeedingAttention: 0,
    recentQuizzes: [],
    topSkills: [],
    recentAchievements: [],
    collegePreferences: {}
  }
}