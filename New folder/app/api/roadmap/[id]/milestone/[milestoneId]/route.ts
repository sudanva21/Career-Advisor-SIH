import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; milestoneId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { completed, progress } = await request.json()
    const roadmapId = params.id
    const milestoneId = params.milestoneId

    // Fetch the roadmap
    const { data: roadmap, error: fetchError } = await supabaseAdmin
      .from('career_roadmaps')
      .select('*')
      .eq('id', roadmapId)
      .eq('user_id', session.user.id)
      .single()

    if (fetchError || !roadmap) {
      return NextResponse.json({ 
        error: 'Roadmap not found',
        success: false 
      }, { status: 404 })
    }

    // Parse roadmap data
    let roadmapData = roadmap.roadmap_data
    if (typeof roadmapData === 'string') {
      try {
        roadmapData = JSON.parse(roadmapData)
      } catch (parseError) {
        console.error('❌ Error parsing roadmap data:', parseError)
        return NextResponse.json({
          error: 'Invalid roadmap data format',
          success: false
        }, { status: 500 })
      }
    }

    // Find and update the milestone
    let milestoneFound = false
    if (roadmapData.phases && Array.isArray(roadmapData.phases)) {
      roadmapData.phases.forEach((phase: any) => {
        if (phase.milestones && Array.isArray(phase.milestones)) {
          phase.milestones.forEach((milestone: any) => {
            if (milestone.id === milestoneId) {
              milestone.completed = completed
              if (progress !== undefined) {
                milestone.progress = progress
              }
              milestone.updated_at = new Date().toISOString()
              milestoneFound = true
            }
          })
        }
      })
    }

    if (!milestoneFound) {
      return NextResponse.json({
        error: 'Milestone not found',
        success: false
      }, { status: 404 })
    }

    // Recalculate overall progress
    const totalMilestones = roadmapData.phases.reduce((acc: number, phase: any) => 
      acc + (phase.milestones?.length || 0), 0)
    const completedMilestones = roadmapData.phases.reduce((acc: number, phase: any) => 
      acc + (phase.milestones?.filter((m: any) => m.completed).length || 0), 0)
    const overallProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

    // Update roadmap in database
    const { error: updateError } = await supabaseAdmin
      .from('career_roadmaps')
      .update({
        roadmap_data: roadmapData,
        progress: Math.round(overallProgress),
        updated_at: new Date().toISOString()
      })
      .eq('id', roadmapId)

    if (updateError) {
      console.error('❌ Failed to update roadmap:', updateError)
      throw new Error('Failed to update milestone')
    }

    // Log milestone completion activity
    await supabaseAdmin.from('user_activities').insert({
      user_id: session.user.id,
      type: 'milestone',
      title: completed ? 'Milestone Completed' : 'Milestone Updated',
      description: `${completed ? 'Completed' : 'Updated'} milestone in roadmap: ${roadmap.title}`,
      metadata: { 
        action: completed ? 'complete' : 'update',
        roadmapId,
        milestoneId,
        progress: overallProgress
      }
    })

    return NextResponse.json({
      success: true,
      message: `Milestone ${completed ? 'completed' : 'updated'} successfully`,
      progress: Math.round(overallProgress)
    })

  } catch (error) {
    console.error('❌ Milestone update error:', error)
    
    return NextResponse.json({
      error: 'Failed to update milestone',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}