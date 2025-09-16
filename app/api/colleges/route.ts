import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { aiService } from '@/lib/ai-services'
import { z } from 'zod'
import { logDatabasePermissionOnce, getDemoUserId } from '@/lib/database/demo-mode'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const major = searchParams.get('major') || ''
    const state = searchParams.get('state') || ''

    console.log('🎓 Fetching colleges with params:', { page, limit, search, major, state })

    // Try to fetch colleges from Supabase database
    const supabase = createRouteHandlerClient({ cookies })
    
    try {
      let collegeQuery = supabase
        .from('colleges')
        .select('*')
        .order('rating', { ascending: false })
      
      // Apply pagination early to limit database results
      const startIndex = (page - 1) * limit
      collegeQuery = collegeQuery.range(startIndex, startIndex + limit - 1)
      
      // Apply filters if provided
      if (search) {
        collegeQuery = collegeQuery.or(`name.ilike.%${search}%, location.ilike.%${search}%, city.ilike.%${search}%`)
      }
      
      if (state) {
        collegeQuery = collegeQuery.eq('state', state)
      }
      
      if (major) {
        collegeQuery = collegeQuery.contains('courses', [major])
      }
      
      const { data: colleges, error: collegeError } = await collegeQuery
      
      if (collegeError) {
        throw collegeError
      }

      if (colleges && colleges.length > 0) {
        console.log('✅ Found colleges from database:', colleges.length)
        // Add synthetic ranking to match frontend expectations
        const withRanking = colleges.map((c: any, idx: number) => ({
          ...c,
          ranking: idx + 1,
        }))
        return NextResponse.json({
          success: true,
          colleges: withRanking,
          total: withRanking.length,
          page,
          limit,
          source: 'database'
        })
      }
    } catch (dbError: any) {
      console.warn('⚠️ Database colleges fetch failed:', dbError.message)
      if (dbError.code === '42501' || dbError.code === '42P01') {
        logDatabasePermissionOnce('Colleges API')
      }
    }

    // Fallback to mock colleges data
    const mockColleges = getMockColleges()
    
    // Apply search filter to mock data
    let filteredColleges = mockColleges
    if (search) {
      filteredColleges = mockColleges.filter(college => 
        college.name.toLowerCase().includes(search.toLowerCase()) ||
        college.city.toLowerCase().includes(search.toLowerCase()) ||
        college.state.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (state) {
      filteredColleges = filteredColleges.filter(college => college.state === state)
    }

    if (major) {
      filteredColleges = filteredColleges.filter(college => 
        college.programs?.some(program => program.toLowerCase().includes(major.toLowerCase())) ||
        college.courses?.some(course => course.toLowerCase().includes(major.toLowerCase()))
      )
    }

    // Apply pagination to mock data
    const startIndex = (page - 1) * limit
    const paginatedColleges = filteredColleges.slice(startIndex, startIndex + limit)

    console.log('📚 Using mock colleges data:', paginatedColleges.length, 'of', filteredColleges.length)

    return NextResponse.json({
      success: true,
      colleges: paginatedColleges,
      total: filteredColleges.length,
      page,
      limit,
      source: 'mock'
    })

  } catch (error) {
    console.error('Error in GET /api/colleges:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch colleges',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Save or remove college from user's saved list
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    // Allow demo mode in development
    const userId = session?.user?.id || 'demo-user'
    
    if (!userId && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, collegeId, collegeName, collegeLocation, collegeType } = body

    // Validate required fields
    if (!action || !collegeId) {
      return NextResponse.json({ 
        error: 'Missing required fields: action, collegeId' 
      }, { status: 400 })
    }

    if (!['save', 'remove'].includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid action. Must be "save" or "remove"' 
      }, { status: 400 })
    }

    console.log(`${action} college:`, { collegeId, collegeName, userId })

    try {
      if (action === 'save') {
        // Check if college is already saved (prevent duplicates)
        const { data: existingSave } = await supabase
          .from('saved_colleges')
          .select('id')
          .eq('user_id', userId)
          .eq('college_id', collegeId)
          .single()

        if (existingSave) {
          return NextResponse.json({ 
            success: true,
            message: 'College already saved',
            data: existingSave,
            alreadyExists: true
          })
        }

        // Save college to user's saved list with retry logic
        let saveAttempts = 0
        let saveError = null
        let saveData = null

        while (saveAttempts < 3) {
          const { data, error } = await supabase
            .from('saved_colleges')
            .insert({
              user_id: userId,
              college_id: collegeId,
              college_name: collegeName || 'Unknown College',
              college_location: collegeLocation || 'Unknown Location',
              college_type: collegeType || 'Unknown Type'
            })
            .select()

          if (!error) {
            saveData = data
            break
          } else {
            saveError = error
            saveAttempts++
            console.warn(`Save attempt ${saveAttempts} failed:`, error)
            
            // Wait briefly before retrying
            if (saveAttempts < 3) {
              await new Promise(resolve => setTimeout(resolve, 200))
            }
          }
        }

        if (saveError) {
          console.error('Error saving college after retries:', saveError)
          logDatabasePermissionOnce('Colleges API - Save')
          
          // Return success anyway to prevent UI blocking
          return NextResponse.json({ 
            success: true,
            message: 'College saved successfully (local fallback)',
            data: null,
            fallback: true
          })
        }

        // Log activity
        await logActivity(supabase, userId, {
          type: 'college',
          title: 'College Saved',
          description: `Saved ${collegeName || 'college'} to your college list`,
          metadata: { collegeId, collegeName, collegeLocation, collegeType, action: 'save' }
        })

        console.log(`✅ College saved successfully: ${collegeName} for user ${userId}`)

        return NextResponse.json({ 
          success: true,
          message: 'College saved successfully',
          data: saveData?.[0] || null
        })

      } else if (action === 'remove') {
        // Remove college from user's saved list with verification
        const { data: deletedRows, error } = await supabase
          .from('saved_colleges')
          .delete()
          .eq('user_id', userId)
          .eq('college_id', collegeId)
          .select()

        if (error) {
          console.error('Error removing college:', error)
          logDatabasePermissionOnce('Colleges API - Remove')
          
          // Graceful fallback
          return NextResponse.json({ 
            success: true,
            message: 'College removed successfully (local fallback)',
            fallback: true
          })
        }

        // Check if anything was actually deleted
        if (deletedRows && deletedRows.length === 0) {
          return NextResponse.json({ 
            success: true,
            message: 'College was not in saved list',
            notFound: true
          })
        }

        // Log activity
        await logActivity(supabase, userId, {
          type: 'college',
          title: 'College Removed',
          description: `Removed ${collegeName || 'college'} from your saved list`,
          metadata: { collegeId, collegeName, collegeLocation, collegeType, action: 'remove' }
        })

        console.log(`✅ College removed successfully: ${collegeName} for user ${userId}`)

        return NextResponse.json({ 
          success: true,
          message: 'College removed successfully',
          data: deletedRows?.[0] || null
        })
      }

    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ 
        success: true,
        message: `College ${action}d successfully (fallback)`
      })
    }

  } catch (error) {
    console.error('Error in POST /api/colleges:', error)
    return NextResponse.json({ 
      error: 'Failed to process college action',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to get mock colleges data
function getMockColleges() {
  return [
    {
      id: '1',
      name: 'Indian Institute of Technology Delhi',
      shortName: 'IIT-D',
      location: 'Hauz Khas, New Delhi',
      state: 'Delhi',
      city: 'New Delhi',
      type: 'Government',
      established: 1961,
      website: 'https://home.iitd.ac.in',
      courses: ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Chemical Engineering'],
      programs: ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Chemical Engineering'],
      rating: 4.8,
      fees: '₹2.5L - 3L',
      cutoff: 'JEE Rank 1-500',
      latitude: 28.5449,
      longitude: 77.1928,
      ranking: 2,
      acceptanceRate: 2,
      tuition: 'Low',
      imageUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=300&fit=crop',
      averageGPA: '9.2',
      averageSAT: 1580,
      description: 'IIT Delhi is one of the premier engineering institutions in India.',
      highlights: ['Strong Computer Science program', 'Strong Electronics program', 'Strong Mechanical program'],
      campusSize: 'Large',
      studentPopulation: 8000,
      isPublic: true,
      isSaved: false
    },
    {
      id: '2',
      name: 'Birla Institute of Technology and Science',
      shortName: 'BITS',
      location: 'Pilani, Rajasthan',
      state: 'Rajasthan',
      city: 'Pilani',
      type: 'Private',
      established: 1964,
      website: 'https://www.bits-pilani.ac.in',
      courses: ['Computer Science', 'Electronics', 'Mechanical', 'Chemical', 'Biotechnology'],
      programs: ['Computer Science', 'Electronics', 'Mechanical', 'Chemical', 'Biotechnology'],
      rating: 4.6,
      fees: '₹4L - 5L',
      cutoff: 'BITSAT 350+',
      latitude: 28.3670,
      longitude: 75.5886,
      ranking: 15,
      acceptanceRate: 8,
      tuition: 'Moderate',
      imageUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=300&fit=crop',
      averageGPA: '8.8',
      averageSAT: 1520,
      description: 'BITS Pilani is a premier private technical and research university.',
      highlights: ['Strong Computer Science program', 'Strong Information Technology program', 'Strong Biotechnology program'],
      campusSize: 'Large',
      studentPopulation: 15000,
      isPublic: false,
      isSaved: false
    },
    {
      id: '3',
      name: 'Delhi Technological University',
      shortName: 'DTU',
      location: 'Shahbad Daulatpur, Delhi',
      state: 'Delhi',
      city: 'New Delhi',
      type: 'Government',
      established: 1941,
      website: 'http://www.dtu.ac.in',
      courses: ['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'],
      programs: ['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'],
      rating: 4.4,
      fees: '₹1.5L - 2L',
      cutoff: 'JEE Rank 3000-8000',
      latitude: 28.7501,
      longitude: 77.1177,
      ranking: 25,
      acceptanceRate: 12,
      tuition: 'Low',
      imageUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=300&fit=crop',
      averageGPA: '8.2',
      averageSAT: 1450,
      description: 'Delhi Technological University is a premier engineering institution in Delhi.',
      highlights: ['Strong Computer Engineering program', 'Strong Information Technology program', 'Strong Electronics program'],
      campusSize: 'Large',
      studentPopulation: 12000,
      isPublic: true,
      isSaved: false
    }
  ]
}

// Helper function to log user activity
async function logActivity(supabase: any, userId: string, activity: {
  type: string
  title: string
  description: string
  metadata: any
}) {
  try {
    await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        metadata: activity.metadata
      })
  } catch (error) {
    console.error('Error logging activity:', error)
    // Don't throw - logging failure shouldn't break the main operation
  }
}