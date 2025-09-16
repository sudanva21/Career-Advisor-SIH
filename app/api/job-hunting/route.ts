import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getValidatedConfig } from '@/lib/env-validation'

export async function GET(request: NextRequest) {
  try {
    getValidatedConfig()
    
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const userId = session.user.id
    
    // Fetch user's job hunting data
    const [resumeData, jobMatches, outreachDrafts] = await Promise.allSettled([
      supabaseAdmin
        .from('user_resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1),
      supabaseAdmin
        .from('job_matches')
        .select('*')
        .eq('user_id', userId)
        .order('match_score', { ascending: false })
        .limit(10),
      supabaseAdmin
        .from('outreach_drafts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)
    ])

    const resume = resumeData.status === 'fulfilled' ? resumeData.value.data?.[0] : null
    const matches = jobMatches.status === 'fulfilled' ? jobMatches.value.data || [] : []
    const drafts = outreachDrafts.status === 'fulfilled' ? outreachDrafts.value.data || [] : []

    return NextResponse.json({
      success: true,
      data: {
        hasResume: !!resume,
        resumeAnalysis: resume?.ai_analysis || null,
        jobMatches: matches,
        outreachDrafts: drafts,
        stats: {
          totalMatches: matches.length,
          highMatches: matches.filter(m => m.match_score > 80).length,
          draftsSaved: drafts.length
        }
      }
    })

  } catch (error) {
    console.error('❌ Job hunting API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job hunting data', success: false },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = getValidatedConfig()
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const userId = session.user.id
    const { action, data } = await request.json()

    switch (action) {
      case 'upload-resume': {
        // Parse resume with AI
        const aiAnalysis = await parseResumeWithAI(data.resumeContent, config)
        
        // Save to database
        const { data: resumeRecord, error } = await supabaseAdmin
          .from('user_resumes')
          .insert({
            user_id: userId,
            content: data.resumeContent,
            filename: data.filename,
            ai_analysis: aiAnalysis,
            skills_extracted: aiAnalysis.skills || [],
            experience_extracted: aiAnalysis.experience || []
          })
          .select()
          .single()

        if (error) throw error

        // Log activity
        await supabaseAdmin
          .from('user_activities')
          .insert({
            user_id: userId,
            type: 'job-hunting',
            title: 'Resume Uploaded',
            description: `Uploaded ${data.filename} and analyzed with AI`,
            metadata: { filename: data.filename, skillsFound: aiAnalysis.skills?.length || 0 }
          })

        return NextResponse.json({ success: true, data: resumeRecord })
      }

      case 'search-jobs': {
        const { skills, location, experience } = data
        const jobListings = await fetchJobListings({ skills, location, experience })
        
        // Save job matches
        const matchPromises = jobListings.map(job => 
          supabaseAdmin
            .from('job_matches')
            .insert({
              user_id: userId,
              job_title: job.title,
              company: job.company,
              location: job.location,
              match_score: job.matchScore,
              job_data: job,
              source: 'ai-search'
            })
        )

        await Promise.allSettled(matchPromises)

        return NextResponse.json({ success: true, data: jobListings })
      }

      case 'generate-outreach': {
        const { jobId, type } = data // type: 'email' | 'cover-letter'
        
        const outreachContent = await generateOutreachWithAI(jobId, type, userId, config)
        
        // Save draft
        const { data: draft } = await supabaseAdmin
          .from('outreach_drafts')
          .insert({
            user_id: userId,
            job_id: jobId,
            type: type,
            content: outreachContent,
            status: 'draft'
          })
          .select()
          .single()

        return NextResponse.json({ success: true, data: draft })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Job hunting POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process job hunting request', success: false },
      { status: 500 }
    )
  }
}

async function parseResumeWithAI(resumeContent: string, config: any) {
  try {
    if (config.ai.openAIKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.ai.openAIKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: `Parse this resume and extract key information as JSON:
            
            Resume Content: ${resumeContent}
            
            Please return JSON with: {
              "skills": ["skill1", "skill2", ...],
              "experience": ["experience1", "experience2", ...],
              "education": ["degree1", "degree2", ...],
              "summary": "brief summary",
              "strengths": ["strength1", "strength2", ...],
              "careerLevel": "entry|mid|senior"
            }`
          }],
          max_tokens: 1000
        })
      })

      if (response.ok) {
        const data = await response.json()
        return JSON.parse(data.choices[0].message.content)
      }
    }
    
    // Fallback parsing if AI fails
    return {
      skills: extractSkillsFromText(resumeContent),
      experience: extractExperienceFromText(resumeContent),
      education: [],
      summary: resumeContent.substring(0, 200) + '...',
      strengths: [],
      careerLevel: 'mid'
    }
  } catch (error) {
    console.error('Resume parsing error:', error)
    return {
      skills: [],
      experience: [],
      education: [],
      summary: 'Resume parsing failed',
      strengths: [],
      careerLevel: 'mid'
    }
  }
}

