import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { FreeAIService, type JobMatchResult } from '@/lib/free-ai-services'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    const { jobDescription, resumeText } = await request.json()

    if (!jobDescription || !resumeText) {
      return NextResponse.json({ 
        error: 'Job description and resume text are required' 
      }, { status: 400 })
    }

    // Initialize Free AI Service
    const aiService = FreeAIService.getInstance()

    try {
      // Analyze job match using AI
      const matchResult: JobMatchResult = await aiService.matchResumeToJob(resumeText, jobDescription)

      // Save match result if user is authenticated
      if (session?.user?.id) {
        try {
          await supabaseAdmin.from('job_matches').insert({
            user_id: session.user.id,
            job_description: jobDescription,
            resume_text: resumeText,
            match_score: matchResult.matchScore,
            matching_skills: matchResult.matchingSkills,
            missing_skills: matchResult.missingSkills,
            recommendations: matchResult.recommendations,
            cover_letter_suggestions: matchResult.coverLetterSuggestions || []
          })

          // Log activity
          await supabaseAdmin.from('user_activities').insert({
            user_id: session.user.id,
            type: 'job_match',
            title: 'Job Match Analysis',
            description: `Analyzed job compatibility - ${matchResult.matchScore}% match`,
            metadata: { 
              matchScore: matchResult.matchScore,
              matchingSkills: matchResult.matchingSkills?.length || 0,
              missingSkills: matchResult.missingSkills?.length || 0,
              aiGenerated: true
            }
          })

          console.log('✅ Job match saved to database')
        } catch (dbError) {
          console.warn('⚠️ Failed to save job match to database:', dbError)
        }
      }

      return NextResponse.json({
        match: matchResult,
        success: true
      })

    } catch (aiError: any) {
      console.error('❌ AI job matching error:', aiError)
      
      // Provide fallback matching logic
      const fallbackMatch: JobMatchResult = {
        matchScore: calculateSimpleMatch(resumeText, jobDescription),
        matchingSkills: findCommonSkills(resumeText, jobDescription),
        missingSkills: findMissingSkills(resumeText, jobDescription),
        recommendations: [
          'Review the job requirements carefully',
          'Highlight relevant experience in your application',
          'Consider taking courses to fill skill gaps'
        ],
        coverLetterSuggestions: [
          'Emphasize your relevant experience',
          'Show enthusiasm for the role',
          'Address any skill gaps with learning plans'
        ]
      }

      return NextResponse.json({
        match: fallbackMatch,
        success: true,
        fallback: true,
        message: 'Job match analyzed using rule-based matching',
        error: aiError?.message || 'AI service temporarily unavailable'
      })
    }

  } catch (error) {
    console.error('❌ Job matching error:', error)
    
    return NextResponse.json({
      error: 'Failed to analyze job match',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Fallback matching functions
function calculateSimpleMatch(resume: string, jobDesc: string): number {
  const resumeWords = new Set(resume.toLowerCase().split(/\s+/))
  const jobWords = new Set(jobDesc.toLowerCase().split(/\s+/))
  
  const intersection = new Set([...resumeWords].filter(x => jobWords.has(x)))
  const union = new Set([...resumeWords, ...jobWords])
  
  return Math.round((intersection.size / union.size) * 100)
}

function findCommonSkills(resume: string, jobDesc: string): string[] {
  const commonSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Java', 'AWS', 'Docker',
    'Leadership', 'Communication', 'Project Management', 'Problem Solving'
  ]
  
  const resumeLower = resume.toLowerCase()
  const jobLower = jobDesc.toLowerCase()
  
  return commonSkills.filter(skill => 
    resumeLower.includes(skill.toLowerCase()) && jobLower.includes(skill.toLowerCase())
  )
}

function findMissingSkills(resume: string, jobDesc: string): string[] {
  const requiredSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Java', 'AWS', 'Docker',
    'Kubernetes', 'TypeScript', 'Angular', 'Vue', 'MongoDB', 'PostgreSQL'
  ]
  
  const resumeLower = resume.toLowerCase()
  const jobLower = jobDesc.toLowerCase()
  
  return requiredSkills.filter(skill => 
    jobLower.includes(skill.toLowerCase()) && !resumeLower.includes(skill.toLowerCase())
  )
}