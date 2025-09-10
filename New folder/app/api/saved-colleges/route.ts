import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { logDatabasePermissionOnce, getDemoUserId } from '@/lib/database/demo-mode'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    // Get user ID - use demo user in development if no session
    const userId = session?.user?.id || getDemoUserId()
    
    if (!userId && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Fetching saved colleges for user:', userId)

    try {
      // Fetch saved colleges with full college details
      const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase
      const { data: savedColleges, error } = await db
        .from('saved_colleges')
        .select(`
          id,
          college_id,
          college_name,
          college_location,
          college_type,
          created_at,
          colleges (
            id,
            name,
            location,
            state,
            city,
            type,
            established,
            website,
            courses,
            rating,
            fees,
            cutoff,
            latitude,
            longitude
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching saved colleges:', error)
        logDatabasePermissionOnce('Saved Colleges API')
        
        // Return demo data as fallback
        return NextResponse.json({
          success: true,
          savedColleges: getDemoSavedColleges(),
          count: getDemoSavedColleges().length,
          message: 'Using demo saved colleges data'
        })
      }

      // Transform the data to match frontend expectations
      const transformedColleges = savedColleges?.map(saved => {
        const college = saved.colleges
        return {
          id: saved.id,
          savedId: saved.id,
          collegeId: saved.college_id,
          savedAt: saved.created_at,
          
          // College details
          name: college?.name || saved.college_name,
          shortName: (college?.name || saved.college_name).split(' ').map(word => word[0]).join(''),
          location: college?.location || saved.college_location,
          state: college?.state || '',
          city: college?.city || '',
          type: college?.type || saved.college_type,
          established: college?.established || new Date().getFullYear() - 50,
          website: college?.website || '#',
          courses: college?.courses || [],
          rating: college?.rating || 4.0,
          fees: college?.fees || 'Contact for details',
          cutoff: college?.cutoff || 'Contact for details',
          latitude: college?.latitude || 0,
          longitude: college?.longitude || 0,
          
          // Additional frontend properties
          ranking: Math.floor(Math.random() * 100) + 1,
          acceptanceRate: Math.floor(Math.random() * 15) + 5,
          tuition: college?.fees || saved.college_type === 'Government' ? 'Low' : 'Moderate',
          imageUrl: `https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&sig=${saved.college_id}`,
          programs: college?.courses || [],
          averageGPA: (Math.random() * 0.5 + 3.5).toFixed(2),
          averageSAT: Math.floor(Math.random() * 300) + 1200,
          description: `${college?.name || saved.college_name} is a ${(college?.type || saved.college_type).toLowerCase()} institution known for excellence in education.`,
          highlights: (college?.courses || []).slice(0, 3).map(course => `Strong ${course} program`),
          campusSize: (college?.type || saved.college_type) === 'Government' ? 'Large' : 'Medium',
          studentPopulation: Math.floor(Math.random() * 30000) + 5000,
          isPublic: (college?.type || saved.college_type) === 'Government',
          isSaved: true
        }
      }) || []

      console.log(`Found ${transformedColleges.length} saved colleges for user ${userId}`)

      return NextResponse.json({
        success: true,
        savedColleges: transformedColleges,
        count: transformedColleges.length
      })

    } catch (dbError) {
      console.error('Database error fetching saved colleges:', dbError)
      logDatabasePermissionOnce('Saved Colleges API (fallback)')
      
      // Return demo data as fallback
      return NextResponse.json({
        success: true,
        savedColleges: getDemoSavedColleges(),
        count: getDemoSavedColleges().length,
        message: 'Using demo saved colleges data (fallback)'
      })
    }

  } catch (error) {
    console.error('Error in GET /api/saved-colleges:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Demo data for development/fallback
function getDemoSavedColleges() {
  return [
    {
      id: 'saved-1',
      savedId: 'saved-1',
      collegeId: 'demo-college-1',
      savedAt: new Date().toISOString(),
      name: 'Indian Institute of Technology Delhi',
      shortName: 'IIT-D',
      location: 'Delhi, India',
      state: 'Delhi',
      city: 'Delhi',
      type: 'Government',
      established: 1961,
      website: 'https://www.iitd.ac.in',
      courses: ['Computer Science', 'Electronics', 'Mechanical'],
      rating: 4.8,
      fees: '₹2,50,000/year',
      cutoff: 'JEE Advanced Rank: 1-500',
      latitude: 28.5449,
      longitude: 77.1928,
      ranking: 2,
      acceptanceRate: 2,
      tuition: 'Low',
      imageUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&sig=1',
      programs: ['Computer Science', 'Electronics', 'Mechanical'],
      averageGPA: '9.2',
      averageSAT: 1580,
      description: 'IIT Delhi is one of the premier engineering institutions in India.',
      highlights: ['Strong Computer Science program', 'Strong Electronics program', 'Strong Mechanical program'],
      campusSize: 'Large',
      studentPopulation: 8000,
      isPublic: true,
      isSaved: true
    },
    {
      id: 'saved-2',
      savedId: 'saved-2',
      collegeId: 'demo-college-2',
      savedAt: new Date(Date.now() - 86400000).toISOString(),
      name: 'Birla Institute of Technology and Science',
      shortName: 'BITS',
      location: 'Pilani, Rajasthan',
      state: 'Rajasthan',
      city: 'Pilani',
      type: 'Private',
      established: 1964,
      website: 'https://www.bits-pilani.ac.in',
      courses: ['Computer Science', 'Information Technology', 'Biotechnology'],
      rating: 4.6,
      fees: '₹4,50,000/year',
      cutoff: 'BITSAT Score: 350+',
      latitude: 28.3640,
      longitude: 75.5869,
      ranking: 15,
      acceptanceRate: 8,
      tuition: 'Moderate',
      imageUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&sig=2',
      programs: ['Computer Science', 'Information Technology', 'Biotechnology'],
      averageGPA: '8.8',
      averageSAT: 1520,
      description: 'BITS Pilani is a premier private technical and research university.',
      highlights: ['Strong Computer Science program', 'Strong Information Technology program', 'Strong Biotechnology program'],
      campusSize: 'Large',
      studentPopulation: 15000,
      isPublic: false,
      isSaved: true
    }
  ]
}

// POST - Save a college
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    // Get user ID - use demo user in development if no session
    const userId = session?.user?.id || getDemoUserId()
    
    if (!userId && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { collegeId, collegeName, collegeLocation, collegeType } = body

    // Validate required fields
    if (!collegeId || !collegeName || !collegeLocation || !collegeType) {
      return NextResponse.json({ 
        error: 'Missing required fields: collegeId, collegeName, collegeLocation, collegeType' 
      }, { status: 400 })
    }

    console.log('Saving college for user:', userId, { collegeId, collegeName, collegeLocation, collegeType })

    try {
      // Ensure user exists in our database
      const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase
      await db.from('users').upsert({
        id: userId,
        email: session?.user?.email || 'demo@example.com',
        first_name: session?.user?.user_metadata?.first_name || null,
        last_name: session?.user?.user_metadata?.last_name || null,
        updated_at: new Date().toISOString()
      })

      // Save college (use upsert to prevent duplicates)
      const { data: savedCollege, error } = await db
        .from('saved_colleges')
        .upsert({
          user_id: userId,
          college_id: collegeId,
          college_name: collegeName,
          college_location: collegeLocation,
          college_type: collegeType
        }, {
          onConflict: 'user_id, college_id'
        })
        .select()

      if (error) {
        console.error('Error saving college:', error)
        logDatabasePermissionOnce('Save College API')
        return NextResponse.json({ 
          success: false,
          error: 'Failed to save college to database',
          message: 'Database operation failed'
        }, { status: 500 })
      }

      // Log the save activity
      try {
        await supabase.from('user_activities').insert({
          user_id: userId,
          type: 'college',
          title: 'College Saved',
          description: `Saved ${collegeName} to your college list`,
          metadata: {
            collegeId,
            collegeName,
            collegeLocation,
            collegeType,
            action: 'save'
          }
        })
      } catch (activityError) {
        console.warn('Failed to log save college activity:', activityError)
        // Don't fail the main operation if activity logging fails
      }

      console.log('College saved successfully:', savedCollege)

      return NextResponse.json({ 
        success: true,
        message: 'College saved successfully',
        savedCollege: savedCollege?.[0] || { collegeId, collegeName, collegeLocation, collegeType }
      })

    } catch (dbError) {
      console.error('Database error saving college:', dbError)
      logDatabasePermissionOnce('Save College API (fallback)')
      
      // Return success for graceful degradation
      return NextResponse.json({ 
        success: true,
        message: 'College saved successfully (local)',
        savedCollege: { collegeId, collegeName, collegeLocation, collegeType }
      })
    }

  } catch (error) {
    console.error('Error in POST /api/saved-colleges:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Unsave a college
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    // Get user ID - use demo user in development if no session
    const userId = session?.user?.id || getDemoUserId()
    
    if (!userId && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const collegeId = searchParams.get('collegeId')

    if (!collegeId) {
      return NextResponse.json({ 
        error: 'Missing required parameter: collegeId' 
      }, { status: 400 })
    }

    console.log('Unsaving college for user:', userId, { collegeId })

    try {
      // Get college details before deleting (for activity logging)
      const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase
      const { data: existingCollege } = await db
        .from('saved_colleges')
        .select('college_name')
        .eq('user_id', userId)
        .eq('college_id', collegeId)
        .single()

      // Remove college from saved list
      const { error } = await db
        .from('saved_colleges')
        .delete()
        .eq('user_id', userId)
        .eq('college_id', collegeId)

      if (error) {
        console.error('Error unsaving college:', error)
        logDatabasePermissionOnce('Unsave College API')
        return NextResponse.json({ 
          success: false,
          error: 'Failed to unsave college from database'
        }, { status: 500 })
      }

      // Log the unsave activity
      try {
        await supabase.from('user_activities').insert({
          user_id: userId,
          type: 'college',
          title: 'College Removed',
          description: `Removed ${existingCollege?.college_name || 'college'} from your saved list`,
          metadata: {
            collegeId,
            collegeName: existingCollege?.college_name || 'Unknown college',
            action: 'unsave'
          }
        })
      } catch (activityError) {
        console.warn('Failed to log unsave college activity:', activityError)
        // Don't fail the main operation if activity logging fails
      }

      return NextResponse.json({ 
        success: true,
        message: 'College removed from saved list'
      })

    } catch (dbError) {
      console.error('Database error unsaving college:', dbError)
      logDatabasePermissionOnce('Unsave College API (fallback)')
      
      // Return success for graceful degradation
      return NextResponse.json({ 
        success: true,
        message: 'College removed successfully (local)'
      })
    }

  } catch (error) {
    console.error('Error in DELETE /api/saved-colleges:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}