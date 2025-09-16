import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getValidatedConfig } from '@/lib/env-validation'
import { FreeAIService } from '@/lib/free-ai-services'
import { PDFParser } from '@/lib/pdf-parser'

export async function POST(request: NextRequest) {
  try {
    const config = getValidatedConfig()
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('resume') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate PDF file
    const validation = PDFParser.validatePDFFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Extract text from PDF
    let resumeText: string
    try {
      const pdfResult = await PDFParser.extractTextFromFile(file)
      resumeText = PDFParser.cleanText(pdfResult.text)
      
      if (!resumeText.trim()) {
        throw new Error('No text content found in PDF')
      }
      
      console.log(`✅ PDF parsed successfully: ${pdfResult.pages} pages, ${resumeText.length} characters`)
    } catch (pdfError) {
      console.error('❌ PDF parsing failed:', pdfError)
      return NextResponse.json({ 
        error: 'Failed to parse PDF file. Please ensure the file is a valid PDF with text content.' 
      }, { status: 400 })
    }

    // Initialize Free AI Service
    const aiService = FreeAIService.getInstance()

    // Analyze resume using free AI models
    const analysisData = await aiService.parseResume(resumeText)

    // Save resume data to database
    const { data: savedResume, error: saveError } = await supabase
      .from('user_resumes')
      .insert({
        user_id: session.user.id,
        filename: file.name,
        content: resumeText,
        ai_analysis: analysisData,
        skills_extracted: analysisData.skills.technical || [],
        experience_extracted: analysisData.experience.map((exp: any) => exp.title) || []
      })
      .select()
      .single()

    if (saveError) {
      console.error('❌ Failed to save resume:', saveError)
      throw new Error('Failed to save resume analysis')
    }

    // Log activity
    await supabase.from('user_activities').insert({
      user_id: session.user.id,
      type: 'resume',
      title: 'Resume Analysis Completed',
      description: `Analyzed resume: ${file.name}`,
      metadata: { 
        filename: file.name,
        skillsCount: analysisData.skills.technical?.length || 0,
        experienceYears: analysisData.summary.totalExperience,
        seniorityLevel: analysisData.summary.seniorityLevel
      }
    })

    // Also log to the new activities table for dashboard tracking
    await supabase.from('activities').insert({
      user_id: session.user.id,
      type: 'job_analyzed',
      details: {
        job_id: savedResume.id,
        filename: file.name,
        skills_count: analysisData.skills.technical?.length || 0,
        experience_years: analysisData.summary.totalExperience,
        seniority_level: analysisData.summary.seniorityLevel
      }
    })

    return NextResponse.json({
      success: true,
      analysis: analysisData,
      resumeId: savedResume.id,
      message: 'Resume analyzed successfully'
    })

  } catch (error) {
    console.error('❌ Resume parsing error:', error)
    
    return NextResponse.json({
      error: 'Failed to analyze resume',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}