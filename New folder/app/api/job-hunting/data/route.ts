import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Fetch user's resume data
    const { data: resumeData } = await supabase
      .from('user_resumes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Fetch job matches
    const { data: jobMatches } = await supabase
      .from('job_matches')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    // Fetch outreach drafts
    const { data: outreachDrafts } = await supabase
      .from('outreach_drafts')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Transform data for frontend
    const transformedData = {
      resumeAnalysis: resumeData?.ai_analysis || null,
      resumeId: resumeData?.id || null,
      jobListings: jobMatches?.map(job => ({
        id: job.id,
        title: job.job_title,
        company: job.company,
        location: job.location,
        salary: job.salary_range,
        type: job.job_data?.type || 'Full-time',
        description: job.job_data?.description || '',
        requirements: job.job_data?.requirements || [],
        posted_date: job.created_at,
        match_score: job.match_score,
        jobData: job.job_data
      })) || [],
      outreachDrafts: outreachDrafts?.map(draft => ({
        id: draft.id,
        type: draft.type,
        content: draft.content,
        job_title: jobMatches?.find(j => j.id === draft.job_id)?.job_title || 'Unknown',
        company: jobMatches?.find(j => j.id === draft.job_id)?.company || 'Unknown',
        personalized: true,
        status: draft.status,
        created_at: draft.created_at
      })) || []
    }

    return NextResponse.json({
      success: true,
      ...transformedData
    })

  } catch (error) {
    console.error('Error in GET /api/job-hunting/data:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 })
  }
}