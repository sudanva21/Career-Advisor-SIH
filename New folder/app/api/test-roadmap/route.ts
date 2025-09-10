import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize AI clients
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

const genAI = process.env.GOOGLE_AI_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY) : null

export async function GET(request: NextRequest) {
  try {
    console.log('Testing AI Roadmap Generation...')
    
    const testRequest = {
      careerGoal: 'Full-Stack Web Developer',
      currentLevel: 'beginner' as const,
      timeCommitment: 15,
      preferredLearningStyle: 'mixed' as const,
      interests: ['Frontend Development', 'Backend Development'],
      existingSkills: []
    }

    const aiPrompt = `
You are an expert career coach and learning path designer. Create a comprehensive, personalized learning roadmap for someone who wants to become a ${testRequest.careerGoal}.

USER PROFILE:
- Current Level: ${testRequest.currentLevel}
- Time Commitment: ${testRequest.timeCommitment} hours per week
- Learning Style: ${testRequest.preferredLearningStyle}
- Interests: ${testRequest.interests.join(', ') || 'General'}
- Existing Skills: ${testRequest.existingSkills.join(', ') || 'None specified'}

Create a detailed JSON response with the following structure:
{
  "title": "${testRequest.careerGoal} Learning Path",
  "description": "Brief description of the learning path",
  "totalDuration": 6,
  "difficulty": "${testRequest.currentLevel}",
  "estimatedOutcome": "What the learner will achieve",
  "aiRecommendations": [
    "5 specific, actionable recommendations"
  ],
  "phases": [
    {
      "id": "phase1",
      "title": "Phase Title",
      "description": "Phase description",
      "duration": 8,
      "type": "foundation",
      "nodes": [
        {
          "id": "node1",
          "title": "Learning Module Title",
          "type": "skill",
          "description": "Detailed description",
          "duration": "2-3 weeks",
          "difficulty": "beginner",
          "resources": ["Specific resource 1", "Specific resource 2"],
          "skills": ["Skill 1", "Skill 2"],
          "importance": 5
        }
      ]
    }
  ]
}

REQUIREMENTS:
- Create 3-4 phases that build upon each other
- Include mix of theory, practice, projects, and certifications
- Tailor to the ${testRequest.preferredLearningStyle} learning style
- Consider ${testRequest.timeCommitment} hours/week constraint
- Include specific, real resources (courses, books, platforms)
- Make it practical and achievable for ${testRequest.currentLevel} level
- Include portfolio projects relevant to ${testRequest.careerGoal}
- Consider current industry trends and requirements
- Each phase should have 3-5 learning nodes
- Provide estimated timeframes that are realistic

Respond with ONLY the JSON object, no additional text.`

    let aiResponse: any = null
    let aiProvider = 'none'

    // Try OpenAI first
    if (openai) {
      try {
        console.log('Testing with OpenAI...')
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert career coach. Respond with valid JSON only."
            },
            {
              role: "user",
              content: aiPrompt
            }
          ],
          max_tokens: 3000,
          temperature: 0.7
        })

        const content = completion.choices[0]?.message?.content
        if (content) {
          aiResponse = JSON.parse(content)
          aiProvider = 'OpenAI'
          console.log('OpenAI test successful')
        }
      } catch (error) {
        console.error('OpenAI test failed:', error)
      }
    }

    // Fallback to Google Gemini if OpenAI fails
    if (!aiResponse && genAI) {
      try {
        console.log('Testing with Google Gemini...')
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        const result = await model.generateContent(aiPrompt)
        const response = await result.response
        const content = response.text()
        
        // Clean up response to extract JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          aiResponse = JSON.parse(jsonMatch[0])
          aiProvider = 'Google Gemini'
          console.log('Google Gemini test successful')
        }
      } catch (error) {
        console.error('Google Gemini test failed:', error)
      }
    }

    if (aiResponse) {
      return NextResponse.json({
        success: true,
        provider: aiProvider,
        roadmap: {
          id: `roadmap-${Date.now()}`,
          title: aiResponse.title || `${testRequest.careerGoal} Learning Path`,
          description: aiResponse.description || `A comprehensive roadmap to master ${testRequest.careerGoal.toLowerCase()} skills from ${testRequest.currentLevel} level`,
          totalDuration: aiResponse.totalDuration || 6,
          phases: aiResponse.phases || [],
          aiRecommendations: aiResponse.aiRecommendations || [
            `Dedicate ${testRequest.timeCommitment} hours per week consistently`,
            `Focus on ${testRequest.currentLevel}-level concepts before advancing`,
            'Build projects to reinforce theoretical knowledge',
            'Join relevant communities for networking and support',
            'Regularly update your portfolio with new projects'
          ],
          difficulty: testRequest.currentLevel,
          estimatedOutcome: aiResponse.estimatedOutcome || `Job-ready ${testRequest.careerGoal} with strong foundation and portfolio projects`
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Both AI providers failed',
        message: 'Neither OpenAI nor Google Gemini could generate the roadmap'
      })
    }

  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}