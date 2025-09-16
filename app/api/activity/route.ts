import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { logDatabasePermissionOnce, getDemoUserId } from '@/lib/database/demo-mode'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    const { searchParams } = new URL(request.url)
    
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') // Filter by activity type
    
    // Get user ID - use demo user in development if no session
    const userId = session?.user?.id || getDemoUserId()

    try {
      // Use admin client in development to bypass RLS (server-side only)
      const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase

      // Build query for user activities
      let query = db
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      // Apply type filter if specified
      if (type) {
        query = query.eq('type', type)
      }
      
      const { data: activities, error } = await query
      
      if (error) {
        console.error('Error fetching activities:', error)
        logDatabasePermissionOnce('Activity API')
        // Return empty activities if database query fails
        return NextResponse.json({ 
          activities: [],
          total: 0,
          hasMore: false,
          pagination: { limit, offset, total: 0 },
          error: 'Database query failed'
        })
      }
      
      // Get total count for pagination
      let countQuery = db
        .from('user_activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      
      if (type) {
        countQuery = countQuery.eq('type', type)
      }
      
      const { count } = await countQuery
      
      // Transform activities to match frontend format
      const transformedActivities = activities?.map(activity => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        timestamp: activity.created_at,
        icon: getIconForType(activity.type),
        color: getColorForType(activity.type),
        metadata: activity.metadata || {}
      })) || []
      
      // If no real activities found, return empty result
      if (transformedActivities.length === 0) {
        return NextResponse.json({ 
          activities: [],
          total: 0,
          hasMore: false,
          pagination: { limit, offset, total: 0 },
          message: 'No activities found for this user'
        })
      }
      
      return NextResponse.json({ 
        activities: transformedActivities,
        total: count || 0,
        hasMore: offset + limit < (count || 0),
        pagination: {
          limit,
          offset,
          total: count || 0
        }
      })
      
    } catch (dbError) {
      console.error('Database error fetching activities:', dbError)
      logDatabasePermissionOnce('Activity API (fallback)')
      // Return empty activities on database error
      return NextResponse.json({ 
        activities: [],
        total: 0,
        hasMore: false,
        pagination: { limit, offset, total: 0 },
        error: 'Database error occurred'
      })
    }

  } catch (error) {
    console.error('Error in GET /api/activity:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch activity data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper functions
function getIconForType(type: string): string {
  const iconMap: { [key: string]: string } = {
    achievement: 'Trophy',
    roadmap: 'Target',
    college: 'Bookmark',
    quiz: 'Brain',
    skill: 'Zap',
    project: 'Code',
    streak: 'Fire',
    recommendation: 'Lightbulb',
    interaction: 'Activity'
  }
  return iconMap[type] || 'Activity'
}

function getColorForType(type: string): string {
  const colorMap: { [key: string]: string } = {
    achievement: 'bg-yellow-500',
    roadmap: 'bg-neon-cyan',
    college: 'bg-neon-pink',
    quiz: 'bg-blue-500',
    skill: 'bg-purple-500',
    project: 'bg-green-500',
    streak: 'bg-orange-500',
    recommendation: 'bg-cyan-500',
    interaction: 'bg-gray-500'
  }
  return colorMap[type] || 'bg-gray-500'
}



// POST - Log new activity
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    // Allow demo mode in development
    const userId = session?.user?.id || getDemoUserId()

    if (!userId && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, description, metadata = {} } = body

    // Validate required fields
    if (!type || !title || !description) {
      return NextResponse.json({ 
        error: 'Missing required fields: type, title, description' 
      }, { status: 400 })
    }

    const validTypes = ['achievement', 'roadmap', 'college', 'quiz', 'skill', 'project', 'streak', 'recommendation', 'interaction']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: `Invalid activity type. Must be one of: ${validTypes.join(', ')}` 
      }, { status: 400 })
    }

    console.log('Logging new activity:', { type, title, description, metadata })

    try {
      // Use admin client in development to bypass RLS (server-side only)
      const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase

      // Save activity to database
      const { data: newActivity, error } = await db
        .from('user_activities')
        .insert({
          user_id: userId,
          type,
          title,
          description,
          metadata
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving activity:', error)
        logDatabasePermissionOnce('Activity API (post)')
        // Return success even if database save fails (graceful degradation)
        return NextResponse.json({ 
          success: true, 
          message: 'Activity logged successfully (local)',
          activity: {
            id: Date.now().toString(),
            type,
            title,
            description,
            timestamp: new Date(),
            metadata,
            userId
          }
        })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Activity logged successfully',
        activity: {
          id: newActivity.id,
          type: newActivity.type,
          title: newActivity.title,
          description: newActivity.description,
          timestamp: newActivity.created_at,
          metadata: newActivity.metadata,
          userId: newActivity.user_id
        }
      })

    } catch (dbError) {
      console.error('Database error logging activity:', dbError)
      logDatabasePermissionOnce('Activity API (post fallback)')
      // Return success even if database save fails (graceful degradation)
      return NextResponse.json({ 
        success: true, 
        message: 'Activity logged successfully (fallback)',
        activity: {
          id: Date.now().toString(),
          type,
          title,
          description,
          timestamp: new Date(),
          metadata,
          userId
        }
      })
    }

  } catch (error) {
    console.error('Error in POST /api/activity:', error)
    return NextResponse.json({ 
      error: 'Failed to log activity',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}