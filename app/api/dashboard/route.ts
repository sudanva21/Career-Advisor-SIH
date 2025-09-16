import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getValidatedConfig } from '@/lib/env-validation'

// Helper functions for activity formatting
function getActivityTitle(type: string, details: any = {}): string {
  switch (type) {
    case 'roadmap_generated':
      return 'Generated AI Career Roadmap'
    case 'quiz_completed':
      return 'Completed Career Assessment'
    case 'job_analyzed':
      return 'Analyzed Resume'
    default:
      return 'Activity Completed'
  }
}

function getActivityDescription(type: string, details: any = {}): string {
  switch (type) {
    case 'roadmap_generated':
      return `Created roadmap for: ${details.career_goal || 'Career Goal'}`
    case 'quiz_completed':
      return `Discovered career path: ${details.career_path || 'Career Path'} (${details.match_score || 0}% match)`
    case 'job_analyzed':
      return `Analyzed resume: ${details.filename || 'resume.pdf'}`
    default:
      return 'Completed an activity'
  }
}

function getIconForType(type: string): string {
  switch (type) {
    case 'roadmap_generated':
    case 'roadmap':
      return '🗺️'
    case 'quiz_completed':
    case 'quiz':
      return '🧠'
    case 'job_analyzed':
    case 'resume':
      return '📄'
    case 'achievement':
      return '🏆'
    case 'skill':
      return '🔧'
    case 'college':
      return '🎓'
    default:
      return '📌'
  }
}

function getColorForType(type: string): string {
  switch (type) {
    case 'roadmap_generated':
    case 'roadmap':
      return 'blue'
    case 'quiz_completed':
    case 'quiz':
      return 'green'
    case 'job_analyzed':
    case 'resume':
      return 'purple'
    case 'achievement':
      return 'yellow'
    case 'skill':
      return 'indigo'
    case 'college':
      return 'pink'
    default:
      return 'gray'
  }
}

function calculateWeeklyProgress(activities: any[]): number {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  
  const weeklyActivities = activities.filter(activity => 
    new Date(activity.created_at) >= oneWeekAgo
  )
  
  // Return percentage based on activity count this week (max 10 activities = 100%)
  return Math.min(100, Math.round((weeklyActivities.length / 10) * 100))
}

export async function GET(request: NextRequest) {
  try {
    // Validate environment first
    getValidatedConfig()
    
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    console.log('🔄 Fetching dashboard data for user:', userId)

    // Use admin client for server-side operations
    const db = supabaseAdmin
    
    // Fetch all required data concurrently
    const [
      activitiesResult,
      newActivitiesResult,
      quizResultsResult,
      savedCollegesResult,
      userSkillsResult,
      achievementsResult,
      roadmapsResult
    ] = await Promise.allSettled([
      db.from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20),
      db.from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20),
      db.from('quiz_results')
        .select('id, career_path, score, created_at')
        .eq('user_id', userId),
      db.from('saved_colleges')
        .select('id, college_name, college_location, college_type, created_at')
        .eq('user_id', userId),
      db.from('user_skills')
        .select('*')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false }),
      db.from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false }),
      db.from('career_roadmaps')
        .select('*')
        .eq('userId', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
    ])

    // Handle errors in database queries
    if (activitiesResult.status === 'rejected') {
      console.error('❌ Failed to fetch activities:', activitiesResult.reason)
      return NextResponse.json({ error: 'Database query failed', success: false }, { status: 500 })
    }

    // Extract real data only
    const oldActivities = activitiesResult.status === 'fulfilled' ? (activitiesResult.value.data || []) : []
    const newActivities = newActivitiesResult.status === 'fulfilled' ? (newActivitiesResult.value.data || []) : []
    
    // Merge and format activities from both tables
    const allActivities = [
      ...oldActivities.map((activity: any) => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        created_at: activity.created_at,
        details: activity.metadata || {}
      })),
      ...newActivities.map((activity: any) => ({
        id: activity.id,
        type: activity.type,
        title: getActivityTitle(activity.type, activity.details),
        description: getActivityDescription(activity.type, activity.details),
        created_at: activity.created_at,
        details: activity.details || {}
      }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20) // Keep only the most recent 20 activities

    const quizResults = quizResultsResult.status === 'fulfilled' ? (quizResultsResult.value.data || []) : []
    const savedColleges = savedCollegesResult.status === 'fulfilled' ? (savedCollegesResult.value.data || []) : []
    const userSkills = userSkillsResult.status === 'fulfilled' ? (userSkillsResult.value.data || []) : []
    const achievements = achievementsResult.status === 'fulfilled' ? (achievementsResult.value.data || []) : []
    const roadmaps = roadmapsResult.status === 'fulfilled' ? (roadmapsResult.value.data || []) : []

    // Transform activities to match frontend format
    const recentActivity = allActivities.map(activity => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      timestamp: activity.created_at,
      icon: getIconForType(activity.type),
      color: getColorForType(activity.type),
      metadata: activity.details || {}
    }))

    // Calculate accurate stats from real data only
    const stats = {
      completedQuizzes: quizResults.length,
      savedColleges: savedColleges.length,
      skillsAcquired: userSkills.length,
      achievementsUnlocked: achievements.length,
      roadmapProgress: userSkills.length > 0 
        ? Math.round(userSkills.reduce((acc, skill) => acc + (skill.current_level || 0), 0) / userSkills.length)
        : 0,
      weeklyProgress: calculateWeeklyProgress(allActivities)
    }

    console.log('📊 Real dashboard stats:', stats)

    // Transform skills to frontend format - only real data
    const skillProgress = userSkills.slice(0, 6).map(skill => ({
      name: skill.skill_name,
      current: skill.current_level,
      target: skill.target_level,
      category: skill.category,
      id: skill.id
    }))

    // Generate AI recommendations based on user data
    const recommendations = await generateAIRecommendations(userSkills, savedColleges, quizResults, allActivities)

    // Generate upcoming tasks based on user progress
    const upcomingTasks = generateUpcomingTasks(userSkills, allActivities)

    // Get latest roadmap preview
    const roadmapPreview = roadmaps.length > 0 ? {
      id: roadmaps[0].id,
      title: roadmaps[0].title,
      progress: roadmaps[0].progress,
      nodes: roadmaps[0].nodes || [],
      careerGoal: roadmaps[0].careerGoal
    } : null

    const dashboardData = {
      stats,
      recentActivity,
      skillProgress,
      recommendations,
      upcomingTasks,
      roadmapPreview,
      success: true
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('❌ Dashboard API error:', error)
    
    // Return error instead of mock data
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data', 
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper functions for generating AI recommendations and tasks

async function generateAIRecommendations(skills: any[], colleges: any[], quizResults: any[], activities: any[]) {
  try {
    const { FreeAIService } = await import('@/lib/free-ai-services')
    const aiService = FreeAIService.getInstance()
    
    // Generate AI-powered recommendations
    let aiRecommendations = []
    
    // Use free AI to generate personalized recommendations
    const prompt = `Based on the following user data, generate 3 personalized career recommendations:
      
      Skills: ${skills.map(s => `${s.skill_name} (${s.current_level}%)`).join(', ')}
      Saved Colleges: ${colleges.map(c => c.college_name).join(', ')}
      Quiz Results: ${quizResults.map(q => q.career_path).join(', ')}
      Recent Activity: ${activities.slice(0, 5).map(a => a.type).join(', ')}
      
      Return as JSON array with: id, type, title, description, reason, confidence, action`

    const response = await aiService.generateResponse(prompt, {
      maxTokens: 1000,
      temperature: 0.7
    })

    if (response.content) {
      try {
        // Try to parse the JSON response
        const jsonMatch = response.content.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          aiRecommendations = JSON.parse(jsonMatch[0])
        } else {
          console.error('Failed to parse AI recommendations:', response.content)
        }
      } catch (parseError) {
        console.error('Failed to parse AI recommendations:', parseError)
      }
    }
    
    // If AI fails or no recommendations, return rule-based recommendations
    if (aiRecommendations.length === 0) {
      return generateRuleBasedRecommendations(skills, colleges, quizResults, activities)
    }
    
    return aiRecommendations.slice(0, 3)
  } catch (error) {
    console.error('AI recommendation generation failed:', error)
    return generateRuleBasedRecommendations(skills, colleges, quizResults, activities)
  }
}

