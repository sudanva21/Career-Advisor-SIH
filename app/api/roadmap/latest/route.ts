import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'No user ID provided',
        roadmap: null
      })
    }

    // Fetch the most recent roadmap for the user
    const { data: roadmaps, error } = await supabase
      .from('career_roadmaps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Error fetching roadmap:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        roadmap: null
      }, { status: 500 })
    }

    if (!roadmaps || roadmaps.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No roadmaps found for this user',
        roadmap: null
      })
    }

    const latestRoadmap = roadmaps[0]

    // Parse the roadmap data if it's stored as JSON
    let roadmapData = latestRoadmap.roadmap_data
    if (typeof roadmapData === 'string') {
      try {
        roadmapData = JSON.parse(roadmapData)
      } catch (parseError) {
        console.error('Error parsing roadmap data:', parseError)
        return NextResponse.json({
          success: false,
          error: 'Invalid roadmap data format',
          roadmap: null
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      roadmap: {
        id: latestRoadmap.id,
        career_goal: latestRoadmap.career_goal,
        current_level: latestRoadmap.current_level,
        duration_months: latestRoadmap.duration_months,
        phases: roadmapData?.phases || [],
        created_at: latestRoadmap.created_at,
        updated_at: latestRoadmap.updated_at
      }
    })

  } catch (error) {
    console.error('API Error in /api/roadmap/latest:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      roadmap: null
    }, { status: 500 })
  }
}