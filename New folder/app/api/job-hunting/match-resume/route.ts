import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { FreeAIService } from '@/lib/free-ai-services'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { resumeText, jobDescription, jobTitle, company } = await request.json()

    if (!resumeText || !jobDescription) {
      return NextResponse.json({ 
        error: 'Resume text and job description are required' 
      }, { status: 400 })
    }

    // Initialize Free AI Service
    const aiService = FreeAIService.getInstance()

    // Match resume against job description
    const matchResult = await aiService.matchResumeToJob(resumeText, jobDescription)

    // Generate outreach materials (cover letter and email)
    const outreachPrompt = `Generate a professional cover letter and networking email for this job application:

JOB TITLE: ${jobTitle || 'Position'}
COMPANY: ${company || 'Company'}
JOB DESCRIPTION: ${jobDescription}
RESUME SUMMARY: ${resumeText.substring(0, 1000)}...

Create both a cover letter and a networking email. Return in JSON format:
{
  "coverLetter": {
    "subject": "Application for [Job Title] - [Your Name]",
    "content": "Full cover letter content with proper formatting"
  },
  "networkingEmail": {
    "subject": "Interest in [Job Title] opportunity",
    "content": "Professional networking email to hiring manager or employees"
  }
}

Make them professional, personalized, and highlight relevant experience. Return ONLY JSON.`

    let outreachContent
    try {
      const outreachResponse = await aiService.generateResponse(outreachPrompt, { maxTokens: 1500 })
      outreachContent = JSON.parse(outreachResponse.content)
    } catch (error) {
      console.error('❌ Outreach generation error:', error)
      outreachContent = {
        coverLetter: {
          subject: `Application for ${jobTitle || 'Position'} - Professional Candidate`,
          content: `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle || 'position'} role at ${company || 'your company'}. Based on the job description and requirements, I believe my background and experience make me a strong candidate for this opportunity.

My relevant experience and skills align well with your needs, particularly in the key areas mentioned in the job posting. I am excited about the possibility of contributing to your team and would welcome the opportunity to discuss how my background can benefit your organization.

Thank you for your time and consideration. I look forward to hearing from you soon.

Best regards,
[Your Name]`
        },
        networkingEmail: {
          subject: `Interest in ${jobTitle || 'Position'} opportunity at ${company || 'Company'}`,
          content: `Hi [Name],

I hope this message finds you well. I came across the ${jobTitle || 'position'} opening at ${company || 'your company'} and was immediately drawn to the opportunity.

Given my background and experience, I believe I could be a strong fit for this role. I would love to learn more about the position and the team culture at ${company || 'your company'}.

Would you be available for a brief conversation about this opportunity? I'd be happy to work around your schedule.

Thank you for your time, and I look forward to connecting.

Best regards,
[Your Name]`
        }
      }
    }

    // Save job match result to database
    const { data: savedMatch, error: saveError } = await supabase
      .from('job_matches')
      .insert({
        user_id: session.user.id,
        job_title: jobTitle || 'Unknown Position',
        company: company || 'Unknown Company',
        job_description: jobDescription,
        match_score: matchResult.matchScore,
        matching_skills: matchResult.matchingSkills,
        missing_skills: matchResult.missingSkills,
        recommendations: matchResult.recommendations,
        cover_letter: outreachContent.coverLetter.content,
        networking_email: outreachContent.networkingEmail.content
      })
      .select()
      .single()

    if (saveError) {
      console.error('❌ Failed to save job match:', saveError)
      // Continue without failing - return results anyway
    }

    // Log activity
    await supabase.from('user_activities').insert({
      user_id: session.user.id,
      type: 'job_match',
      title: 'Job Match Analysis',
      description: `Analyzed match for ${jobTitle} at ${company}`,
      metadata: { 
        matchScore: matchResult.matchScore,
        jobTitle,
        company,
        matchingSkillsCount: matchResult.matchingSkills.length,
        missingSkillsCount: matchResult.missingSkills.length
      }
    })

    // Also log to activities table for dashboard
    await supabase.from('activities').insert({
      user_id: session.user.id,
      type: 'job_matched',
      details: {
        job_match_id: savedMatch?.id,
        job_title: jobTitle,
        company: company,
        match_score: matchResult.matchScore,
        matching_skills_count: matchResult.matchingSkills.length,
        missing_skills_count: matchResult.missingSkills.length
      }
    })

    return NextResponse.json({
      success: true,
      matchResult,
      outreachContent,
      jobMatchId: savedMatch?.id,
      message: 'Job match analysis completed successfully'
    })

  } catch (error) {
    console.error('❌ Job matching error:', error)
    
    return NextResponse.json({
      error: 'Failed to analyze job match',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}