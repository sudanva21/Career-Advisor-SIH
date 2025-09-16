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

    // Fetch all quiz results for the user, ordered by most recent first
    const { data: results, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching past quiz results:', error)
      return NextResponse.json({ error: 'Failed to fetch quiz results' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      results: results || []
    })

  } catch (error) {
    console.error('Error in GET /api/quiz/past-results:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 })
  }
}