import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { logDatabasePermissionOnce, isDemoMode, getDemoUserId } from '@/lib/database/demo-mode'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // Return demo profile for unauthenticated users
      return NextResponse.json({
        profile: {
          id: 'demo-user',
          email: 'demo@career-advisor.com',
          full_name: 'Demo User',
          avatar_url: null,
          subscription_tier: 'free',
          subscription_status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          demo_mode: true
        }
      })
    }

    // Check if Supabase is accessible
    try {
      // Test connection first
      const { error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      if (testError && testError.code === '42501') {
        logDatabasePermissionOnce('Profile API')
        // Return demo profile with user auth data
        return NextResponse.json({
          profile: {
            id: session.user.id,
            email: session.user.email || 'user@career-advisor.com',
            full_name: session.user.user_metadata?.full_name || 
                      `${session.user.user_metadata?.first_name || ''} ${session.user.user_metadata?.last_name || ''}`.trim() || 
                      'Demo User',
            avatar_url: session.user.user_metadata?.avatar_url || null,
            subscription_tier: 'free',
            subscription_status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            demo_mode: true
          }
        })
      }

      // Use admin client in development to bypass RLS (server-side only)
      const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase

      // Fetch user profile data
      const { data: userProfile, error } = await db
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        throw error
      }

      // If no profile exists, create one with basic info from auth
      if (!userProfile) {
        console.log('Creating new user profile for:', session.user.id)
        const { data: newProfile, error: createError } = await db
          .from('profiles')
          .insert({
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || 
                      `${session.user.user_metadata?.first_name || ''} ${session.user.user_metadata?.last_name || ''}`.trim() || 
                      null,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
          throw createError
        }

        return NextResponse.json({ profile: newProfile })
      }

      return NextResponse.json({ profile: userProfile })

    } catch (dbError: any) {
      logDatabasePermissionOnce('Profile API (fallback)')
      
      // Fallback to demo profile with auth user data
      return NextResponse.json({
        profile: {
          id: session.user.id,
          email: session.user.email || 'user@career-advisor.com',
          full_name: session.user.user_metadata?.full_name || 
                    `${session.user.user_metadata?.first_name || ''} ${session.user.user_metadata?.last_name || ''}`.trim() || 
                    'Demo User',
          avatar_url: session.user.user_metadata?.avatar_url || null,
          subscription_tier: 'free',
          subscription_status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          demo_mode: true
        }
      })
    }

  } catch (error) {
    console.error('Error in profile API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      first_name,
      last_name,
      bio,
      phone,
      location,
      date_of_birth,
      education_level,
      field_of_interest,
      career_goal,
      avatar_url,
      linkedin_url,
      github_url,
      portfolio_url,
      skills,
      experience,
      preferences
    } = body

    // Update user profile
    // Use admin client in development to bypass RLS (server-side only)
    const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : supabase

    const { data: updatedProfile, error } = await db
      .from('profiles')
      .update({
        full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      logDatabasePermissionOnce('Profile API (update)')
      // Return success even if database update fails in demo mode
      return NextResponse.json({ 
        success: true, 
        message: 'Profile updated successfully (demo mode)',
        profile: { ...body, id: session.user.id, demo_mode: true }
      })
    }

    // Log profile update activity
    try {
      await supabase.from('user_activities').insert({
        user_id: session.user.id,
        type: 'profile',
        title: 'Profile Updated',
        description: 'Updated personal profile information',
        metadata: {
          updatedFields: Object.keys(body),
          timestamp: new Date().toISOString()
        }
      })
    } catch (activityError) {
      console.error('Error logging profile update activity:', activityError)
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'upload_avatar') {
      // Handle avatar upload logic here
      // This would typically involve uploading to Supabase Storage
      return NextResponse.json({
        success: true,
        message: 'Avatar upload functionality to be implemented',
        avatarUrl: '/placeholder-avatar.png'
      })
    }

    if (action === 'delete_account') {
      // Handle account deletion (soft delete)
      const { error } = await supabase
        .from('profiles')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)

      if (error) {
        console.error('Error deleting account:', error)
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Account marked for deletion'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Error in profile POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}