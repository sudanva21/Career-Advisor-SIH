import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { aiService } from '@/lib/ai-services'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeAI = searchParams.get('aiInsights') === 'true'

    // Mock user activity data (in production, fetch from database)
    const mockUserData = {
      profile: {
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.user_metadata?.first_name || 'User',
        lastName: session.user.user_metadata?.last_name || '',
        joinedDate: new Date(Date.now() - 86400000 * 90), // 90 days ago
        lastActive: new Date(),
      },
      skills: [
        { name: 'React', level: 85, category: 'Frontend', progress: +15, monthlyGrowth: 12 },
        { name: 'Node.js', level: 70, category: 'Backend', progress: +10, monthlyGrowth: 8 },
        { name: 'Python', level: 60, category: 'Programming', progress: +5, monthlyGrowth: 5 },
        { name: 'TypeScript', level: 75, category: 'Programming', progress: +8, monthlyGrowth: 10 },
        { name: 'AWS', level: 40, category: 'Cloud', progress: +20, monthlyGrowth: 15 },
        { name: 'Leadership', level: 45, category: 'Soft Skills', progress: +3, monthlyGrowth: 3 }
      ],
      activities: [
        { type: 'quiz', count: 2, lastActivity: new Date(Date.now() - 86400000 * 5) },
        { type: 'roadmap', count: 3, lastActivity: new Date(Date.now() - 86400000 * 2) },
        { type: 'college_search', count: 15, lastActivity: new Date(Date.now() - 86400000 * 1) },
        { type: 'skill_update', count: 28, lastActivity: new Date(Date.now() - 86400000 * 0.5) },
        { type: 'chat', count: 45, lastActivity: new Date(Date.now() - 86400000 * 0.1) }
      ],
      achievements: [
        { id: '1', name: 'First Steps', description: 'Completed profile setup', date: new Date(Date.now() - 86400000 * 85) },
        { id: '2', name: 'Skill Builder', description: 'Updated 10 skills', date: new Date(Date.now() - 86400000 * 70) },
        { id: '3', name: 'Career Explorer', description: 'Completed career assessment', date: new Date(Date.now() - 86400000 * 60) },
        { id: '4', name: 'Tech Enthusiast', description: 'Reached 80+ in a technical skill', date: new Date(Date.now() - 86400000 * 30) }
      ],
      goals: [
        'Become a full-stack developer',
        'Learn cloud technologies',
        'Improve leadership skills',
        'Get industry certification'
      ],
      interests: [
        'Web Development',
        'Machine Learning',
        'Cloud Computing',
        'Mobile Apps',
        'UI/UX Design'
      ]
    }

    // Generate basic analytics
    const analytics = {
      overview: {
        totalSkills: mockUserData.skills.length,
        averageSkillLevel: Math.round(mockUserData.skills.reduce((sum, skill) => sum + skill.level, 0) / mockUserData.skills.length),
        skillsImproving: mockUserData.skills.filter(s => s.progress > 0).length,
        totalActivities: mockUserData.activities.reduce((sum, activity) => sum + activity.count, 0),
        daysActive: Math.floor((Date.now() - mockUserData.profile.joinedDate.getTime()) / (1000 * 60 * 60 * 24)),
        achievementCount: mockUserData.achievements.length
      },
      skillProgress: {
        byCategory: mockUserData.skills.reduce((acc, skill) => {
          if (!acc[skill.category]) {
            acc[skill.category] = { total: 0, count: 0, avgGrowth: 0 }
          }
          acc[skill.category].total += skill.level
          acc[skill.category].count += 1
          acc[skill.category].avgGrowth += skill.monthlyGrowth
          return acc
        }, {} as any),
        trending: mockUserData.skills
          .sort((a, b) => b.monthlyGrowth - a.monthlyGrowth)
          .slice(0, 3)
          .map(skill => ({
            name: skill.name,
            level: skill.level,
            growth: skill.monthlyGrowth,
            category: skill.category
          })),
        needsAttention: mockUserData.skills
          .filter(skill => skill.level < 50 || skill.monthlyGrowth < 2)
          .map(skill => ({
            name: skill.name,
            level: skill.level,
            growth: skill.monthlyGrowth,
            reason: skill.level < 50 ? 'Low proficiency' : 'Stagnant progress'
          }))
      },
      activityPatterns: {
        mostActive: mockUserData.activities
          .sort((a, b) => b.count - a.count)
          .slice(0, 3),
        recentEngagement: mockUserData.activities
          .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
          .slice(0, 5),
        weeklyAverage: Math.round(mockUserData.activities.reduce((sum, activity) => sum + activity.count, 0) / 12) // Assuming 12 weeks of data
      },
      careerProgression: {
        primaryFocus: determineCareerFocus(mockUserData),
        readinessScore: calculateReadinessScore(mockUserData),
        nextMilestones: [
          { goal: 'Advance React skills to 90%', timeline: '2-3 months', priority: 'high' },
          { goal: 'Complete AWS certification', timeline: '4-6 months', priority: 'high' },
          { goal: 'Build full-stack portfolio project', timeline: '3-4 months', priority: 'medium' }
        ]
      }
    }

    // Process category averages
    Object.keys(analytics.skillProgress.byCategory).forEach(category => {
      const categoryData = analytics.skillProgress.byCategory[category]
      categoryData.average = Math.round(categoryData.total / categoryData.count)
      categoryData.avgGrowth = Math.round(categoryData.avgGrowth / categoryData.count)
    })

    // Generate AI insights if requested
    let aiInsights = null
    if (includeAI) {
      try {
        aiInsights = await generateAIProfileInsights(mockUserData, analytics)
      } catch (error) {
        console.error('AI insights generation failed:', error)
        aiInsights = {
          error: 'AI insights temporarily unavailable',
          fallback: true
        }
      }
    }

    return NextResponse.json({
      analytics,
      aiInsights,
      userData: {
        profile: mockUserData.profile,
        goals: mockUserData.goals,
        interests: mockUserData.interests,
        recentAchievements: mockUserData.achievements.slice(-3)
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        dataRange: '90 days',
        hasAiInsights: aiInsights !== null
      }
    })

  } catch (error) {
    console.error('Error in GET /api/profile/analytics:', error)
    
    // Return fallback analytics
    const fallbackAnalytics = {
      overview: {
        totalSkills: 6,
        averageSkillLevel: 65,
        skillsImproving: 4,
        totalActivities: 93,
        daysActive: 90,
        achievementCount: 4
      },
      insights: [
        'Your technical skills are growing steadily',
        'Consider focusing on cloud technologies',
        'Leadership skills could use some attention'
      ],
      nextSteps: [
        'Continue building your React expertise',
        'Start learning AWS fundamentals',
        'Work on a full-stack project'
      ]
    }

    return NextResponse.json({
      analytics: fallbackAnalytics,
      message: 'Analytics generated with fallback data'
    })
  }
}