function generateRuleBasedRecommendations(skills: any[], colleges: any[], quizResults: any[], activities: any[]) {
  const recommendations = []
  
  // Only generate recommendations based on real data patterns
  if (skills.length === 0 && quizResults.length === 0) {
    recommendations.push({
      id: 'onboarding-quiz',
      type: 'career',
      title: 'Take Your First Career Assessment',
      description: 'Discover your strengths and ideal career path with AI-powered analysis',
      reason: 'Career assessment helps personalize your experience',
      confidence: 0.95,
      action: 'Start Quiz'
    })
  }
  
  if (skills.length > 0) {
    const skillsNeedingWork = skills.filter(s => s.current_level < s.target_level)
    if (skillsNeedingWork.length > 0) {
      const skill = skillsNeedingWork[0]
      recommendations.push({
        id: `skill-${skill.id}`,
        type: 'skill',
        title: `Focus on ${skill.skill_name}`,
        description: `Advance your ${skill.skill_name} skills to reach your target level`,
        reason: `Gap identified: ${skill.current_level}% current vs ${skill.target_level}% target`,
        confidence: 0.85,
        action: 'View Learning Path'
      })
    }
  }

  if (colleges.length === 0 && quizResults.length > 0) {
    recommendations.push({
      id: 'college-search',
      type: 'college',
      title: 'Find Matching Colleges',
      description: 'Explore colleges that align with your career assessment results',
      reason: 'Career path identified but no colleges saved',
      confidence: 0.8,
      action: 'Search Colleges'
    })
  }

  return recommendations.slice(0, 3)
}

function generateUpcomingTasks(skills: any[], activities: any[]) {
  const tasks = []
  
  // Generate tasks based on real skill progress only
  if (skills.length > 0) {
    const skillsToImprove = skills.filter(s => s.current_level < s.target_level).slice(0, 3)
    
    skillsToImprove.forEach((skill, index) => {
      tasks.push({
        id: `skill-task-${skill.id}`,
        title: `Practice ${skill.skill_name}`,
        type: 'practice' as const,
        priority: skill.current_level < 30 ? 'high' as const : 'medium' as const,
        dueDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000),
        estimated: `${Math.ceil((skill.target_level - skill.current_level) / 10)} hours`
      })
    })
  }

  // Generate tasks based on recent activity patterns
  const recentQuizActivity = activities.filter(a => a.type === 'quiz')
  if (recentQuizActivity.length === 0) {
    tasks.push({
      id: 'career-assessment',
      title: 'Complete Career Assessment',
      type: 'study' as const,
      priority: 'high' as const,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      estimated: '20 minutes'
    })
  }

  return tasks.slice(0, 5)
}