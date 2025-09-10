import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const roadmapId = params.id

    // Fetch roadmap with all details
    const { data: roadmap, error: fetchError } = await supabaseAdmin
      .from('career_roadmaps')
      .select('*')
      .eq('id', roadmapId)
      .eq('user_id', session.user.id)
      .single()

    if (fetchError) {
      console.error('❌ Failed to fetch roadmap:', fetchError)
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ 
          error: 'Roadmap not found',
          success: false 
        }, { status: 404 })
      }
      throw fetchError
    }

    if (!roadmap) {
      return NextResponse.json({ 
        error: 'Roadmap not found',
        success: false 
      }, { status: 404 })
    }

    // Parse roadmap data if it's stored as JSON string
    let roadmapData = roadmap.roadmap_data
    if (typeof roadmapData === 'string') {
      try {
        roadmapData = JSON.parse(roadmapData)
      } catch (parseError) {
        console.error('❌ Error parsing roadmap data:', parseError)
        roadmapData = { phases: [], nodes: [], connections: [] }
      }
    }

    // Ensure roadmapData has required structure
    if (!roadmapData || typeof roadmapData !== 'object') {
      roadmapData = { phases: [], nodes: [], connections: [] }
    }

    // Calculate progress if not already set
    let calculatedProgress = roadmap.progress || 0
    if (roadmapData.phases && Array.isArray(roadmapData.phases)) {
      const totalMilestones = roadmapData.phases.reduce((acc: number, phase: any) => 
        acc + (phase.milestones?.length || 0), 0)
      const completedMilestones = roadmapData.phases.reduce((acc: number, phase: any) => 
        acc + (phase.milestones?.filter((m: any) => m.completed).length || 0), 0)
      calculatedProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0
    }

    const enhancedRoadmap = {
      id: roadmap.id,
      title: roadmap.title || 'Untitled Roadmap',
      description: roadmap.description || 'No description available',
      career_goal: roadmap.career_goal || 'Career Development',
      current_level: roadmap.current_level || 'beginner',
      duration_months: roadmap.duration_months || 12,
      roadmap_data: roadmapData,
      progress: Math.round(calculatedProgress),
      created_at: roadmap.created_at,
      updated_at: roadmap.updated_at,
      ai_recommendations: roadmap.ai_recommendations || null,
      timeline: roadmap.timeline || null
    }

    return NextResponse.json({
      success: true,
      roadmap: enhancedRoadmap
    })

  } catch (error) {
    console.error('❌ Roadmap fetch error:', error)
    
    return NextResponse.json({
      error: 'Failed to fetch roadmap',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const roadmapId = params.id

    // Check if roadmap belongs to user
    const { data: roadmap, error: fetchError } = await supabaseAdmin
      .from('career_roadmaps')
      .select('userId')
      .eq('id', roadmapId)
      .single()

    if (fetchError || !roadmap) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 })
    }

    if (roadmap.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete the roadmap
    const { error: deleteError } = await supabaseAdmin
      .from('career_roadmaps')
      .delete()
      .eq('id', roadmapId)

    if (deleteError) {
      console.error('❌ Failed to delete roadmap:', deleteError)
      throw new Error('Failed to delete roadmap')
    }

    // Log deletion activity
    await supabaseAdmin.from('user_activities').insert({
      user_id: session.user.id,
      type: 'roadmap',
      title: 'Deleted Career Roadmap',
      description: `Removed roadmap: ${roadmapId}`,
      metadata: { 
        action: 'delete',
        roadmapId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Roadmap deleted successfully'
    })

  } catch (error) {
    console.error('❌ Roadmap deletion error:', error)
    
    return NextResponse.json({
      error: 'Failed to delete roadmap',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}