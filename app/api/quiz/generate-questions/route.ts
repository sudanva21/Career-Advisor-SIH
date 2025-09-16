import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getValidatedConfig } from '@/lib/env-validation'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const config = getValidatedConfig()
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { preferences } = await request.json()

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(config.GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    // Generate personalized quiz questions
    const prompt = `Generate a personalized career assessment quiz with 8-10 questions based on these preferences:
${preferences ? JSON.stringify(preferences) : 'General career assessment'}

Create a comprehensive quiz that covers:
1. Interests and passions
2. Skills and strengths
3. Work preferences and values
4. Learning style
5. Career goals and aspirations

Return a JSON object with this structure:
{
  "questions": [
    {
      "id": "unique_id",
      "question": "Question text",
      "type": "multiple_choice|scale|multi_select",
      "category": "interests|skills|preferences|values|goals",
      "options": ["option1", "option2", "option3", "option4"] // for multiple_choice and multi_select
    }
  ]
}

Requirements:
- Include 2-3 multiple choice questions
- Include 2-3 scale questions (1-10 rating)
- Include 3-4 multi-select questions
- Make questions engaging and insightful
- Ensure good coverage of different career aspects
- Questions should help identify optimal career matches

Return ONLY valid JSON, no additional text.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()
    
    let questionsData
    try {
      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      questionsData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('❌ Failed to parse questions:', parseError)
      console.error('Raw response:', text)
      
      // Fallback to default questions if AI parsing fails
      questionsData = {
        questions: [
          {
            id: '1',
            question: 'What type of work environment energizes you the most?',
            type: 'multiple_choice',
            category: 'preferences',
            options: ['Collaborative team environment', 'Independent remote work', 'Dynamic startup atmosphere', 'Structured corporate setting']
          },
          {
            id: '2',
            question: 'How much do you enjoy solving complex problems?',
            type: 'scale',
            category: 'interests'
          },
          {
            id: '3',
            question: 'Which activities do you find most engaging?',
            type: 'multi_select',
            category: 'interests',
            options: ['Creating and designing', 'Analyzing data and patterns', 'Leading and managing teams', 'Building and coding', 'Teaching and mentoring', 'Researching and exploring']
          },
          {
            id: '4',
            question: 'Rate your communication and presentation skills',
            type: 'scale',
            category: 'skills'
          },
          {
            id: '5',
            question: 'What aspects of work give you the most satisfaction?',
            type: 'multi_select',
            category: 'values',
            options: ['Making a positive impact', 'Learning new things', 'Earning good money', 'Having flexibility', 'Being recognized', 'Working with technology']
          },
          {
            id: '6',
            question: 'Which career paths interest you most?',
            type: 'multi_select',
            category: 'goals',
            options: ['Technology and Software', 'Business and Finance', 'Creative Arts and Design', 'Healthcare and Medicine', 'Education and Research', 'Marketing and Sales']
          },
          {
            id: '7',
            question: 'How important is work-life balance to you?',
            type: 'scale',
            category: 'values'
          },
          {
            id: '8',
            question: 'What is your preferred learning style?',
            type: 'multiple_choice',
            category: 'preferences',
            options: ['Hands-on practice', 'Reading and research', 'Visual learning', 'Collaborative learning']
          }
        ]
      }
    }

    // Log activity
    await supabase.from('user_activities').insert({
      user_id: session.user.id,
      type: 'quiz',
      title: 'Generated Personalized Quiz',
      description: 'AI generated personalized career assessment questions',
      metadata: { 
        questionCount: questionsData.questions?.length || 0,
        aiGenerated: true
      }
    })

    return NextResponse.json({
      success: true,
      questions: questionsData.questions || []
    })

  } catch (error) {
    console.error('❌ Question generation error:', error)
    
    return NextResponse.json({
      error: 'Failed to generate quiz questions',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}