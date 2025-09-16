import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getValidatedConfig } from '@/lib/env-validation'

export async function GET(request: NextRequest) {
  try {
    getValidatedConfig()
    
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const userId = session.user.id
    
    // Fetch user statistics from various tables using admin client
    const [
      activitiesResult,
      quizResultsResult,
      savedCollegesResult,
      skillsResult,
      achievementsResult,
      roadmapsResult
    ] = await Promise.allSettled([
      supabaseAdmin.from('user_activities').select('type, created_at').eq('user_id', userId),
      supabaseAdmin.from('quiz_results').select('id').eq('user_id', userId),
      supabaseAdmin.from('saved_colleges').select('id').eq('user_id', userId),
      supabaseAdmin.from('user_skills').select('current_level, target_level').eq('user_id', userId),
      supabaseAdmin.from('user_achievements').select('id').eq('user_id', userId),
      supabaseAdmin.from('career_roadmaps').select('progress').eq('userId', userId)
    ])

    // Extract data with error handling
    const activities = activitiesResult.status === 'fulfilled' ? (activitiesResult.value.data || []) : []
    const quizResults = quizResultsResult.status === 'fulfilled' ? (quizResultsResult.value.data || []) : []
    const savedColleges = savedCollegesResult.status === 'fulfilled' ? (savedCollegesResult.value.data || []) : []
    const skills = skillsResult.status === 'fulfilled' ? (skillsResult.value.data || []) : []
    const achievements = achievementsResult.status === 'fulfilled' ? (achievementsResult.value.data || []) : []
    const roadmaps = roadmapsResult.status === 'fulfilled' ? (roadmapsResult.value.data || []) : []

    // Calculate statistics from real data
    const quizActivities = activities.filter((activity: any) => activity.type === 'quiz')
    const averageSkillLevel = skills.length > 0 
      ? Math.round(skills.reduce((sum: number, skill: any) => sum + (skill.current_level || 0), 0) / skills.length)
      : 0
    
    const averageRoadmapProgress = roadmaps.length > 0
      ? Math.round(roadmaps.reduce((sum: number, roadmap: any) => sum + (roadmap.progress || 0), 0) / roadmaps.length)
      : 0

    const stats = {
      completedQuizzes: Math.max(quizResults.length, quizActivities.length),
      savedColleges: savedColleges.length,
      skillsAcquired: skills.length,
      achievementsUnlocked: achievements.length,
      roadmapProgress: Math.max(averageSkillLevel, averageRoadmapProgress),
      totalActivities: activities.length,
      recentActivities: activities.filter((activity: any) => {
        const activityDate = new Date(activity.created_at)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return activityDate > weekAgo
      }).length,
      roadmapsCreated: roadmaps.length,
      success: true
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('❌ Profile stats error:', error)
    
    // Return error instead of mock data
    return NextResponse.json({
      error: 'Failed to fetch profile statistics',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}