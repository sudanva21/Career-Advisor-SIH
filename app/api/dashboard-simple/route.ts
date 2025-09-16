import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    console.log('Dashboard API called')
    
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    // Get user ID - use demo user in development if no session
    const userId = session?.user?.id || 'demo-user'
    
    // Fetch real dashboard data from Supabase
    const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase
    const [quizResults, savedColleges, roadmaps] = await Promise.all([
      db.from('quiz_results').select('*').eq('user_id', userId),
      db.from('saved_colleges').select('*').eq('user_id', userId),
      db.from('career_roadmaps').select('*').eq('userId', userId)
    ])

    // Calculate stats from real data
    const stats = {
      completedQuizzes: quizResults.data?.length || 0,
      savedColleges: savedColleges.data?.length || 0,
      skillsAcquired: 3, // Mock for now - will implement skills tracking later
      achievementsUnlocked: 1, // Mock for now - will implement achievements later
      roadmapProgress: roadmaps.data?.[0]?.progress || 0,
      weeklyProgress: 10 // Mock for now - will calculate based on recent activity
    }

    // Generate real activity data based on database entries
    const recentActivity = []
    
    // Add quiz completions to activity
    if (quizResults.data && quizResults.data.length > 0) {
      quizResults.data.slice(-3).forEach((quiz, index) => {
        recentActivity.push({
          id: `quiz-${quiz.id}`,
          type: 'quiz',
          icon: 'Brain',
          title: 'Career Assessment Completed',
          description: `Scored ${quiz.score}% - ${quiz.career_path}`,
          timestamp: quiz.created_at,
          color: 'bg-blue-500'
        })
      })
    }

    // Add saved colleges to activity
    if (savedColleges.data && savedColleges.data.length > 0) {
      savedColleges.data.slice(-3).forEach((college) => {
        recentActivity.push({
          id: `college-${college.id}`,
          type: 'college',
          icon: 'Bookmark',
          title: 'College Added to Wishlist',
          description: `Saved ${college.college_name} to your wishlist`,
          timestamp: college.created_at,
          color: 'bg-neon-pink'
        })
      })
    }

    // Add roadmap activities
    if (roadmaps.data && roadmaps.data.length > 0) {
      roadmaps.data.slice(-2).forEach((roadmap) => {
        recentActivity.push({
          id: `roadmap-${roadmap.id}`,
          type: 'roadmap',
          icon: 'Target',
          title: 'Learning Path Created',
          description: `${roadmap.title} - ${roadmap.careerGoal}`,
          timestamp: roadmap.created_at,
          color: 'bg-neon-cyan'
        })
      })
    }

    // Add default activities if no real data exists
    if (recentActivity.length === 0) {
      recentActivity.push(
        {
          id: 'welcome',
          type: 'achievement',
          icon: 'Trophy',
          title: 'Welcome to Career Advisor!',
          description: 'Start your journey by taking a career quiz',
          timestamp: new Date().toISOString(),
          color: 'bg-yellow-500'
        },
        {
          id: 'explore',
          type: 'college',
          icon: 'GraduationCap',
          title: 'Explore Colleges',
          description: 'Discover top engineering colleges across India',
          timestamp: new Date().toISOString(),
          color: 'bg-green-500'
        }
      )
    }

    // Sort activities by timestamp (most recent first)
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Skills progress - use real data from quiz results if available
    const skillProgress = []
    if (quizResults.data && quizResults.data.length > 0) {
      const latestQuiz = quizResults.data[quizResults.data.length - 1]
      if (latestQuiz.skills?.length > 0) {
        latestQuiz.skills.slice(0, 3).forEach((skill: string) => {
          skillProgress.push({
            name: skill,
            current: Math.floor(Math.random() * 40) + 60, // 60-100% range
            target: 100,
            category: skill.includes('JavaScript') || skill.includes('Python') ? 'Programming' : 'General'
          })
        })
      }
    }

    // Default skills if no quiz data
    if (skillProgress.length === 0) {
      skillProgress.push(
        {
          name: 'Problem Solving',
          current: 75,
          target: 100,
          category: 'Core Skills'
        },
        {
          name: 'Communication',
          current: 80,
          target: 100,
          category: 'Soft Skills'
        },
        {
          name: 'Technical Skills',
          current: 70,
          target: 100,
          category: 'Technical'
        }
      )
    }

    // AI Recommendations based on user data
    const recommendations = []
    
    if (stats.completedQuizzes === 0) {
      recommendations.push({
        id: 'take-quiz',
        type: 'quiz',
        title: 'Take Your First Career Quiz',
        description: 'Discover your ideal career path with our AI-powered assessment',
        reason: 'Starting with a quiz helps us personalize your experience',
        confidence: 1.0,
        action: 'Start Quiz'
      })
    }

    if (stats.savedColleges === 0) {
      recommendations.push({
        id: 'explore-colleges',
        type: 'college',
        title: 'Explore Top Colleges',
        description: 'Discover and save colleges that match your career goals',
        reason: 'Building a college wishlist helps you stay organized',
        confidence: 0.9,
        action: 'Browse Colleges'
      })
    }

    // Add general recommendations
    if (recommendations.length < 2) {
      recommendations.push({
        id: 'build-profile',
        type: 'skill',
        title: 'Complete Your Profile',
        description: 'Add more details to get better recommendations',
        reason: 'A complete profile helps us provide better guidance',
        confidence: 0.8,
        action: 'Update Profile'
      })
    }

    // Upcoming tasks based on current state
    const upcomingTasks = []
    
    if (stats.completedQuizzes === 0) {
      upcomingTasks.push({
        id: 'first-quiz',
        title: 'Take Career Assessment Quiz',
        type: 'quiz',
        priority: 'high',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        estimated: '10 minutes'
      })
    }

    if (stats.savedColleges < 3) {
      upcomingTasks.push({
        id: 'research-colleges',
        title: 'Research and Save Colleges',
        type: 'research',
        priority: stats.savedColleges === 0 ? 'high' : 'medium',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        estimated: '30 minutes'
      })
    }

    if (stats.roadmapProgress === 0) {
      upcomingTasks.push({
        id: 'create-roadmap',
        title: 'Create Your Learning Roadmap',
        type: 'study',
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimated: '20 minutes'
      })
    }

    return NextResponse.json({
      stats,
      recentActivity: recentActivity.slice(0, 8),
      skillProgress,
      recommendations: recommendations.slice(0, 3),
      upcomingTasks: upcomingTasks.slice(0, 4)
    })

  } catch (error) {
    console.error('Error in GET /api/dashboard-simple:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}