async function fetchJobListings({ skills, location, experience }: any) {
  // In a real app, this would use a job API like Indeed, LinkedIn, or Apify
  // For now, return structured mock data that simulates real job search results
  try {
    // This would integrate with real job APIs
    const jobSearchQuery = {
      keywords: skills.join(' '),
      location: location,
      experience: experience
    }

    // Mock implementation - replace with real API
    return [
      {
        id: `job-${Date.now()}-1`,
        title: `${skills[0]} Developer`,
        company: 'TechCorp Inc.',
        location: location,
        salary: '$70,000 - $90,000',
        description: `Looking for a skilled ${skills[0]} developer...`,
        matchScore: 85,
        requirements: skills,
        posted: new Date()
      },
      {
        id: `job-${Date.now()}-2`,
        title: `Senior ${skills[0]} Engineer`,
        company: 'StartupXYZ',
        location: location,
        salary: '$90,000 - $120,000',
        description: `We need an experienced ${skills[0]} professional...`,
        matchScore: 78,
        requirements: skills,
        posted: new Date()
      }
    ]
  } catch (error) {
    console.error('Job search error:', error)
    return []
  }
}

async function generateOutreachWithAI(jobId: string, type: string, userId: string, config: any) {
  try {
    // Get job and user data
    const [jobData, userData] = await Promise.all([
      supabaseAdmin.from('job_matches').select('*').eq('id', jobId).single(),
      supabaseAdmin.from('user_resumes').select('*').eq('user_id', userId).limit(1).single()
    ])

    if (config.ai.openAIKey) {
      const prompt = type === 'email' 
        ? `Write a professional outreach email for this job application:
           Job: ${jobData.data.job_title} at ${jobData.data.company}
           User skills: ${userData.data?.skills_extracted?.join(', ') || 'General'}
           Keep it concise and personalized.`
        : `Write a compelling cover letter for this job application:
           Job: ${jobData.data.job_title} at ${jobData.data.company}
           User background: ${userData.data?.ai_analysis?.summary || 'Professional background'}
           Make it specific to the role and company.`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.ai.openAIKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.choices[0].message.content
      }
    }

    // Fallback template
    return type === 'email'
      ? `Subject: Application for ${jobData.data.job_title} Position

Dear Hiring Manager,

I am writing to express my interest in the ${jobData.data.job_title} position at ${jobData.data.company}. 

With my background in ${userData.data?.skills_extracted?.slice(0, 3).join(', ') || 'relevant technologies'}, I believe I would be a strong fit for this role.

I would welcome the opportunity to discuss how my skills align with your needs.

Best regards,
[Your Name]`
      : `Dear Hiring Manager,

I am excited to apply for the ${jobData.data.job_title} position at ${jobData.data.company}.

My experience in ${userData.data?.skills_extracted?.slice(0, 2).join(' and ') || 'the field'} makes me well-suited for this role. I am particularly drawn to ${jobData.data.company} because of its innovative approach and growth opportunities.

I look forward to contributing to your team's success.

Sincerely,
[Your Name]`

  } catch (error) {
    console.error('Outreach generation error:', error)
    return 'Failed to generate outreach content'
  }
}

function extractSkillsFromText(text: string): string[] {
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
    'TypeScript', 'Angular', 'Vue.js', 'Docker', 'AWS', 'Git', 'MongoDB',
    'Communication', 'Leadership', 'Problem Solving', 'Project Management'
  ]
  
  return commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  )
}

function extractExperienceFromText(text: string): string[] {
  const experiencePatterns = [
    /\d+\+?\s+years?\s+(?:of\s+)?experience/gi,
    /\d+\+?\s+years?\s+in\s+\w+/gi,
    /experienced?\s+in\s+[\w\s,]+/gi
  ]
  
  const experiences = []
  for (const pattern of experiencePatterns) {
    const matches = text.match(pattern)
    if (matches) {
      experiences.push(...matches.slice(0, 3))
    }
  }
  
  return experiences
}