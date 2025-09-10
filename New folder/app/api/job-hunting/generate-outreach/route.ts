import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getValidatedConfig } from '@/lib/env-validation'
import { FreeAIService } from '@/lib/free-ai-services'

export async function POST(request: NextRequest) {
  try {
    const config = getValidatedConfig()
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { jobData, resumeAnalysis, type, customMessage = '' } = await request.json()

    if (!jobData || !resumeAnalysis || !type) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    // Initialize Free AI Service for AI outreach generation
    const aiService = FreeAIService.getInstance()

    // Create personalized prompts based on outreach type
    let prompt = ''
    
    if (type === 'email') {
      prompt = `Generate a professional job application email based on this information:

Job Details:
${JSON.stringify(jobData, null, 2)}

Candidate Profile:
${JSON.stringify(resumeAnalysis.summary, null, 2)}

Key Skills: ${resumeAnalysis.skills.technical.join(', ')}
Experience: ${resumeAnalysis.experience.map((exp: any) => `${exp.title} at ${exp.company}`).join(', ')}

Custom Message/Instructions: ${customMessage || 'Standard professional approach'}

Generate a personalized email in this JSON format:
{
  "subject": "Professional subject line",
  "content": "Full email content with proper formatting",
  "tone": "professional/enthusiastic/formal",
  "keyHighlights": [
    "Key point 1 emphasized in email",
    "Key point 2 emphasized in email"
  ],
  "callToAction": "Specific next step requested",
  "personalization": [
    "How the email was personalized",
    "Specific company/role mentions"
  ]
}

Requirements:
- Professional but engaging tone
- Highlight relevant skills and experience 
- Show genuine interest in the company/role
- Include specific examples from experience
- Keep concise (150-250 words)
- Strong subject line
- Clear call to action

Return ONLY valid JSON.`
    } else if (type === 'cover-letter') {
      prompt = `Generate a professional cover letter based on this information:

Job Details:
${JSON.stringify(jobData, null, 2)}

Candidate Profile:
${JSON.stringify(resumeAnalysis.summary, null, 2)}

Experience: ${JSON.stringify(resumeAnalysis.experience, null, 2)}
Education: ${JSON.stringify(resumeAnalysis.education, null, 2)}
Skills: ${JSON.stringify(resumeAnalysis.skills, null, 2)}

Custom Instructions: ${customMessage || 'Standard professional cover letter'}

Generate a comprehensive cover letter in this JSON format:
{
  "content": "Full cover letter with proper business formatting",
  "structure": {
    "opening": "Opening paragraph",
    "body1": "First body paragraph - experience and skills",
    "body2": "Second body paragraph - specific achievements",
    "closing": "Closing paragraph with call to action"
  },
  "keyStrengths": [
    "Strength 1 highlighted",
    "Strength 2 highlighted"
  ],
  "achievements": [
    "Specific achievement 1",
    "Specific achievement 2"
  ],
  "companyConnection": "How candidate connects with company/role"
}

Requirements:
- Professional business letter format
- 3-4 paragraphs, 300-400 words
- Specific examples from experience
- Quantified achievements where possible
- Show research about company
- Strong opening and closing
- Align skills with job requirements

Return ONLY valid JSON.`
    } else if (type === 'linkedin-message') {
      prompt = `Generate a professional LinkedIn connection/message based on this information:

Job Details:
${JSON.stringify(jobData, null, 2)}

Candidate Profile:
${JSON.stringify(resumeAnalysis.summary, null, 2)}

Custom Message: ${customMessage || 'Professional networking approach'}

Generate a LinkedIn message in this JSON format:
{
  "content": "Full LinkedIn message content",
  "type": "connection_request/follow_up/direct_message",
  "approach": "networking/direct_application/informational",
  "keyPoints": [
    "Key point 1",
    "Key point 2"
  ],
  "callToAction": "Specific request or next step"
}

Requirements:
- Professional yet personable tone
- Concise (50-150 words for connection, 100-200 for message)
- Clear purpose
- Mutual benefit approach
- Specific reason for connecting
- Professional but friendly

Return ONLY valid JSON.`
    }

    const result = await aiService.generateResponse(prompt, {
      maxTokens: 1500,
      temperature: 0.7
    })
    const text = result.content
    
    let outreachData
    try {
      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      outreachData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('❌ Failed to parse outreach content:', parseError)
      console.error('Raw response:', text)
      
      // Fallback content based on type
      if (type === 'email') {
        outreachData = {
          subject: `Application for ${jobData.title} position`,
          content: `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobData.title} position at ${jobData.company}. With my background in ${resumeAnalysis.summary.primaryRole} and ${resumeAnalysis.summary.totalExperience} of experience, I am excited about the opportunity to contribute to your team.

In my previous roles, I have developed expertise in ${resumeAnalysis.skills.technical.slice(0, 3).join(', ')}, which align well with your requirements. I am particularly drawn to ${jobData.company} because of your innovative approach to technology and commitment to excellence.

I would welcome the opportunity to discuss how my skills and experience can benefit your team. Thank you for considering my application.

Best regards,
[Your Name]`,
          tone: 'professional',
          keyHighlights: ['Relevant experience', 'Technical skills alignment'],
          callToAction: 'Request for interview discussion',
          personalization: ['Company name', 'Role-specific skills']
        }
      } else if (type === 'cover-letter') {
        outreachData = {
          content: `[Your Name]
[Your Address]
[City, State ZIP]
[Your Email]
[Your Phone]
[Date]

[Hiring Manager Name]
${jobData.company}
[Company Address]

Dear Hiring Manager,

I am writing to express my interest in the ${jobData.title} position at ${jobData.company}. With ${resumeAnalysis.summary.totalExperience} of experience in ${resumeAnalysis.summary.primaryRole}, I am confident that my skills and passion for technology make me an ideal candidate for this role.

In my previous positions, I have developed strong expertise in ${resumeAnalysis.skills.technical.slice(0, 3).join(', ')}. My experience includes ${resumeAnalysis.experience[0]?.description || 'developing software solutions and working in collaborative environments'}. I am particularly excited about the opportunity to bring my technical skills and problem-solving abilities to ${jobData.company}.

What attracts me most to ${jobData.company} is your commitment to innovation and the opportunity to work on challenging projects. I am eager to contribute to your team's success and continue growing my skills in a dynamic environment.

Thank you for considering my application. I look forward to the opportunity to discuss how I can contribute to your team.

Sincerely,
[Your Name]`,
          structure: {
            opening: 'Expression of interest and brief background',
            body1: 'Experience and technical skills',
            body2: 'Company interest and value proposition',
            closing: 'Thank you and call to action'
          },
          keyStrengths: ['Technical expertise', 'Problem-solving abilities'],
          achievements: ['Software development', 'Team collaboration'],
          companyConnection: 'Innovation focus and growth opportunities'
        }
      } else {
        outreachData = {
          content: `Hi [Name],

I noticed your company ${jobData.company} is hiring for a ${jobData.title} position. With my background in ${resumeAnalysis.summary.primaryRole}, I'm very interested in learning more about this opportunity.

I'd love to connect and potentially discuss how my experience with ${resumeAnalysis.skills.technical.slice(0, 2).join(' and ')} might be a fit for your team.

Thanks for your time!`,
          type: 'connection_request',
          approach: 'direct_application',
          keyPoints: ['Relevant background', 'Specific skills match'],
          callToAction: 'Connect to discuss opportunity'
        }
      }
    }

    // Get job match ID if it exists
    const { data: existingJob } = await supabase
      .from('job_matches')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('job_title', jobData.title)
      .eq('company', jobData.company)
      .single()

    // Save outreach draft to database
    const { data: savedDraft, error: saveError } = await supabase
      .from('outreach_drafts')
      .insert({
        user_id: session.user.id,
        job_id: existingJob?.id || null,
        type: type,
        content: type === 'email' ? 
          `Subject: ${outreachData.subject}\n\n${outreachData.content}` : 
          outreachData.content,
        status: 'draft'
      })
      .select()
      .single()

    if (saveError) {
      console.error('❌ Failed to save outreach draft:', saveError)
      // Continue without throwing error
    }

    // Log activity
    await supabase.from('user_activities').insert({
      user_id: session.user.id,
      type: 'interaction',
      title: 'Generated Outreach Content',
      description: `Created ${type} for ${jobData.title} at ${jobData.company}`,
      metadata: { 
        outreachType: type,
        jobTitle: jobData.title,
        company: jobData.company,
        draftId: savedDraft?.id
      }
    })

    return NextResponse.json({
      success: true,
      outreach: outreachData,
      draftId: savedDraft?.id,
      message: `${type} generated successfully`
    })

  } catch (error) {
    console.error('❌ Outreach generation error:', error)
    
    return NextResponse.json({
      error: 'Failed to generate outreach content',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}