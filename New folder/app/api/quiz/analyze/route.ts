import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getValidatedConfig } from '@/lib/env-validation'
import { FreeAIService } from '@/lib/free-ai-services'

export async function POST(request: NextRequest) {
  try {
    const config = getValidatedConfig()
    
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    const { answers, questions } = await request.json()
    
    if (!answers || !questions) {
      return NextResponse.json({ error: 'Answers and questions are required' }, { status: 400 })
    }

    // Initialize Free AI Service
    const aiService = FreeAIService.getInstance()

    // Analyze quiz using free AI models
    const quizResult = await aiService.analyzeQuiz(questions, answers)

    // Save to database if user is authenticated
    if (session?.user?.id) {
      const { error: saveError } = await supabaseAdmin.from('quiz_results').insert({
        user_id: session.user.id,
        career_path: quizResult.careerPath,
        score: quizResult.score,
        interests: quizResult.interests,
        skills: quizResult.skills,
        answers: answers
      })

      if (saveError) {
        console.error('❌ Failed to save quiz result:', saveError)
      }

      // Log activity
      await supabaseAdmin.from('user_activities').insert({
        user_id: session.user.id,
        type: 'quiz',
        title: 'Completed Career Quiz',
        description: `Discovered career path: ${quizResult.careerPath}`,
        metadata: { 
          score: quizResult.score,
          careerPath: quizResult.careerPath,
          aiGenerated: true
        }
      })
    }

    return NextResponse.json({
      result: quizResult,
      success: true
    })

  } catch (error) {
    console.error('❌ Quiz analysis error:', error)
    
    return NextResponse.json({
      error: 'Failed to analyze quiz results',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}