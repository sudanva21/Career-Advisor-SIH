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

    const { resumeAnalysis, preferences = {} } = await request.json()

    if (!resumeAnalysis) {
      return NextResponse.json({ error: 'Resume analysis required' }, { status: 400 })
    }

    // Initialize Free AI Service for AI job matching
    const aiService = FreeAIService.getInstance()

    // Create comprehensive prompt for job matching
    const prompt = `Based on this resume analysis, generate realistic job opportunities that match the candidate's profile:

Resume Analysis:
${JSON.stringify(resumeAnalysis, null, 2)}

User Preferences:
${JSON.stringify(preferences, null, 2)}

Generate 8-12 realistic job matches in this JSON format:
{
  "jobs": [
    {
      "title": "Specific job title",
      "company": "Realistic company name",
      "location": "City, State/Country",
      "type": "Full-time/Part-time/Contract/Remote",
      "salary": "$XX,000 - $XX,000" or "Competitive",
      "experience": "X-Y years",
      "description": "Detailed job description (2-3 sentences)",
      "requirements": [
        "Specific requirement 1",
        "Specific requirement 2",
        "Specific requirement 3"
      ],
      "responsibilities": [
        "Key responsibility 1",
        "Key responsibility 2", 
        "Key responsibility 3"
      ],
      "skills": ["skill1", "skill2", "skill3"],
      "benefits": ["benefit1", "benefit2", "benefit3"],
      "matchScore": 85,
      "matchReasons": [
        "Why this is a good match",
        "Specific skills alignment",
        "Experience relevance"
      ],
      "companyInfo": {
        "size": "Startup/Mid-size/Enterprise",
        "industry": "Industry name",
        "description": "Brief company description"
      },
      "posted": "2024-01-15",
      "applicationUrl": "https://company.com/careers/job-id"
    }
  ],
  "summary": {
    "totalMatches": 10,
    "averageMatchScore": 78,
    "topSkillsInDemand": ["skill1", "skill2", "skill3"],
    "salaryInsights": {
      "averageRange": "$60,000 - $90,000",
      "potentialEarnings": "$70,000 - $100,000",
      "factorsInfluencing": ["Experience", "Skills", "Location"]
    },
    "marketTrends": [
      "Current market trend 1",
      "Current market trend 2"
    ]
  }
}

Requirements:
- Match jobs to candidate's experience level and skills
- Include variety of companies (startups, mid-size, enterprise)
- Realistic salary ranges for the role and location
- Match scores should be based on skills, experience, and requirements alignment
- Include both perfect matches (85%+) and growth opportunities (70-84%)
- Make company names and details realistic but not real companies
- Ensure job descriptions are detailed and specific

Return ONLY valid JSON, no additional text.`

    const result = await aiService.generateResponse(prompt, {
      maxTokens: 2000,
      temperature: 0.7
    })
    const text = result.content
    
    let jobsData
    try {
      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      jobsData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('❌ Failed to parse job search:', parseError)
      console.error('Raw response:', text)
      
      // Fallback job matches
      jobsData = {
        jobs: [
          {
            title: "Software Engineer",
            company: "TechFlow Solutions",
            location: "San Francisco, CA",
            type: "Full-time",
            salary: "$80,000 - $120,000",
            experience: "2-4 years",
            description: "Join our dynamic team to build scalable web applications using modern technologies. Work on exciting projects that impact millions of users.",
            requirements: [
              "3+ years experience with JavaScript/TypeScript",
              "Experience with React or Vue.js",
              "Knowledge of Node.js and Express",
              "Experience with databases (PostgreSQL, MongoDB)"
            ],
            responsibilities: [
              "Develop and maintain web applications",
              "Collaborate with cross-functional teams",
              "Write clean, maintainable code",
              "Participate in code reviews"
            ],
            skills: ["JavaScript", "React", "Node.js", "PostgreSQL"],
            benefits: ["Health insurance", "401k matching", "Flexible hours"],
            matchScore: 87,
            matchReasons: [
              "Strong JavaScript and React experience",
              "Backend development skills align well",
              "Company size matches preference"
            ],
            companyInfo: {
              size: "Mid-size",
              industry: "Technology",
              description: "Innovative software solutions company focused on digital transformation"
            },
            posted: "2024-01-15",
            applicationUrl: "https://techflow.com/careers/software-engineer"
          },
          {
            title: "Frontend Developer",
            company: "DesignHub Inc",
            location: "Austin, TX",
            type: "Full-time",
            salary: "$70,000 - $95,000",
            experience: "2-3 years",
            description: "Create beautiful, responsive user interfaces for our design platform. Work closely with designers to bring creative visions to life.",
            requirements: [
              "Strong HTML, CSS, JavaScript skills",
              "Experience with React",
              "Knowledge of responsive design",
              "Familiarity with design tools"
            ],
            responsibilities: [
              "Build responsive web interfaces",
              "Implement design mockups",
              "Optimize for performance",
              "Ensure cross-browser compatibility"
            ],
            skills: ["React", "CSS", "JavaScript", "HTML"],
            benefits: ["Remote work options", "Learning budget", "Health coverage"],
            matchScore: 82,
            matchReasons: [
              "Strong frontend skills match",
              "React experience is relevant",
              "Growing company with opportunities"
            ],
            companyInfo: {
              size: "Startup",
              industry: "Design Technology",
              description: "Platform for collaborative design and prototyping"
            },
            posted: "2024-01-12",
            applicationUrl: "https://designhub.com/jobs/frontend-dev"
          }
        ],
        summary: {
          totalMatches: 2,
          averageMatchScore: 84,
          topSkillsInDemand: ["JavaScript", "React", "Node.js"],
          salaryInsights: {
            averageRange: "$70,000 - $95,000",
            potentialEarnings: "$80,000 - $120,000",
            factorsInfluencing: ["Experience", "Skills", "Location"]
          },
          marketTrends: [
            "High demand for React developers",
            "Remote work opportunities increasing"
          ]
        }
      }
    }

    // Save job matches to database
    const jobInserts = jobsData.jobs.map((job: any) => ({
      user_id: session.user.id,
      job_title: job.title,
      company: job.company,
      location: job.location,
      salary_range: job.salary,
      match_score: job.matchScore || 75,
      job_data: job,
      source: 'ai_generated'
    }))

    const { data: savedJobs, error: saveError } = await supabase
      .from('job_matches')
      .insert(jobInserts)
      .select()

    if (saveError) {
      console.error('❌ Failed to save job matches:', saveError)
      // Continue without throwing error
    }

    // Log activity
    await supabase.from('user_activities').insert({
      user_id: session.user.id,
      type: 'job_search',
      title: 'Job Search Completed',
      description: `Found ${jobsData.jobs.length} job matches`,
      metadata: { 
        jobCount: jobsData.jobs.length,
        averageMatchScore: jobsData.summary.averageMatchScore,
        topSkills: jobsData.summary.topSkillsInDemand
      }
    })

    return NextResponse.json({
      success: true,
      jobs: jobsData.jobs,
      summary: jobsData.summary,
      message: 'Job search completed successfully'
    })

  } catch (error) {
    console.error('❌ Job search error:', error)
    
    return NextResponse.json({
      error: 'Failed to search for jobs',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}