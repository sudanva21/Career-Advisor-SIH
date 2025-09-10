import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Create a mock user ID for testing (you would get this from session in real app) 
    const mockUserId = 'demo-test-user-123456'

    // Create or update user record in Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: mockUserId,
        email: 'demo@example.com',
        first_name: 'Demo',
        last_name: 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (userError && userError.code !== '23505') { // 23505 is unique violation (already exists)
      console.error('Error creating user:', userError)
    }

    // Create user activities for quiz completion
    const { data: activityData, error: activityError } = await supabase
      .from('user_activities')
      .insert({
        user_id: mockUserId,
        type: 'quiz',
        title: 'Career Assessment Completed',
        description: 'Completed career assessment quiz - Frontend Developer path discovered',
        metadata: {
          answers: {
            q1: 'Web Development',
            q2: 'JavaScript', 
            q3: 'Frontend',
            q4: 'React'
          },
          careerPath: 'Frontend Developer',
          score: 85,
          interests: ['Web Development', 'Programming', 'UI/UX'],
          skills: ['JavaScript', 'React', 'HTML', 'CSS']
        },
        created_at: new Date().toISOString()
      })
      .select()

    if (activityError) {
      console.error('Error creating activity:', activityError)
    }

    // Create skill records based on quiz
    const skills = [
      { name: 'JavaScript', current_level: 80, target_level: 90, category: 'Technical' },
      { name: 'React', current_level: 85, target_level: 95, category: 'Technical' },
      { name: 'Web Development', current_level: 75, target_level: 90, category: 'Technical' }
    ]

    const skillResults = await Promise.all(
      skills.map(skill =>
        supabase
          .from('user_skills')
          .upsert({
            user_id: mockUserId,
            skill_name: skill.name,
            current_level: skill.current_level,
            target_level: skill.target_level,
            category: skill.category,
            last_updated: new Date().toISOString()
          })
          .select()
      )
    )

    // Create achievement for completing the quiz
    const { data: achievementData, error: achievementError } = await supabase
      .from('user_achievements')
      .insert({
        user_id: mockUserId,
        achievement_type: 'quiz_completion',
        title: 'First Quiz Completed',
        description: 'Completed your first career assessment',
        points_earned: 75,
        earned_at: new Date().toISOString()
      })
      .select()

    if (achievementError) {
      console.error('Error creating achievement:', achievementError)
    }

    return NextResponse.json({
      success: true,
      message: 'Test quiz data created successfully using Supabase!',
      data: {
        user: userData,
        activity: activityData,
        skills: skillResults.map(r => r.data).filter(Boolean),
        achievement: achievementData
      }
    })

  } catch (error) {
    console.error('Error creating test quiz data:', error)
    return NextResponse.json({
      error: 'Failed to create test data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}