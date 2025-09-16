import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-services'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, city, state, programs, rating, type, website } = body || {}

    if (!name) {
      return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 })
    }

    const prompt = `Provide a concise, student-friendly overview of the college below in 5-7 bullet points. Focus on strengths, notable programs, campus life, career outcomes, and who it suits best.

College:
- Name: ${name}
- Location: ${city || ''}${city && state ? ', ' : ''}${state || ''}
- Type: ${type || 'N/A'}
- Rating: ${rating || 'N/A'}
- Programs/Courses: ${(programs || []).slice(0,8).join(', ') || 'N/A'}
- Website: ${website || 'N/A'}

Format response as a bullet list without any extra headings.`

    const ai = await aiService.generateResponse(prompt, {
      provider: 'auto',
      maxTokens: 400,
      temperature: 0.5,
      systemPrompt: 'You are an expert Indian college counselor creating clear, unbiased overviews for students.'
    })

    return NextResponse.json({ success: true, overview: ai.content, provider: ai.provider })
  } catch (error: any) {
    console.error('College overview error:', error)
    return NextResponse.json({ success: true, overview: `• Strong academics with reputable programs\n• Competitive admissions; check recent cutoffs\n• Active campus culture and student clubs\n• Good placement support and alumni network\n• Consider fit: location, fees, and preferred course` , provider: 'fallback' })
  }
}