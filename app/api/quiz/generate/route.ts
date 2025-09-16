import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { FreeAIService } from '@/lib/free-ai-services'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    const { preferences = {} } = await request.json()

    // Initialize Free AI Service
    const aiService = FreeAIService.getInstance()

    // Generate AI-powered quiz questions
    const prompt = `Generate 8 comprehensive career assessment quiz questions in JSON format.
    
    Requirements:
    - Mix of multiple_choice, scale (1-5), and multi_select question types
    - Categories: interests, skills, preferences, personality
    - Questions should be engaging, modern, and relevant for career discovery
    - Include diverse career paths and modern job roles
    - Each question should have an 'id', 'question', 'type', 'category', and 'options' (if applicable)
    - Scale questions don't need options
    - Make questions specific and actionable
    
    User preferences: ${JSON.stringify(preferences)}
    
    Return ONLY valid JSON array of questions, no additional text or markdown.`

    const result = await aiService.generateResponse(prompt, { maxTokens: 2000 })
    const text = result.content
    
    let questions
    try {
      // Clean the response to extract JSON
      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      questions = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError)
      console.error('Raw response:', text)
      throw new Error('Failed to parse AI-generated questions')
    }

    // Validate questions structure
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format from AI')
    }

    // Add IDs if missing and validate structure
    const validatedQuestions = questions.map((q, index) => ({
      id: q.id || `q${index + 1}`,
      question: q.question || 'Missing question',
      type: q.type || 'multiple_choice',
      category: q.category || 'general',
      ...(q.options && { options: q.options })
    }))

    // Log activity if user is signed in
    if (session?.user?.id) {
      await supabase.from('user_activities').insert({
        user_id: session.user.id,
        type: 'quiz',
        title: 'Generated AI Quiz',
        description: 'AI-generated personalized career assessment questions',
        metadata: { questionCount: validatedQuestions.length, preferences }
      })
    }

    return NextResponse.json({
      questions: validatedQuestions,
      generated_at: new Date().toISOString(),
      ai_generated: true,
      success: true
    })

  } catch (error) {
    console.error('❌ Quiz generation error:', error)
    
    return NextResponse.json({
      error: 'Failed to generate AI-powered quiz questions',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}