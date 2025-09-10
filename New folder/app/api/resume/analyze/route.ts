import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { FreeAIService } from '@/lib/free-ai-services'
import { PDFParser } from '@/lib/pdf-parser'
import { getValidatedConfig } from '@/lib/env-validation'

export async function POST(request: NextRequest) {
  try {
    const config = getValidatedConfig()
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const resumeText = formData.get('text') as string

    if (!file && !resumeText) {
      return NextResponse.json({ error: 'Resume file or text is required' }, { status: 400 })
    }

    let textToAnalyze = ''

    // If file is provided, parse it
    if (file) {
      // Validate file
      const validation = PDFParser.validatePDFFile(file)
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }

      try {
        // Extract text from PDF
        textToAnalyze = await PDFParser.extractTextFromFile(file)
        
        if (!textToAnalyze || textToAnalyze.trim().length < 100) {
          return NextResponse.json({ 
            error: 'Unable to extract sufficient text from PDF. Please ensure the PDF contains readable text or try uploading a different format.' 
          }, { status: 400 })
        }
      } catch (parseError) {
        console.error('PDF parsing error:', parseError)
        return NextResponse.json({ 
          error: 'Failed to parse PDF file. Please ensure it\'s a valid PDF with readable text.' 
        }, { status: 400 })
      }
    } else {
      textToAnalyze = resumeText
    }

    // Clean and validate text
    textToAnalyze = PDFParser.cleanText(textToAnalyze)
    
    if (textToAnalyze.length < 50) {
      return NextResponse.json({ 
        error: 'Resume content is too short. Please provide a more detailed resume.' 
      }, { status: 400 })
    }

    // Initialize Free AI Service and analyze resume
    const aiService = FreeAIService.getInstance()
    
    try {
      const resumeAnalysis = await aiService.parseResume(textToAnalyze)

      // Save resume analysis to database if user is authenticated
      if (session?.user?.id) {
        try {
          // Check if user already has a resume analysis
          const { data: existingAnalysis } = await supabaseAdmin
            .from('resume_analyses')
            .select('id')
            .eq('user_id', session.user.id)
            .single()

          if (existingAnalysis) {
            // Update existing analysis
            await supabaseAdmin
              .from('resume_analyses')
              .update({
                analysis_result: resumeAnalysis,
                resume_text: textToAnalyze,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', session.user.id)
          } else {
            // Insert new analysis
            await supabaseAdmin
              .from('resume_analyses')
              .insert({
                user_id: session.user.id,
                analysis_result: resumeAnalysis,
                resume_text: textToAnalyze
              })
          }

          // Log activity
          await supabaseAdmin.from('user_activities').insert({
            user_id: session.user.id,
            type: 'resume',
            title: 'Resume Analyzed',
            description: `Analyzed resume with ${resumeAnalysis.skills?.technical?.length || 0} technical skills identified`,
            metadata: { 
              skillsFound: resumeAnalysis.skills?.technical?.length || 0,
              experienceYears: resumeAnalysis.summary?.totalExperience || 0,
              aiGenerated: true
            }
          })

          console.log('✅ Resume analysis saved to database')
        } catch (dbError) {
          console.warn('⚠️ Failed to save resume analysis to database:', dbError)
          // Continue without failing the response
        }
      }

      return NextResponse.json({
        analysis: resumeAnalysis,
        success: true,
        message: 'Resume analyzed successfully using AI'
      })

    } catch (aiError: any) {
      console.error('❌ AI resume analysis error:', aiError)
      
      // Provide manual fallback analysis
      const fallbackAnalysis = {
        personalInfo: PDFParser.extractContactInfo(textToAnalyze),
        skills: {
          technical: extractSkillsFromText(textToAnalyze, 'technical'),
          soft: extractSkillsFromText(textToAnalyze, 'soft')
        },
        experience: extractExperienceFromText(textToAnalyze),
        education: extractEducationFromText(textToAnalyze),
        summary: {
          totalExperience: estimateExperience(textToAnalyze),
          keyStrengths: ['Problem Solving', 'Communication'],
          recommendedRoles: ['Software Developer', 'Technical Analyst']
        },
        recommendations: {
          skillsToImprove: ['Leadership', 'Project Management'],
          industryTrends: ['Cloud Computing', 'AI/ML'],
          nextSteps: ['Update LinkedIn profile', 'Build portfolio website']
        }
      }

      return NextResponse.json({
        analysis: fallbackAnalysis,
        success: true,
        fallback: true,
        message: 'Resume analyzed using rule-based parsing (AI service unavailable)',
        error: aiError?.message || 'AI service temporarily unavailable'
      })
    }

  } catch (error) {
    console.error('❌ Resume analysis error:', error)
    
    return NextResponse.json({
      error: 'Failed to analyze resume',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Fallback functions for manual parsing
function extractSkillsFromText(text: string, type: 'technical' | 'soft'): string[] {
  const technicalSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Angular', 'Vue',
    'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Git', 'HTML', 'CSS', 'Express',
    'Spring', 'Django', 'Flask', 'Kubernetes', 'Linux', 'REST', 'GraphQL', 'Redis'
  ]
  
  const softSkills = [
    'Leadership', 'Communication', 'Problem Solving', 'Team Work', 'Project Management',
    'Time Management', 'Analytical Thinking', 'Creativity', 'Adaptability', 'Collaboration'
  ]
  
  const skillsToCheck = type === 'technical' ? technicalSkills : softSkills
  const foundSkills: string[] = []
  
  const lowerText = text.toLowerCase()
  
  skillsToCheck.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill)
    }
  })
  
  return foundSkills
}

function extractExperienceFromText(text: string): any[] {
  // Simple regex to find experience sections
  const experienceSection = text.match(/experience[\s\S]*?(?=education|skills|$)/i)
  if (!experienceSection) return []
  
  // Look for common patterns like "Company - Title (Year-Year)"
  const experienceMatches = experienceSection[0].match(/[\w\s]+ - [\w\s]+ \(\d{4}-\d{4}\)/g) || []
  
  return experienceMatches.map((match, index) => ({
    id: index,
    company: match.split(' - ')[0],
    position: match.split(' - ')[1]?.split(' (')[0],
    duration: match.match(/\(([^)]+)\)/)?.[1] || 'Unknown',
    description: 'Experience extracted from resume'
  }))
}

function extractEducationFromText(text: string): any[] {
  const educationKeywords = ['bachelor', 'master', 'degree', 'university', 'college', 'phd', 'b.s.', 'm.s.']
  const lines = text.split('\n')
  
  const educationLines = lines.filter(line => 
    educationKeywords.some(keyword => line.toLowerCase().includes(keyword))
  )
  
  return educationLines.map((line, index) => ({
    id: index,
    institution: line.trim(),
    degree: 'Degree',
    field: 'Field of Study',
    year: new Date().getFullYear() - 2 // Estimate
  }))
}

function estimateExperience(text: string): number {
  // Look for year ranges in the text
  const yearMatches = text.match(/\d{4}-\d{4}/g) || []
  
  if (yearMatches.length === 0) return 1
  
  // Calculate total years from all ranges
  const totalYears = yearMatches.reduce((sum, range) => {
    const [start, end] = range.split('-').map(Number)
    return sum + (end - start)
  }, 0)
  
  return Math.max(totalYears, 1)
}