async function generateAIProfileInsights(userData: any, analytics: any) {
  const userProfile = {
    skills: userData.skills.map((skill: any) => ({ 
      name: skill.name, 
      level: skill.level, 
      category: skill.category,
      growth: skill.monthlyGrowth 
    })),
    interests: userData.interests,
    goals: userData.goals,
    experience: 'intermediate', // Based on average skill level
    activities: userData.activities,
    achievements: userData.achievements.length
  }

  try {
    // Generate comprehensive career insights
    const careerAnalysis = await aiService.analyzeCareerFit(
      userProfile, 
      'Full-Stack Developer', // Primary career goal
      { provider: 'auto', maxTokens: 1000 }
    )

    // Generate personalized learning recommendations
    const learningPath = await generateLearningRecommendations(userProfile)

    // Generate career trajectory prediction
    const careerTrajectory = await predictCareerTrajectory(userProfile, analytics)

    return {
      careerAnalysis,
      learningRecommendations: learningPath,
      careerTrajectory,
      personalizedInsights: await generatePersonalizedInsights(userData, analytics),
      actionPlan: await generateActionPlan(userProfile, careerAnalysis),
      competitivenessAnalysis: await analyzeMarketCompetitiveness(userProfile)
    }
  } catch (error) {
    console.error('AI insights generation error:', error)
    return {
      error: 'AI analysis failed',
      fallbackInsights: [
        'Continue focusing on your strongest skills',
        'Consider expanding into related technologies',
        'Build more real-world projects to demonstrate expertise'
      ]
    }
  }
}

async function generateLearningRecommendations(userProfile: any) {
  const prompt = `Based on this skill profile, recommend a personalized learning path:

CURRENT SKILLS:
${userProfile.skills.map((skill: any) => `- ${skill.name}: ${skill.level}% (${skill.category}, Growth: +${skill.growth}%/month)`).join('\n')}

INTERESTS: ${userProfile.interests.join(', ')}
GOALS: ${userProfile.goals.join(', ')}

Provide recommendations in JSON format:
{
  "immediateActions": ["Actions for next 1-2 weeks"],
  "shortTerm": ["Goals for next 1-3 months"],
  "mediumTerm": ["Goals for 3-6 months"],
  "longTerm": ["Goals for 6+ months"],
  "skillPriorities": [
    { "skill": "Skill Name", "reason": "Why prioritize", "timeline": "When to focus" }
  ],
  "learningResources": [
    { "type": "course|book|project", "title": "Resource name", "focus": "What it covers" }
  ]
}`

  try {
    const response = await aiService.generateResponse(prompt, {
      provider: 'auto',
      maxTokens: 1200,
      systemPrompt: "You are an expert career development coach focused on practical, actionable learning recommendations."
    })

    return JSON.parse(response.content)
  } catch (error) {
    return {
      immediateActions: ["Practice coding daily", "Complete current projects"],
      shortTerm: ["Advance strongest skills", "Learn complementary technologies"],
      mediumTerm: ["Build portfolio projects", "Gain practical experience"],
      longTerm: ["Pursue industry certifications", "Develop leadership skills"],
      skillPriorities: userProfile.skills.slice(0, 3).map((skill: any) => ({
        skill: skill.name,
        reason: `${skill.level < 70 ? 'Needs foundational work' : 'Ready for advanced concepts'}`,
        timeline: skill.growth > 5 ? 'Continue current pace' : 'Needs focused attention'
      }))
    }
  }
}

