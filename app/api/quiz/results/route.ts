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
    
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Get user ID - use demo user in development if no session
    const userId = session?.user?.id || getDemoUserId()

    if (!userId && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ 
        error: 'Unauthorized - Please sign in to view quiz results' 
      }, { status: 401 })
    }

    try {
      // Fetch quiz results for the user
      const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase
      const { data: quizResults, error } = await db
        .from('quiz_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (error) {
        console.error('Error fetching quiz results:', error)
        logDatabasePermissionOnce('Quiz Results API')
        
        // Return empty results if database query fails
        return NextResponse.json({ 
          success: true,
          results: [],
          total: 0,
          message: 'No quiz results found'
        })
      }
      
      // Get total count for pagination
      const { count } = await (process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase)
        .from('quiz_results')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      
      console.log(`📊 Found ${quizResults?.length || 0} quiz results for user ${userId}`)
      
      return NextResponse.json({ 
        success: true,
        results: quizResults || [],
        total: count || 0,
        hasMore: offset + limit < (count || 0),
        pagination: {
          limit,
          offset,
          total: count || 0
        }
      })
      
    } catch (dbError) {
      console.error('Database error fetching quiz results:', dbError)
      logDatabasePermissionOnce('Quiz Results API (fallback)')
      
      // Return empty results on database error
      return NextResponse.json({ 
        success: true,
        results: [],
        total: 0,
        message: 'No quiz results found'
      })
    }

  } catch (error) {
    console.error('Error in GET /api/quiz/results:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch quiz results',
      results: [],
      total: 0
    }, { status: 500 })
  }
}