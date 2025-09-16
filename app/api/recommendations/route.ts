import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { aiService } from '@/lib/ai-services'
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

    console.log('Generating AI recommendations for user:', userId)

    try {
      // Fetch comprehensive user data
      const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase
      const [
        userProfileResult,
        quizResultsResult,
        savedCollegesResult,
        userSkillsResult,
        userActivitiesResult
      ] = await Promise.allSettled([
        db.from('users').select('*').eq('id', userId).single(),
        db.from('quiz_results').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
        db.from('saved_colleges').select('*').eq('user_id', userId),
        db.from('user_skills').select('*').eq('user_id', userId),
        db.from('user_activities').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20)
      ])

      // Extract data with fallbacks
      const userProfile = userProfileResult.status === 'fulfilled' ? userProfileResult.value.data : null
      const quizResults = quizResultsResult.status === 'fulfilled' ? quizResultsResult.value.data || [] : []
      const savedColleges = savedCollegesResult.status === 'fulfilled' ? savedCollegesResult.value.data || [] : []
      const userSkills = userSkillsResult.status === 'fulfilled' ? userSkillsResult.value.data || [] : []
      const activities = userActivitiesResult.status === 'fulfilled' ? userActivitiesResult.value.data || [] : []

      // Build comprehensive user context
      const userContext = {
        profile: userProfile,
        skills: userSkills.map(skill => ({
          name: skill.skill_name,
          level: skill.current_level,
          target: skill.target_level,
          category: skill.category
        })),
        interests: quizResults.length > 0 ? quizResults[0].interests : [],
        careerPaths: quizResults.map(quiz => quiz.career_path),
        savedCollegesCount: savedColleges.length,
        recentActivities: activities.slice(0, 10),
        experience: determineExperienceLevel(userSkills, activities),
        goals: extractGoalsFromActivities(activities)
      }

      // Generate AI-powered recommendations
      const recommendations = []

      // 1. Career recommendations based on user data
      if (quizResults.length > 0) {
        const latestQuiz = quizResults[0]
        try {
          const careerAnalysis = await aiService.analyzeCareerFit(
            userContext,
            latestQuiz.career_path,
            { provider: 'auto' }
          )
          
          recommendations.push({
            id: 'career-analysis',
            type: 'career',
            title: `Your ${latestQuiz.career_path} Career Fit`,
            description: careerAnalysis.reasoning,
            confidence: careerAnalysis.matchScore / 100,
            action: 'View Analysis',
            metadata: {
              matchScore: careerAnalysis.matchScore,
              strengths: careerAnalysis.strengths,
              gaps: careerAnalysis.gaps,
              recommendations: careerAnalysis.recommendations
            }
          })
        } catch (error) {
          console.error('Error generating career analysis:', error)
        }
      }

      // 2. Skill development recommendations
      if (userSkills.length > 0) {
        try {
          const skillAnalysis = await aiService.analyzeSkillProgress(
            userSkills.map(skill => ({
              name: skill.skill_name,
              level: skill.current_level,
              lastUpdated: skill.last_updated
            })),
            userContext.goals,
            { provider: 'auto' }
          )

          recommendations.push({
            id: 'skill-development',
            type: 'skill',
            title: 'Personalized Skill Development Plan',
            description: `Based on your ${userSkills.length} tracked skills, here's your next learning step`,
            confidence: 0.9,
            action: 'View Plan',
            metadata: {
              overallProgress: skillAnalysis.overallProgress,
              nextMilestones: skillAnalysis.nextMilestones,
              focusAreas: skillAnalysis.focusAreas,
              strengths: skillAnalysis.strengths
            }
          })
        } catch (error) {
          console.error('Error generating skill analysis:', error)
        }
      }

      // 3. College recommendations if user has interests but few saved colleges
      if (savedColleges.length < 5 && userContext.interests.length > 0) {
        try {
          const collegeRecommendations = await aiService.recommendColleges(
            userContext,
            {
              specializations: userContext.interests,
              programType: quizResults.length > 0 ? 'technical' : 'general'
            },
            { provider: 'auto' }
          )

          recommendations.push({
            id: 'college-recommendations',
            type: 'college',
            title: 'Colleges Matching Your Interests',
            description: `Discover colleges that align with your interests: ${userContext.interests.slice(0, 3).join(', ')}`,
            confidence: 0.8,
            action: 'Explore Colleges',
            metadata: {
              recommendations: collegeRecommendations.recommendations.slice(0, 3),
              insights: collegeRecommendations.insights
            }
          })
        } catch (error) {
          console.error('Error generating college recommendations:', error)
        }
      }

      // 4. Smart general recommendations based on user activity patterns
      const generalRecommendations = generateSmartRecommendations(userContext)
      recommendations.push(...generalRecommendations)

      // Log recommendation generation activity
      await supabase.from('user_activities').insert({
        user_id: userId,
        type: 'recommendation',
        title: 'AI Recommendations Generated',
        description: `Generated ${recommendations.length} personalized recommendations`,
        metadata: {
          recommendationCount: recommendations.length,
          dataPoints: {
            skills: userSkills.length,
            quizzes: quizResults.length,
            savedColleges: savedColleges.length,
            activities: activities.length
          }
        }
      })

      return NextResponse.json({
        success: true,
        recommendations: recommendations.slice(0, 5), // Return top 5 recommendations
        userContext: {
          skillCount: userSkills.length,
          quizCount: quizResults.length,
          collegeCount: savedColleges.length,
          experienceLevel: userContext.experience
        }
      })

    } catch (dbError) {
      console.error('Database error generating recommendations:', dbError)
      logDatabasePermissionOnce('Recommendations API')
      
      // Return fallback recommendations
      return NextResponse.json({
        success: true,
        recommendations: getFallbackRecommendations(),
        fallback: true
      })
    }

  } catch (error) {
    console.error('Error in GET /api/recommendations:', error)
    return NextResponse.json({ 
      error: 'Failed to generate recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper functions
function determineExperienceLevel(skills: any[], activities: any[]): string {
  const avgSkillLevel = skills.reduce((sum, skill) => sum + (skill.current_level || 0), 0) / Math.max(skills.length, 1)
  const quizActivities = activities.filter(a => a.type === 'quiz').length
  
  if (avgSkillLevel > 75 || quizActivities > 3) return 'advanced'
  if (avgSkillLevel > 50 || quizActivities > 1) return 'intermediate'
  return 'beginner'
}

function extractGoalsFromActivities(activities: any[]): string[] {
  const goals = new Set<string>()
  
  activities.forEach(activity => {
    if (activity.type === 'quiz' && activity.metadata?.primaryCareer) {
      goals.add(`Become a ${activity.metadata.primaryCareer}`)
    }
    if (activity.type === 'college') {
      goals.add('Find the right college')
    }
    if (activity.type === 'skill') {
      goals.add('Develop technical skills')
    }
  })
  
  return Array.from(goals)
}

function generateSmartRecommendations(userContext: any): any[] {
  const recommendations = []
  
  // New user recommendation
  if (userContext.skills.length === 0 && userContext.careerPaths.length === 0) {
    recommendations.push({
      id: 'get-started',
      type: 'career',
      title: 'Start Your Career Discovery Journey',
      description: 'Take our comprehensive career assessment to discover your ideal career path',
      confidence: 0.95,
      action: 'Take Quiz',
      metadata: {
        reasons: ['No career assessment completed', 'Profile needs completion'],
        nextSteps: ['Complete career quiz', 'Add skills to profile']
      }
    })
  }

  // Skills recommendation
  if (userContext.skills.length > 0 && userContext.skills.length < 5) {
    recommendations.push({
      id: 'expand-skills',
      type: 'skill',
      title: 'Expand Your Skill Portfolio',
      description: 'Add more skills to get better career recommendations',
      confidence: 0.8,
      action: 'Add Skills',
      metadata: {
        currentSkills: userContext.skills.length,
        recommended: 5 - userContext.skills.length
      }
    })
  }

  // College exploration recommendation
  if (userContext.savedCollegesCount === 0) {
    recommendations.push({
      id: 'explore-colleges',
      type: 'college',
      title: 'Explore College Options',
      description: 'Start building your college list by exploring institutions that match your interests',
      confidence: 0.85,
      action: 'Browse Colleges',
      metadata: {
        benefits: ['Compare programs', 'Track applications', 'Plan visits']
      }
    })
  }

  return recommendations
}

function getFallbackRecommendations() {
  return [
    {
      id: 'fallback-1',
      type: 'career',
      title: 'Complete Your Career Assessment',
      description: 'Take our quiz to discover your ideal career path',
      confidence: 0.9,
      action: 'Start Quiz'
    },
    {
      id: 'fallback-2',
      type: 'skill',
      title: 'Add Your Skills',
      description: 'Build your skill profile to get personalized recommendations',
      confidence: 0.8,
      action: 'Add Skills'
    },
    {
      id: 'fallback-3',
      type: 'college',
      title: 'Explore Colleges',
      description: 'Browse our database of colleges and universities',
      confidence: 0.7,
      action: 'Browse Colleges'
    }
  ]
}