async function predictCareerTrajectory(userProfile: any, analytics: any) {
  const avgSkillLevel = userProfile.skills.reduce((sum: number, skill: any) => sum + skill.level, 0) / userProfile.skills.length
  const avgGrowthRate = userProfile.skills.reduce((sum: number, skill: any) => sum + skill.growth, 0) / userProfile.skills.length

  return {
    currentStage: avgSkillLevel > 75 ? 'Advanced' : avgSkillLevel > 50 ? 'Intermediate' : 'Beginner',
    projectedGrowth: {
      threMonths: Math.min(100, avgSkillLevel + (avgGrowthRate * 3)),
      sixMonths: Math.min(100, avgSkillLevel + (avgGrowthRate * 6)),
      oneYear: Math.min(100, avgSkillLevel + (avgGrowthRate * 12))
    },
    readinessForNextLevel: avgSkillLevel > 70 && avgGrowthRate > 5 ? 'High' : 'Medium',
    recommendedPath: [
      'Continue skill development',
      'Build comprehensive portfolio',
      'Seek advanced challenges',
      'Consider mentorship opportunities'
    ]
  }
}

async function generatePersonalizedInsights(userData: any, analytics: any) {
  return [
    `Your ${analytics.skillProgress.trending[0]?.name || 'top'} skills are growing rapidly`,
    `You've been most active in ${analytics.activityPatterns.mostActive[0]?.type || 'learning'}`,
    `Your technical skills average ${analytics.overview.averageSkillLevel}% - ${analytics.overview.averageSkillLevel > 70 ? 'excellent progress!' : 'good foundation to build on'}`,
    `You've achieved ${analytics.overview.achievementCount} milestones in ${analytics.overview.daysActive} days`,
    analytics.skillProgress.needsAttention.length > 0 
      ? `Consider focusing on ${analytics.skillProgress.needsAttention[0]?.name} to round out your skillset`
      : 'Your skills are well-balanced across categories'
  ]
}

async function generateActionPlan(userProfile: any, careerAnalysis: any) {
  return {
    week1: [
      'Review and update your strongest skills',
      'Identify one skill gap to address',
      'Start a small practice project'
    ],
    month1: [
      'Complete online course in priority skill area',
      'Build portfolio project showcasing new skills',
      'Network with professionals in your field'
    ],
    month3: [
      'Apply new skills in real-world context',
      'Seek feedback from mentors or peers',
      'Consider advanced certifications'
    ],
    month6: [
      'Evaluate progress against goals',
      'Expand skillset into complementary areas',
      'Share knowledge through teaching or writing'
    ]
  }
}

async function analyzeMarketCompetitiveness(userProfile: any) {
  const techSkills = userProfile.skills.filter((skill: any) => 
    ['Frontend', 'Backend', 'Programming', 'Cloud'].includes(skill.category)
  )
  
  const avgTechLevel = techSkills.reduce((sum: number, skill: any) => sum + skill.level, 0) / techSkills.length

  return {
    overallScore: Math.round(avgTechLevel),
    marketPosition: avgTechLevel > 80 ? 'Highly Competitive' : 
                   avgTechLevel > 65 ? 'Competitive' : 
                   avgTechLevel > 45 ? 'Developing' : 'Entry Level',
    strengths: techSkills.filter((skill: any) => skill.level > 70).map((skill: any) => skill.name),
    improvements: techSkills.filter((skill: any) => skill.level < 60).map((skill: any) => skill.name),
    industryAlignment: userProfile.interests.some((interest: string) => 
      ['Web Development', 'Machine Learning', 'Cloud Computing'].includes(interest)
    ) ? 'Strong' : 'Moderate',
    recommendation: avgTechLevel > 70 
      ? 'Ready for mid-level positions, focus on specialization'
      : 'Continue building foundational skills, consider entry-level opportunities'
  }
}

function determineCareerFocus(userData: any): string {
  const skillCategories = userData.skills.reduce((acc: any, skill: any) => {
    acc[skill.category] = (acc[skill.category] || 0) + skill.level
    return acc
  }, {})

  const topCategory = Object.entries(skillCategories)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]

  return `${topCategory[0]} Development`
}

function calculateReadinessScore(userData: any): number {
  const skillScore = userData.skills.reduce((sum: number, skill: any) => sum + skill.level, 0) / userData.skills.length
  const activityScore = Math.min(100, userData.activities.reduce((sum: number, activity: any) => sum + activity.count, 0) / 2)
  const achievementScore = Math.min(100, userData.achievements.length * 20)

  return Math.round((skillScore * 0.5) + (activityScore * 0.3) + (achievementScore * 0.2))
}